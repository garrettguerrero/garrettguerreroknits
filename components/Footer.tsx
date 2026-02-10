'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message = data.error === 'Email already subscribed'
          ? 'You\'re already subscribed! 🎉'
          : data.error || 'Unable to subscribe. Please try again.'
        toast.error(message)
        return
      }

      toast.success('✓ Thanks for subscribing! Check your email.')
      setEmail('')
    } catch (error) {
      toast.error('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-white mb-4">
              Garrett Guerrero Knits
            </h2>
            <p className="text-gray-400 mb-6">
              Beautifully crafted knitting and crochet patterns for makers of all
              skill levels.
            </p>

            {/* Newsletter Signup */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Get Pattern Updates
              </h3>
              <form onSubmit={handleNewsletterSignup} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-400 hover:text-white transition"
                >
                  All Patterns
                </Link>
              </li>
              <li>
                <Link
                  href="/bundles"
                  className="text-gray-400 hover:text-white transition"
                >
                  Pattern Bundles
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?filter=free"
                  className="text-gray-400 hover:text-white transition"
                >
                  Free Patterns
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/refunds"
                  className="text-gray-400 hover:text-white transition"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Garrett Guerrero Knits. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
