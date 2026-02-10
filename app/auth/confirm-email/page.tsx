'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Mail, RefreshCw, Check } from 'lucide-react'

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get email from URL params or session
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Try to get from session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setEmail(session.user.email)
        }
      })
    }
  }, [searchParams, supabase.auth])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        setResent(true)
        setCanResend(false)
        setCountdown(30)
        toast.success('Confirmation email sent!')
      }
    } catch (error) {
      toast.error('Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-4">
              We've sent a confirmation link to
            </p>
            {email && (
              <p className="text-blue-600 font-medium break-words">{email}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">
                Click the link in the email to confirm your account
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">
                Check your spam folder if you don't see it within a few minutes
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-700">
                The link will expire in 24 hours
              </p>
            </div>
          </div>

          {/* Resend button */}
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-600">
              Didn't receive the email?
            </div>

            <button
              onClick={handleResendEmail}
              disabled={!canResend || loading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                canResend && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading
                ? 'Sending...'
                : canResend
                ? 'Resend confirmation email'
                : `Resend in ${countdown}s`}
            </button>

            {resent && (
              <div className="text-center text-sm text-green-600">
                ✓ Confirmation email sent successfully!
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>

          {/* Back to login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
