'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import AuthButton from './AuthButton'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get user and cart count
    const loadUserAndCart = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { count } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setCartCount(count || 0)
      }
    }

    loadUserAndCart()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setCartCount(0)
      } else {
        loadUserAndCart()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

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
            {/* Cart Icon */}
            {user && (
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Button */}
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
