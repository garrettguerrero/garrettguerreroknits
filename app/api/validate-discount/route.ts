import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch discount code
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !discount) {
      return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 })
    }

    // Check if expired
    if (discount.valid_until && new Date(discount.valid_until) < new Date()) {
      return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 })
    }

    // Check minimum order amount
    if (discount.min_order_amount && orderTotal < discount.min_order_amount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${discount.min_order_amount} required`,
        },
        { status: 400 }
      )
    }

    // Check usage limit
    if (discount.max_uses && discount.times_used >= discount.max_uses) {
      return NextResponse.json(
        { error: 'This discount code has reached its usage limit' },
        { status: 400 }
      )
    }

    return NextResponse.json({ discount })
  } catch (error) {
    console.error('Error validating discount:', error)
    return NextResponse.json({ error: 'Failed to validate discount code' }, { status: 500 })
  }
}
