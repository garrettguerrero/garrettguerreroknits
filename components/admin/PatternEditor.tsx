'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import slugify from 'slugify'
import dynamic from 'next/dynamic'
import ImageUpload from './ImageUpload'
import PDFUpload from './PDFUpload'
import { Save, Eye } from 'lucide-react'

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
})

interface Pattern {
  id?: string
  title: string
  slug: string
  description: string
  short_description: string
  price: number
  category: string
  skill_level: string
  yarn_weight: string | null
  finished_size: string | null
  pdf_storage_path: string | null
  cover_image_url: string | null
  thumbnail_url: string | null
  mdx_content_path: string | null
  has_video_content: boolean
  version: string
  changelog: string | null
  is_published: boolean
}

export default function PatternEditor({
  pattern,
  initialMdxContent = '',
}: {
  pattern?: Pattern
  initialMdxContent?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!pattern)

  // Form state
  const [formData, setFormData] = useState<Pattern>({
    title: pattern?.title || '',
    slug: pattern?.slug || '',
    description: pattern?.description || '',
    short_description: pattern?.short_description || '',
    price: pattern?.price || 0,
    category: pattern?.category || 'knit',
    skill_level: pattern?.skill_level || 'beginner',
    yarn_weight: pattern?.yarn_weight || null,
    finished_size: pattern?.finished_size || null,
    pdf_storage_path: pattern?.pdf_storage_path || null,
    cover_image_url: pattern?.cover_image_url || null,
    thumbnail_url: pattern?.thumbnail_url || null,
    mdx_content_path: pattern?.mdx_content_path || null,
    has_video_content: pattern?.has_video_content || false,
    version: pattern?.version || '1.0',
    changelog: pattern?.changelog || null,
    is_published: pattern?.is_published || false,
  })

  const [mdxContent, setMdxContent] = useState(initialMdxContent)

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(formData.title, { lower: true, strict: true }),
      }))
    }
  }, [formData.title, autoSlug])

  // SimpleMDE options
  const mdxEditorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Write your pattern content in Markdown/MDX format...',
      autofocus: false,
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ],
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        is_published: publish,
        mdx_content: mdxContent,
      }

      const url = pattern
        ? `/api/admin/patterns/${pattern.id}`
        : '/api/admin/patterns'

      const response = await fetch(url, {
        method: pattern ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save pattern')
      }

      toast.success(
        pattern
          ? 'Pattern updated successfully'
          : 'Pattern created successfully'
      )

      router.push('/admin/patterns')
      router.refresh()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save pattern')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          {pattern ? 'Edit Pattern' : 'Create New Pattern'}
        </h1>
        <p className="text-gray-600">
          {pattern
            ? 'Update pattern details and content'
            : 'Add a new pattern to your shop'}
        </p>
      </div>

      <form className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pattern Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cozy Cable Knit Sweater"
              />
            </div>

            <div className="md:col-span-2">
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
                  placeholder="cozy-cable-knit-sweater"
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
                URL: /patterns/{formData.slug || 'your-slug'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <input
                type="text"
                required
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    short_description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description for cards and previews (max 160 characters)"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.short_description.length}/160 characters
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of the pattern..."
              />
            </div>
          </div>
        </div>

        {/* Pattern Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Pattern Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
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
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 for free patterns
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="knit">Knit</option>
                <option value="crochet">Crochet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Level *
              </label>
              <select
                required
                value={formData.skill_level}
                onChange={(e) =>
                  setFormData({ ...formData, skill_level: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yarn Weight
              </label>
              <select
                value={formData.yarn_weight || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yarn_weight: e.target.value || null,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="fingering">Fingering</option>
                <option value="sport">Sport</option>
                <option value="dk">DK</option>
                <option value="worsted">Worsted</option>
                <option value="bulky">Bulky</option>
                <option value="super_bulky">Super Bulky</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finished Size
              </label>
              <input
                type="text"
                value={formData.finished_size || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    finished_size: e.target.value || null,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 36 inch chest, Adult medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Changelog
              </label>
              <textarea
                value={formData.changelog || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    changelog: e.target.value || null,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's new in this version?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.has_video_content}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      has_video_content: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Pattern includes video content
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Files Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Files & Media
          </h2>

          <div className="space-y-6">
            <ImageUpload
              label="Cover Image *"
              value={formData.cover_image_url || ''}
              onChange={(url) =>
                setFormData({ ...formData, cover_image_url: url })
              }
            />

            <PDFUpload
              label="Pattern PDF *"
              value={formData.pdf_storage_path || ''}
              onChange={(path) =>
                setFormData({ ...formData, pdf_storage_path: path })
              }
            />
          </div>
        </div>

        {/* MDX Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
            Pattern Content (MDX)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Write your pattern in Markdown format. You can use standard Markdown
            syntax plus custom components.
          </p>

          <SimpleMDE
            value={mdxContent}
            onChange={setMdxContent}
            options={mdxEditorOptions}
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
