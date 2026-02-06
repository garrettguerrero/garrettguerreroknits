'use client'

import Link from 'next/link'
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

type Discount = {
  id: string
  code: string
  discount_type: string
  discount_value: number
  valid_from: string
  valid_until: string | null
  max_uses: number | null
  times_used: number
  is_active: boolean
}

export default function DiscountTable({ discounts }: { discounts: Discount[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast.success(
        currentStatus ? 'Code deactivated' : 'Code activated'
      )
      router.refresh()
    } catch (error) {
      toast.error('Failed to update code')
    } finally {
      setLoading(null)
    }
  }

  const deleteCode = async (id: string, code: string) => {
    if (
      !confirm(
        `Are you sure you want to delete code "${code}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Code deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete code')
    } finally {
      setLoading(null)
    }
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  const isMaxedOut = (maxUses: number | null, timesUsed: number) => {
    if (!maxUses) return false
    return timesUsed >= maxUses
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {discounts.map((discount) => {
              const expired = isExpired(discount.valid_until)
              const maxedOut = isMaxedOut(discount.max_uses, discount.times_used)

              return (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-gray-900">
                      {discount.code}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {discount.discount_type === 'percentage'
                        ? `${discount.discount_value}% off`
                        : `$${Number(discount.discount_value).toFixed(2)} off`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {discount.times_used}
                    {discount.max_uses && ` / ${discount.max_uses}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {discount.valid_until
                      ? new Date(discount.valid_until).toLocaleDateString()
                      : 'No expiry'}
                  </td>
                  <td className="px-6 py-4">
                    {expired ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expired
                      </span>
                    ) : maxedOut ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Maxed Out
                      </span>
                    ) : discount.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/discounts/${discount.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() =>
                          toggleActive(discount.id, discount.is_active)
                        }
                        disabled={loading === discount.id || expired || maxedOut}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                        title={discount.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {discount.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCode(discount.id, discount.code)}
                        disabled={loading === discount.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
