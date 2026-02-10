'use client'

import { ShoppingCart, Check, Download, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import FreePatternModal from './FreePatternModal'

interface AddToCartButtonProps {
  productId: string
  title: string
  price: number
  slug: string
  coverImage?: string
  isFree?: boolean
}

export default function AddToCartButton({
  productId,
  title,
  price,
  slug,
  coverImage,
  isFree = false
}: AddToCartButtonProps) {
  const router = useRouter()
  const { addItem, hasItem } = useCartStore()
  const inCart = hasItem(productId, 'pattern')
  const [showFreeModal, setShowFreeModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [supabase])

  const handleClick = async () => {
    if (isFree) {
      // Free patterns: Add directly to library if authenticated, show modal if guest
      if (user) {
        // Authenticated user: Add directly to library
        setLoading(true)
        try {
          const response = await fetch('/api/free-pattern/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              patternId: productId,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Failed to add pattern')
          }

          toast.success('✓ Pattern added to your library!')
          router.push('/library')
        } catch (error: any) {
          const message = error.message === 'Pattern already in your library'
            ? 'You already have this pattern in your library'
            : 'Oops! Unable to add pattern. Please try again.'
          toast.error(message)
        } finally {
          setLoading(false)
        }
      } else {
        // Guest user: Show modal for email collection
        setShowFreeModal(true)
      }
    } else {
      // Paid patterns: Add to cart
      if (inCart) {
        toast.success('Pattern is already in your cart')
        return
      }

      addItem({
        id: productId,
        type: 'pattern',
        title,
        price,
        slug,
        coverImage
      })

      toast.success('Added to cart!')
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full px-6 py-3 font-medium rounded-lg transition ${
          inCart
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : isFree
            ? 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {inCart ? (
          <>
            <Check className="w-5 h-5" />
            In Cart
          </>
        ) : isFree ? (
          loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Add to Library
            </>
          )
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </button>

      <FreePatternModal
        isOpen={showFreeModal}
        onClose={() => setShowFreeModal(false)}
        patternId={productId}
        patternTitle={title}
        isAuthenticated={!!user}
        userEmail={user?.email}
      />
    </>
  )
}
