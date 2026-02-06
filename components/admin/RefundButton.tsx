'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'

export default function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRefund = async () => {
    if (
      !confirm(
        'Are you sure you want to refund this order? This action cannot be undone and will process a refund through Stripe.'
      )
    ) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process refund')
      }

      toast.success('Refund processed successfully')
      router.refresh()
    } catch (error) {
      console.error('Refund error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to process refund'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
    >
      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Processing...' : 'Issue Refund'}
    </button>
  )
}
