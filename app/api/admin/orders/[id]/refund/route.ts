import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, supabase } = await checkAdmin()

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order can be refunded
    if (order.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed orders can be refunded' },
        { status: 400 }
      )
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No payment information found' },
        { status: 400 }
      )
    }

    // Process refund through Stripe
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
      })

      if (refund.status !== 'succeeded' && refund.status !== 'pending') {
        throw new Error('Refund failed')
      }
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError)
      return NextResponse.json(
        {
          error:
            stripeError.message || 'Failed to process refund through Stripe',
        },
        { status: 500 }
      )
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', id)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Refund processed but failed to update order status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
    })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
