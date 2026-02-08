'use client'

import { XCircle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutCanceledPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Checkout Canceled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your order was not completed. Don't worry, nothing was charged.
          </p>

          <div className="space-y-4">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              Return to Checkout
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

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Your cart items are still saved. When you're ready, you can complete your
              checkout anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
