'use client'

import Link from 'next/link'
import AuthButton from './AuthButton'
import CartButton from './cart/CartButton'
import CartDrawer from './cart/CartDrawer'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cart-store'

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    let previousUserId: string | null = null

    // Get user
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      previousUserId = user?.id ?? null
    }

    loadUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      const newUserId = newUser?.id ?? null

      // Clear cart if user changed (logout, login as different user, or switch accounts)
      if (previousUserId !== newUserId) {
        clearCart()
      }

      previousUserId = newUserId
      setUser(newUser)
    })

    return () => subscription.unsubscribe()
  }, [supabase, clearCart])

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              Garrett Guerrero Knits
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/marketplace"
              className="text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Patterns
            </Link>
            <Link
              href="/bundles"
              className="text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Bundles
            </Link>
            {user && (
              <Link
                href="/favorites"
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                Favorites
              </Link>
            )}
          </div>

          {/* Right side: Cart + Auth */}
          <div className="flex items-center gap-6">
            {/* Cart Button */}
            <CartButton onClick={() => setIsCartOpen(true)} />

            {/* Auth Button */}
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  )
}
