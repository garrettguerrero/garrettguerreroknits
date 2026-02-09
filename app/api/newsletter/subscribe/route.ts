import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { render } from '@react-email/render'
import NewsletterWelcomeEmail from '@/lib/email/templates/NewsletterWelcomeEmail'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Update user's profile
      const { error } = await supabase
        .from('profiles')
        .update({ newsletter_subscribed: true })
        .eq('id', user.id)

      if (error) {
        console.error('Newsletter subscription error:', error)
        return NextResponse.json(
          { error: 'Failed to subscribe' },
          { status: 500 }
        )
      }
    }

    // Send welcome email via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    try {
      const emailHtml = await render(NewsletterWelcomeEmail({ appUrl }))

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to Garrett Guerrero Knits! 🧶',
        html: emailHtml,
      })

      console.log('Newsletter welcome email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the whole request if email fails
    }

    // Add to Resend audience (optional, for segmentation)
    try {
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID || '',
      })
    } catch (audienceError) {
      console.log('Note: Could not add to audience (may not be configured):', audienceError)
      // This is optional, so we don't fail the request
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
