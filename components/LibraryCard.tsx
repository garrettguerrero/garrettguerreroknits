'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Download, BookOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

interface LibraryCardProps {
  libraryItem: {
    id: string
    created_at: string
    has_update?: boolean
    current_version?: string
    changelog?: string
    product: {
      id: string
      title: string
      slug: string
      category: string
      cover_image_url: string | null
      version: string | null
    }
  }
}

export default function LibraryCard({ libraryItem }: LibraryCardProps) {
  const [downloading, setDownloading] = useState(false)
  const { product } = libraryItem

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Open download in new window
      const downloadUrl = `/api/download/${product.id}`
      window.open(downloadUrl, '_blank')
      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to download PDF')
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Cover Image */}
      <Link href={`/patterns/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-gray-100">
          {product.cover_image_url ? (
            <Image
              src={product.cover_image_url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium capitalize">
            {product.category}
          </div>

          {/* Version Badge or Update Badge */}
          {libraryItem.has_update ? (
            <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold animate-pulse">
              Updated!
            </div>
          ) : product.version ? (
            <div className="absolute top-3 right-3 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              v{product.version}
            </div>
          ) : null}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/patterns/${product.slug}`}>
          <h3 className="font-serif font-bold text-lg mb-2 hover:text-blue-600 transition">
            {product.title}
          </h3>
        </Link>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Added {new Date(libraryItem.created_at).toLocaleDateString()}
          </p>
          {libraryItem.has_update && (
            <p className="text-sm text-green-600 font-medium mt-1">
              New version available!
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>

          <Link
            href={`/patterns/${product.slug}/read`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <BookOpen className="w-4 h-4" />
            Read Pattern
          </Link>
        </div>
      </div>
    </div>
  )
}
