'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from 'react-hot-toast'

interface AddBundleToCartButtonProps {
  bundleId: string
  title: string
  price: number
  slug: string
  coverImage?: string
}

export default function AddBundleToCartButton({
  bundleId,
  title,
  price,
  slug,
  coverImage
}: AddBundleToCartButtonProps) {
  const { addItem, hasItem } = useCartStore()
  const inCart = hasItem(bundleId, 'bundle')

  const handleAddToCart = () => {
    if (inCart) {
      toast.success('Bundle is already in your cart')
      return
    }

    addItem({
      id: bundleId,
      type: 'bundle',
      title,
      price,
      slug,
      coverImage
    })

    toast.success('Bundle added to cart!')
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center gap-2 w-full px-6 py-3 font-medium rounded-lg transition mb-3 ${
        inCart
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      }`}
    >
      {inCart ? (
        <>
          <Check className="w-5 h-5" />
          In Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Add Bundle to Cart
        </>
      )}
    </button>
  )
}
