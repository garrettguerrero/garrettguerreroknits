import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const orderId = session.metadata?.order_id
    const userId = session.metadata?.user_id
    const guestEmail = session.metadata?.guest_email

    console.log('[Verify] Processing order:', { orderId, userId, guestEmail })

    // Process the order and add to library (fallback for when webhook doesn't fire immediately)
    if (orderId) {
      const supabase = createServiceRoleClient()

      // Update order status
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq('id', orderId)

      if (orderUpdateError) {
        console.error('[Verify] Error updating order:', orderUpdateError)
      } else {
        console.log('[Verify] Order status updated to completed')
      }

      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, bundle_id')
        .eq('order_id', orderId)

      if (itemsError) {
        console.error('[Verify] Error fetching order items:', itemsError)
      } else {
        console.log('[Verify] Found order items:', orderItems)
      }

      const email = guestEmail || session.customer_email

      // Add items to library
      if (orderItems) {
        for (const item of orderItems) {
          if (item.product_id) {
            // Add pattern to library
            const libraryData: any = {
              product_id: item.product_id,
              acquired_via: 'purchase',
            }

            if (userId && userId !== '') {
              libraryData.user_id = userId
              console.log('[Verify] Adding pattern to library for user:', userId)
            } else if (email) {
              libraryData.email = email
              console.log('[Verify] Adding pattern to library for email:', email)
            }

            const { error: libraryError } = await supabase.from('library').insert(libraryData)

            if (libraryError) {
              console.error('[Verify] Error adding to library:', libraryError)
            } else {
              console.log('[Verify] Pattern added to library successfully')
            }
          } else if (item.bundle_id) {
            // Get bundle patterns and add to library
            const { data: bundleItems, error: bundleError } = await supabase
              .from('bundle_items')
              .select('product_id')
              .eq('bundle_id', item.bundle_id)

            if (bundleError) {
              console.error('[Verify] Error fetching bundle items:', bundleError)
            } else if (bundleItems) {
              console.log('[Verify] Found bundle items:', bundleItems)
              for (const bundleItem of bundleItems) {
                const libraryData: any = {
                  product_id: bundleItem.product_id,
                  acquired_via: 'bundle',
                }

                if (userId && userId !== '') {
                  libraryData.user_id = userId
                } else if (email) {
                  libraryData.email = email
                }

                const { error: libraryError } = await supabase.from('library').insert(libraryData)

                if (libraryError) {
                  console.error('[Verify] Error adding bundle pattern to library:', libraryError)
                } else {
                  console.log('[Verify] Bundle pattern added to library successfully')
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      orderId: session.metadata?.order_id,
      email: session.customer_email,
      amount: session.amount_total ? session.amount_total / 100 : 0,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
