import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // Get current user (if logged in)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get pattern details
    const { data: pattern, error: patternError } = await supabase
      .from('products')
      .select('id, title, pdf_storage_path')
      .eq('id', productId)
      .single()

    if (patternError || !pattern) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 })
    }

    if (!pattern.pdf_storage_path) {
      return NextResponse.json({ error: 'PDF not available' }, { status: 404 })
    }

    // Check if user owns the pattern
    const libraryQuery = user
      ? supabase
          .from('library')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
      : supabase
          .from('library')
          .select('id')
          .eq('email', request.nextUrl.searchParams.get('email') || '')
          .eq('product_id', productId)

    const { data: libraryItem } = await libraryQuery.single()

    if (!libraryItem) {
      return NextResponse.json(
        { error: 'You do not own this pattern' },
        { status: 403 }
      )
    }

    // Generate signed URL (valid for 60 seconds)
    // Use service role client to bypass RLS for private bucket access
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('patterns')
      .createSignedUrl(pattern.pdf_storage_path, 60)

    if (urlError || !signedUrlData) {
      console.error('Failed to generate signed URL:', urlError)
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      )
    }

    // Increment download count (use admin client to bypass RLS)
    await supabaseAdmin.rpc('increment_download_count', { pattern_id: productId })

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrlData.signedUrl)
  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
