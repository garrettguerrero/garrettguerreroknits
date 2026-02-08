'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart-store'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const { clearCart } = useCartStore()

  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    // Clear the cart when landing on success page
    clearCart()

    // If we have a session_id, verify the payment was successful
    if (sessionId) {
      const verifyPayment = async () => {
        try {
          const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
          const data = await response.json()

          if (response.ok) {
            setOrderDetails(data)
          } else {
            console.error('Payment verification failed:', data.error)
          }
        } catch (error) {
          console.error('Error verifying payment:', error)
        } finally {
          setLoading(false)
        }
      }

      verifyPayment()
    } else if (orderId) {
      // Free order - just show success
      setLoading(false)
    } else {
      // No session_id or order_id, redirect to home
      router.push('/')
    }
  }, [sessionId, orderId, router, clearCart])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Order Complete!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your patterns are ready to download.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{orderDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-medium text-gray-900">
                    ${orderDetails.amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-5 h-5" />
              View My Library
            </Link>

            <div>
              <Link
                href="/marketplace"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>What's next?</strong> We've sent a confirmation email with your
              order details. Your patterns have been added to your library and are ready
              to download anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
