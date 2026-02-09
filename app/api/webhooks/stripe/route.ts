import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session)
        }
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleSuccessfulPayment(session)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleFailedPayment(session)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id
  const userId = session.metadata?.user_id
  const guestEmail = session.metadata?.guest_email
  const discountCode = session.metadata?.discount_code

  if (!orderId) {
    console.error('No order ID in session metadata')
    return
  }

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('id', orderId)

  // Increment discount code usage if applicable
  if (discountCode) {
    const { data: discount } = await supabase
      .from('discount_codes')
      .select('times_used')
      .eq('code', discountCode)
      .single()

    if (discount) {
      await supabase
        .from('discount_codes')
        .update({ times_used: discount.times_used + 1 })
        .eq('code', discountCode)
    }
  }

  // Get order items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, bundle_id')
    .eq('order_id', orderId)

  if (!orderItems) return

  const email = guestEmail || session.customer_email

  // Add items to library
  for (const item of orderItems) {
    if (item.product_id) {
      // Add pattern to library
      const libraryData: any = {
        product_id: item.product_id,
        acquired_via: 'purchase',
      }

      if (userId) {
        libraryData.user_id = userId
      } else if (email) {
        libraryData.email = email
      }

      await supabase.from('library').upsert(libraryData, {
        onConflict: userId ? 'user_id,product_id' : 'email,product_id',
        ignoreDuplicates: true,
      })
    } else if (item.bundle_id) {
      // Get bundle patterns and add to library
      const { data: bundleItems } = await supabase
        .from('bundle_items')
        .select('product_id')
        .eq('bundle_id', item.bundle_id)

      if (bundleItems) {
        for (const bundleItem of bundleItems) {
          const libraryData: any = {
            product_id: bundleItem.product_id,
            acquired_via: 'bundle',
          }

          if (userId) {
            libraryData.user_id = userId
          } else if (email) {
            libraryData.email = email
          }

          await supabase.from('library').upsert(libraryData, {
            onConflict: userId ? 'user_id,product_id' : 'email,product_id',
            ignoreDuplicates: true,
          })
        }
      }
    }
  }

  console.log(`Order ${orderId} completed successfully`)
}

async function handleFailedPayment(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id

  if (!orderId) return

  // Update order status to failed
  await supabase
    .from('orders')
    .update({ status: 'failed' })
    .eq('id', orderId)

  console.log(`Order ${orderId} payment failed`)
}
