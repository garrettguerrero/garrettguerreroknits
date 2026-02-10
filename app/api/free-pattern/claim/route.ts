import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { render } from '@react-email/render'
import FreePatternEmail from '@/lib/email/templates/FreePatternEmail'

export async function POST(request: NextRequest) {
  try {
    const { email, patternId } = await request.json()

    if (!email || !patternId) {
      return NextResponse.json({ error: 'Email and pattern ID are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // Get current user (if logged in)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Verify pattern exists and is free
    const { data: pattern, error: patternError } = await supabase
      .from('products')
      .select('id, title, slug, price, is_published')
      .eq('id', patternId)
      .single()

    if (patternError || !pattern) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 })
    }

    if (!pattern.is_published) {
      return NextResponse.json({ error: 'Pattern is not available' }, { status: 400 })
    }

    if (Number(pattern.price) !== 0) {
      return NextResponse.json({ error: 'This pattern is not free' }, { status: 400 })
    }

    // Check if pattern already in library
    const libraryCheck = user
      ? await supabase
          .from('library')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', patternId)
          .maybeSingle()
      : await supabase
          .from('library')
          .select('id')
          .eq('email', email)
          .eq('product_id', patternId)
          .maybeSingle()

    if (libraryCheck.data) {
      // Pattern already claimed, send email anyway
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const downloadUrl = user
        ? `${appUrl}/library`
        : `${appUrl}/api/download/${patternId}?email=${encodeURIComponent(email)}`

      try {
        const emailHtml = await render(
          FreePatternEmail({
            patternTitle: pattern.title,
            downloadUrl,
            patternSlug: pattern.slug,
            appUrl,
          })
        )

        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Your Free Pattern: ${pattern.title} 🧶`,
          html: emailHtml,
        })
      } catch (emailError) {
        console.error('Free pattern email error:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Pattern already in your library. Email sent!',
        patternSlug: pattern.slug,
      })
    }

    // Add to library
    const libraryData: any = {
      product_id: patternId,
      acquired_via: 'free_download',
    }

    if (user) {
      libraryData.user_id = user.id
    } else {
      libraryData.email = email
    }

    const { error: libraryError } = await supabaseAdmin.from('library').insert(libraryData)

    if (libraryError) {
      // Handle duplicate key error (23505) - pattern was already claimed
      if (libraryError.code === '23505') {
        // Continue to send email even though insert failed due to duplicate
      } else {
        // Other database errors should fail the request
        console.error('Library insert error:', libraryError)
        return NextResponse.json({ error: 'Failed to add pattern to library' }, { status: 500 })
      }
    }

    // Create a "free order" record for tracking
    const orderData: any = {
      total_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      status: 'completed',
    }

    if (user) {
      orderData.user_id = user.id
    } else {
      orderData.guest_email = email
    }

    const { data: order } = await supabaseAdmin.from('orders').insert(orderData).select().single()

    if (order) {
      // Create order item
      await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_id: patternId,
        price_at_purchase: 0,
        quantity: 1,
      })
    }

    // Send email with download link (for guests or as confirmation for users)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const downloadUrl = user
      ? `${appUrl}/library`
      : `${appUrl}/api/download/${patternId}?email=${encodeURIComponent(email)}`

    try {
      const emailHtml = await render(
        FreePatternEmail({
          patternTitle: pattern.title,
          downloadUrl,
          patternSlug: pattern.slug,
          appUrl,
        })
      )

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your Free Pattern: ${pattern.title} 🧶`,
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Free pattern email error:', emailError)
      // Don't fail the request if email fails - pattern is already in library
    }

    // Add to Resend audience (optional)
    try {
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID || '',
      })
    } catch {
      // Audience ID not configured - skip silently
    }

    return NextResponse.json({
      success: true,
      patternSlug: pattern.slug,
    })
  } catch (error: any) {
    console.error('Free pattern claim error:', error?.message || error)
    return NextResponse.json({
      error: 'Failed to claim pattern',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
