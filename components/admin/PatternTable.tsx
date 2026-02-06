'use client'

import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

type Pattern = {
  id: string
  title: string
  slug: string
  category: string
  skill_level: string
  price: number
  is_published: boolean
  is_featured: boolean
  created_at: string
  times_downloaded: number
}

export default function PatternTable({ patterns }: { patterns: Pattern[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/patterns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast.success(
        currentStatus ? 'Pattern unpublished' : 'Pattern published'
      )
      router.refresh()
    } catch (error) {
      toast.error('Failed to update pattern')
    } finally {
      setLoading(null)
    }
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/patterns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')

      toast.success(
        currentStatus ? 'Removed from featured' : 'Marked as featured'
      )
      router.refresh()
    } catch (error) {
      toast.error('Failed to update pattern')
    } finally {
      setLoading(null)
    }
  }

  const deletePattern = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/admin/patterns/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Pattern deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete pattern')
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
                Pattern
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Downloads
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patterns.map((pattern) => (
              <tr key={pattern.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{pattern.title}</p>
                    <p className="text-sm text-gray-500">/{pattern.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {pattern.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                  {pattern.skill_level}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {Number(pattern.price) === 0
                    ? 'Free'
                    : `$${Number(pattern.price).toFixed(2)}`}
                </td>
                <td className="px-6 py-4">
                  {pattern.is_published ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {pattern.times_downloaded}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/patterns/${pattern.id}/edit`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        togglePublish(pattern.id, pattern.is_published)
                      }
                      disabled={loading === pattern.id}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                      title={
                        pattern.is_published ? 'Unpublish' : 'Publish'
                      }
                    >
                      {pattern.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        toggleFeatured(pattern.id, pattern.is_featured)
                      }
                      disabled={loading === pattern.id}
                      className={`p-2 rounded-lg transition disabled:opacity-50 ${
                        pattern.is_featured
                          ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                          : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={
                        pattern.is_featured ? 'Unfeature' : 'Feature on homepage'
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${pattern.is_featured ? 'fill-yellow-600' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => deletePattern(pattern.id, pattern.title)}
                      disabled={loading === pattern.id}
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
