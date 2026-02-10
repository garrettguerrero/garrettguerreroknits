'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useCartStore } from '@/lib/store/cart-store'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    let previousUserId: string | null = null

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      previousUserId = user?.id ?? null
      setLoading(false)
    })

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
  }, [supabase.auth, clearCart])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearCart() // Clear cart on sign out
    toast.success('Signed out successfully')
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/library"
          className="text-gray-700 hover:text-gray-900 font-medium transition"
        >
          My Library
        </Link>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
      >
        Sign In
      </Link>
      <Link
        href="/auth/signup"
        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Sign Up
      </Link>
    </div>
  )
}
