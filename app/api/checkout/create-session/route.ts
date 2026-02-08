import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

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
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount)

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: `${item.type === 'bundle' ? 'Bundle' : 'Pattern'} - Digital Download`,
          images: item.coverImage ? [item.coverImage] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: 1,
    }))

    // Create Stripe coupon for discount if applicable
    let stripeCoupon = null
    if (discountAmount > 0 && discountCode) {
      const { data: discountData } = await supabase
        .from('discount_codes')
        .select('discount_type, discount_value')
        .eq('code', discountCode.toUpperCase())
        .single()

      if (discountData) {
        // Create or get existing coupon
        try {
          stripeCoupon = await stripe.coupons.create({
            id: `${discountCode.toUpperCase()}_${Date.now()}`,
            name: `Discount: ${discountCode}`,
            amount_off: discountData.discount_type === 'fixed'
              ? Math.round(discountData.discount_value * 100)
              : undefined,
            percent_off: discountData.discount_type === 'percentage'
              ? discountData.discount_value
              : undefined,
            currency: 'usd',
            duration: 'once',
          })
        } catch (error) {
          console.error('Error creating Stripe coupon:', error)
          // Continue without coupon if creation fails
        }
      }
    }

    // Create temporary order record to link to Stripe session
    const orderData: any = {
      total_amount: subtotal,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      status: 'pending',
      discount_code_id: discountCodeId,
    }

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

    // Create order items
    for (const item of items) {
      await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_id: item.type === 'pattern' ? item.id : null,
        bundle_id: item.type === 'bundle' ? item.id : null,
        price_at_purchase: item.price,
        quantity: 1,
      })
    }

    // Create Stripe checkout session
    const sessionData: Stripe.Checkout.SessionCreateParams = {
      customer_email: email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/canceled`,
      metadata: {
        order_id: order.id,
        user_id: user?.id || '',
        guest_email: user ? '' : email,
        discount_code: discountCode || '',
      },
    }

    // Add coupon if created successfully
    if (stripeCoupon) {
      sessionData.discounts = [{
        coupon: stripeCoupon.id,
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionData)

    // Update order with Stripe session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
