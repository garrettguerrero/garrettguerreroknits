'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart-store'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Tag, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/marketplace')
      return
    }

    // Get user
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user?.email) {
        setEmail(user.email)
      }
    }
    loadUser()
  }, [items, router, supabase])

  const subtotal = getTotal()
  const discountAmount = appliedDiscount
    ? appliedDiscount.discount_type === 'percentage'
      ? (subtotal * appliedDiscount.discount_value) / 100
      : appliedDiscount.discount_value
    : 0
  const total = Math.max(0, subtotal - discountAmount)
  const isFree = total === 0

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, orderTotal: subtotal }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Invalid discount code')
        return
      }

      setAppliedDiscount(data.discount)
      toast.success(`Discount applied: ${data.discount.code}`)
    } catch (error) {
      toast.error('Failed to apply discount code')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
    toast.success('Discount removed')
  }

  const handleCheckout = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setProcessingPayment(true)

    try {
      if (isFree) {
        // Handle free checkout
        const response = await fetch('/api/checkout/free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            items,
            discountCode: appliedDiscount?.code,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Checkout failed')
        }

        clearCart()
        router.push(`/checkout/success?order_id=${data.orderId}`)
      } else {
        // Handle paid checkout with Stripe
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            items,
            discountCode: appliedDiscount?.code,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session')
        }

        // Redirect to Stripe checkout
        window.location.href = data.url
      }
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed')
      setProcessingPayment(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!user}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  {user
                    ? 'Patterns will be added to your account'
                    : 'We\'ll send your patterns to this email. Create an account later to access them anytime.'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items ({items.length})
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex gap-4">
                    <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.coverImage ? (
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Discount Code
              </h2>
              {appliedDiscount ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{appliedDiscount.code}</p>
                      <p className="text-sm text-green-700">
                        {appliedDiscount.discount_type === 'percentage'
                          ? `${appliedDiscount.discount_value}% off`
                          : `$${appliedDiscount.discount_value} off`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveDiscount}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={loading || !discountCode.trim()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{isFree ? 'Free' : `$${total.toFixed(2)}`}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processingPayment || !email}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : isFree ? (
                  'Complete Order'
                ) : (
                  'Proceed to Payment'
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                {isFree
                  ? 'Your patterns will be sent to your email immediately'
                  : 'You will be redirected to Stripe for secure payment'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
