'use client'

import { ShoppingCart } from 'lucide-react'

export default function AddBundleToCartButton({ bundleId }: { bundleId: string }) {
  const handleAddToCart = () => {
    // TODO: Add to cart functionality in Sprint 4
    console.log('Add bundle to cart:', bundleId)
  }

  return (
    <button
      onClick={handleAddToCart}
      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition mb-3"
    >
      <ShoppingCart className="w-5 h-5" />
      Add Bundle to Cart
    </button>
  )
}
