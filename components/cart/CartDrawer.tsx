'use client'

import { X, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart-store'
import { useEffect, useState } from 'react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, getTotal, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering cart after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const total = getTotal()
  const itemCount = items.length

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-gray-900" />
            <h2 className="text-xl font-serif font-bold text-gray-900">
              Shopping Cart
            </h2>
            {itemCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 h-[calc(100vh-280px)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-500 mb-6">
                Discover beautiful patterns and start your next project! 🧶
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse Patterns
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex gap-4 bg-gray-50 rounded-lg p-4"
              >
                {/* Item Image */}
                <div className="relative w-20 h-20 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
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

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${item.type === 'bundle' ? 'bundles' : 'patterns'}/${item.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                    onClick={onClose}
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {item.type}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id, item.type)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 self-start"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="text-gray-900">Subtotal</span>
              <span className="text-gray-900">
                {total === 0 ? 'Free' : `$${total.toFixed(2)}`}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full px-6 py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Proceed to Checkout
            </Link>

            {/* Clear Cart */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your cart?')) {
                  clearCart()
                }
              }}
              className="w-full text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
