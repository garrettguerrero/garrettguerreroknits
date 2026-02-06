'use client'

import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

type Bundle = {
  id: string
  title: string
  slug: string
  price: number
  discount_percentage: number | null
  is_published: boolean
  created_at: string
  bundle_items: { count: number }[]
}

export default function BundleTable({ bundles }: { bundles: Bundle[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/bundles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast.success(currentStatus ? 'Bundle unpublished' : 'Bundle published')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update bundle')
    } finally {
      setLoading(null)
    }
  }

  const deleteBundle = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/admin/bundles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Bundle deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete bundle')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bundle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patterns
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
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
            {bundles.map((bundle) => (
              <tr key={bundle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{bundle.title}</p>
                    <p className="text-sm text-gray-500">/{bundle.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {bundle.bundle_items?.[0]?.count || 0} patterns
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${Number(bundle.price).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {bundle.discount_percentage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {bundle.discount_percentage}% off
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {bundle.is_published ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/bundles/${bundle.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        togglePublish(bundle.id, bundle.is_published)
                      }
                      disabled={loading === bundle.id}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                      title={bundle.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {bundle.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteBundle(bundle.id, bundle.title)}
                      disabled={loading === bundle.id}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
