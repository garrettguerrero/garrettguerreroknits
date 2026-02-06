'use client'

import { ShoppingCart } from 'lucide-react'

export default function AddToCartButton({
  productId,
  isFree = false
}: {
  productId: string
  isFree?: boolean
}) {
  const handleAddToCart = () => {
    // TODO: Add to cart functionality in Sprint 4
    console.log('Add to cart:', productId)
  }

  return (
    <button
      onClick={handleAddToCart}
      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
    >
      <ShoppingCart className="w-5 h-5" />
      {isFree ? 'Get Free Pattern' : 'Add to Cart'}
    </button>
  )
}
