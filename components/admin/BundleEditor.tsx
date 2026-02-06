'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import slugify from 'slugify'
import ImageUpload from './ImageUpload'
import { Save, Eye } from 'lucide-react'

interface Bundle {
  id?: string
  title: string
  slug: string
  description: string
  price: number
  discount_percentage: number | null
  cover_image_url: string | null
  is_published: boolean
  bundle_items?: { product_id: string }[]
}

export default function BundleEditor({
  bundle,
}: {
  bundle?: Bundle & { bundle_items?: { product_id: string }[] }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!bundle)
  const [patterns, setPatterns] = useState<any[]>([])
  const [loadingPatterns, setLoadingPatterns] = useState(true)

  // Form state
  const [formData, setFormData] = useState<Bundle>({
    title: bundle?.title || '',
    slug: bundle?.slug || '',
    description: bundle?.description || '',
    price: bundle?.price || 0,
    discount_percentage: bundle?.discount_percentage || null,
    cover_image_url: bundle?.cover_image_url || null,
    is_published: bundle?.is_published || false,
  })

  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(
    bundle?.bundle_items?.map((item) => item.product_id) || []
  )

  // Fetch all published patterns
  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch(
          '/api/admin/patterns?status=published'
        )
        const data = await response.json()
        setPatterns(data)
      } catch (error) {
        toast.error('Failed to load patterns')
      } finally {
        setLoadingPatterns(false)
      }
    }
    fetchPatterns()
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(formData.title, { lower: true, strict: true }),
      }))
    }
  }, [formData.title, autoSlug])

  // Calculate total value and discount percentage
  const selectedPatterns = patterns.filter((p) =>
    selectedPatternIds.includes(p.id)
  )
  const totalValue = selectedPatterns.reduce(
    (sum, p) => sum + Number(p.price),
    0
  )
  const calculatedDiscount =
    totalValue > 0 && formData.price > 0
      ? Math.round(((totalValue - formData.price) / totalValue) * 100)
      : 0

  const togglePattern = (patternId: string) => {
    setSelectedPatternIds((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    )
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()

    if (selectedPatternIds.length < 2) {
      toast.error('Please select at least 2 patterns for the bundle')
      return
    }

    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        is_published: publish,
        discount_percentage: calculatedDiscount,
        pattern_ids: selectedPatternIds,
      }

      const url = bundle
        ? `/api/admin/bundles/${bundle.id}`
        : '/api/admin/bundles'

      const response = await fetch(url, {
        method: bundle ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save bundle')
      }

      toast.success(
        bundle ? 'Bundle updated successfully' : 'Bundle created successfully'
      )

      router.push('/admin/bundles')
      router.refresh()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save bundle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          {bundle ? 'Edit Bundle' : 'Create New Bundle'}
        </h1>
        <p className="text-gray-600">
          {bundle
            ? 'Update bundle details and patterns'
            : 'Create a bundle of multiple patterns at a discounted price'}
        </p>
      </div>

      <form className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Winter Warmth Collection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoSlug(false)
                    setFormData({ ...formData, slug: e.target.value })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="winter-warmth-collection"
                />
                <button
                  type="button"
                  onClick={() => setAutoSlug(true)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Auto-generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL: /bundles/{formData.slug || 'your-slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="A collection of cozy winter patterns..."
              />
            </div>
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Select Patterns
          </h2>

          {loadingPatterns ? (
            <p className="text-gray-500">Loading patterns...</p>
          ) : patterns.length === 0 ? (
            <p className="text-gray-500">
              No published patterns available. Create some patterns first.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {patterns.map((pattern) => (
                <label
                  key={pattern.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPatternIds.includes(pattern.id)}
                    onChange={() => togglePattern(pattern.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pattern.title}</p>
                    <p className="text-sm text-gray-500">
                      ${Number(pattern.price).toFixed(2)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {selectedPatternIds.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                {selectedPatternIds.length} patterns selected
              </p>
              <p className="text-sm text-blue-700">
                Total individual value: ${totalValue.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Pricing
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Price (USD) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {calculatedDiscount > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Customers save {calculatedDiscount}%
                </p>
                <p className="text-sm text-green-700">
                  They pay ${formData.price.toFixed(2)} instead of $
                  {totalValue.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Cover Image
          </h2>

          <ImageUpload
            label="Bundle Cover Image"
            value={formData.cover_image_url || ''}
            onChange={(url) =>
              setFormData({ ...formData, cover_image_url: url })
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Eye className="w-5 h-5" />
              {loading ? 'Publishing...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
