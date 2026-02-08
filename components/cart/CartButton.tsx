'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { useEffect, useState } from 'react'

interface CartButtonProps {
  onClick: () => void
}

export default function CartButton({ onClick }: CartButtonProps) {
  const itemCount = useCartStore((state) => state.items.length)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-6 h-6" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  )
}
