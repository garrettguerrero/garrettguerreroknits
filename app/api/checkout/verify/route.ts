import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { resend, FROM_EMAIL } from '@/lib/email/resend'
import { render } from '@react-email/render'
import PurchaseConfirmationEmail from '@/lib/email/templates/PurchaseConfirmationEmail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
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

      // Send purchase confirmation email
      const customerEmail = guestEmail || session.customer_email
      if (customerEmail && orderItems && orderItems.length > 0) {
        try {
          // Fetch order details
          const { data: order } = await supabase
            .from('orders')
            .select('id, total_amount, discount_amount, final_amount')
            .eq('id', orderId)
            .single()

          // Fetch item details for email
          const itemDetails = []
          for (const item of orderItems) {
            if (item.product_id) {
              const { data: product } = await supabase
                .from('products')
                .select('title, price')
                .eq('id', item.product_id)
                .single()

              if (product) {
                itemDetails.push({
                  title: product.title,
                  price: product.price,
                  type: 'pattern' as const,
                })
              }
            } else if (item.bundle_id) {
              const { data: bundle } = await supabase
                .from('bundles')
                .select('title, price')
                .eq('id', item.bundle_id)
                .single()

              if (bundle) {
                itemDetails.push({
                  title: bundle.title,
                  price: bundle.price,
                  type: 'bundle' as const,
                })
              }
            }
          }

          if (order && itemDetails.length > 0) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

            const emailHtml = await render(
              PurchaseConfirmationEmail({
                orderId: order.id,
                items: itemDetails,
                subtotal: order.total_amount || 0,
                discount: order.discount_amount || 0,
                total: order.final_amount || 0,
                customerEmail,
                appUrl,
              })
            )

            await resend.emails.send({
              from: FROM_EMAIL,
              to: customerEmail,
              subject: 'Order Confirmation - Your Patterns Are Ready! 🧶',
              html: emailHtml,
            })

            console.log('[Verify] Purchase confirmation email sent to:', customerEmail)
          }
        } catch (emailError) {
          console.error('[Verify] Failed to send purchase confirmation email:', emailError)
          // Don't fail the request if email fails - purchase is already complete
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
