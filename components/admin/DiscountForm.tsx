'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Discount = {
  id: string
  code: string
  discount_type: string
  discount_value: number
  valid_from: string
  valid_until: string | null
  max_uses: number | null
  is_active: boolean
}

export default function DiscountForm({ discount }: { discount?: Discount }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: discount?.code || '',
    discount_type: discount?.discount_type || 'percentage',
    discount_value: discount?.discount_value || 0,
    valid_from: discount?.valid_from
      ? new Date(discount.valid_from).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    valid_until: discount?.valid_until
      ? new Date(discount.valid_until).toISOString().split('T')[0]
      : '',
    max_uses: discount?.max_uses || null,
    is_active: discount?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate code format (uppercase, no spaces)
      const code = formData.code.toUpperCase().trim()
      if (!code) {
        toast.error('Code is required')
        setLoading(false)
        return
      }

      // Validate discount value
      if (formData.discount_value <= 0) {
        toast.error('Discount value must be greater than 0')
        setLoading(false)
        return
      }

      if (
        formData.discount_type === 'percentage' &&
        formData.discount_value > 100
      ) {
        toast.error('Percentage discount cannot exceed 100%')
        setLoading(false)
        return
      }

      const payload = {
        ...formData,
        code,
        max_uses: formData.max_uses || null,
        valid_until: formData.valid_until || null,
      }

      const url = discount
        ? `/api/admin/discounts/${discount.id}`
        : '/api/admin/discounts'
      const method = discount ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save discount code')
      }

      toast.success(
        discount ? 'Discount code updated' : 'Discount code created'
      )
      router.push('/admin/discounts')
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save discount code'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/discounts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discount Codes
        </Link>
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          {discount ? 'Edit Discount Code' : 'Create Discount Code'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., WELCOME10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="text-sm text-gray-500 mt-1">
              Will be converted to uppercase
            </p>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type *
            </label>
            <select
              required
              value={formData.discount_type}
              onChange={(e) =>
                setFormData({ ...formData, discount_type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Value *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                max={formData.discount_type === 'percentage' ? 100 : undefined}
                step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {formData.discount_type === 'percentage' ? '%' : '$'}
              </span>
            </div>
            {formData.discount_type === 'percentage' && (
              <p className="text-sm text-gray-500 mt-1">Maximum: 100%</p>
            )}
          </div>

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid From *
            </label>
            <input
              type="date"
              required
              value={formData.valid_from}
              onChange={(e) =>
                setFormData({ ...formData, valid_from: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              value={formData.valid_until}
              onChange={(e) =>
                setFormData({ ...formData, valid_until: e.target.value })
              }
              min={formData.valid_from}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty for no expiration
            </p>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Uses (Global)
            </label>
            <input
              type="number"
              min="1"
              value={formData.max_uses || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_uses: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="Unlimited"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Total uses across all customers. Leave empty for unlimited uses.
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (users can apply this code)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? 'Saving...'
              : discount
                ? 'Update Code'
                : 'Create Code'}
          </button>
          <Link
            href="/admin/discounts"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
