'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface FreePatternModalProps {
  isOpen: boolean
  onClose: () => void
  patternId: string
  patternTitle: string
  isAuthenticated: boolean
  userEmail?: string
}

export default function FreePatternModal({
  isOpen,
  onClose,
  patternId,
  patternTitle,
  isAuthenticated,
  userEmail,
}: FreePatternModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState(userEmail || '')
  const [loading, setLoading] = useState(false)

  // Update email when userEmail prop changes
  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail)
    }
  }, [userEmail])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/free-pattern/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          patternId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim pattern')
      }

      toast.success('Free pattern added to your library!')
      onClose()

      // Redirect to library or show success
      if (isAuthenticated) {
        router.push('/library')
      } else {
        router.push(`/patterns/${data.patternSlug}?claimed=true`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim pattern')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Get Free Pattern
              </h2>
              <p className="text-sm text-gray-600 mt-1">{patternTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                required
              />
              {isAuthenticated ? (
                <p className="mt-2 text-sm text-gray-500">
                  Pattern will be added to your account library
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  We'll send you the pattern. Create an account later to access it anytime.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Get Pattern
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
