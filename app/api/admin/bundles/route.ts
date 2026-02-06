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

export async function POST(request: Request) {
  try {
    const { authorized, supabase } = await checkAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pattern_ids, ...bundleData } = body

    // Insert bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .insert(bundleData)
      .select()
      .single()

    if (bundleError) {
      console.error('Database error:', bundleError)
      return NextResponse.json(
        { error: 'Failed to create bundle' },
        { status: 500 }
      )
    }

    // Insert bundle items
    if (pattern_ids && pattern_ids.length > 0) {
      const bundleItems = pattern_ids.map((product_id: string) => ({
        bundle_id: bundle.id,
        product_id,
      }))

      const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(bundleItems)

      if (itemsError) {
        console.error('Bundle items error:', itemsError)
        // Delete the bundle if items failed to insert
        await supabase.from('bundles').delete().eq('id', bundle.id)
        return NextResponse.json(
          { error: 'Failed to create bundle items' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Create bundle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
