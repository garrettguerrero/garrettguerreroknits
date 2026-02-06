import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, user: null, supabase }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return {
    authorized: profile?.is_admin || false,
    user,
    supabase,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, supabase } = await checkAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('bundles')
      .select('*, bundle_items(product_id)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get bundle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, supabase } = await checkAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pattern_ids, ...bundleData } = body

    // Update bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .update(bundleData)
      .eq('id', id)
      .select()
      .single()

    if (bundleError) {
      console.error('Database error:', bundleError)
      return NextResponse.json(
        { error: 'Failed to update bundle' },
        { status: 500 }
      )
    }

    // Update bundle items if pattern_ids provided
    if (pattern_ids) {
      // Delete existing items
      await supabase.from('bundle_items').delete().eq('bundle_id', id)

      // Insert new items
      if (pattern_ids.length > 0) {
        const bundleItems = pattern_ids.map((product_id: string) => ({
          bundle_id: id,
          product_id,
        }))

        const { error: itemsError } = await supabase
          .from('bundle_items')
          .insert(bundleItems)

        if (itemsError) {
          console.error('Bundle items error:', itemsError)
        }
      }
    }

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Update bundle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, supabase } = await checkAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('bundles')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update bundle' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Patch bundle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, supabase } = await checkAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('bundles').delete().eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete bundle' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete bundle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
