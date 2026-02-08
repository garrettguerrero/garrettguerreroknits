import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, items, discountCode } = await request.json()

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // Get current user (if logged in)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0)
    let discountAmount = 0
    let discountCodeId = null

    // Apply discount if provided
    if (discountCode) {
      const { data: discount } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (discount) {
        discountAmount =
          discount.discount_type === 'percentage'
            ? (subtotal * discount.discount_value) / 100
            : discount.discount_value
        discountCodeId = discount.id

        // Increment usage count
        await supabase
          .from('discount_codes')
          .update({ times_used: discount.times_used + 1 })
          .eq('id', discount.id)
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount)

    // Create order
    const orderData: any = {
      total_amount: subtotal,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      status: 'completed',
      discount_code_id: discountCodeId,
    }

    // Set user_id or guest_email
    if (user) {
      orderData.user_id = user.id
    } else {
      orderData.guest_email = email
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items and add to library
    for (const item of items) {
      // Create order item
      await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_id: item.type === 'pattern' ? item.id : null,
        bundle_id: item.type === 'bundle' ? item.id : null,
        price_at_purchase: item.price,
        quantity: 1,
      })

      // Add to library
      if (item.type === 'pattern') {
        const libraryData: any = {
          product_id: item.id,
          acquired_via: 'free_download',
        }

        if (user) {
          libraryData.user_id = user.id
        } else {
          libraryData.email = email
        }

        await supabaseAdmin.from('library').insert(libraryData)
      } else if (item.type === 'bundle') {
        // Get bundle patterns
        const { data: bundleItems } = await supabase
          .from('bundle_items')
          .select('product_id')
          .eq('bundle_id', item.id)

        if (bundleItems) {
          for (const bundleItem of bundleItems) {
            const libraryData: any = {
              product_id: bundleItem.product_id,
              acquired_via: 'bundle',
            }

            if (user) {
              libraryData.user_id = user.id
            } else {
              libraryData.email = email
            }

            // Insert only if not already in library
            await supabaseAdmin
              .from('library')
              .upsert(libraryData, {
                onConflict: user ? 'user_id,product_id' : 'email,product_id',
                ignoreDuplicates: true,
              })
          }
        }
      }
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Free checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
