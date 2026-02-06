'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Package } from 'lucide-react'

type Bundle = {
  id: string
  title: string
  slug: string
  description: string
  price: number
  discount_percentage: number | null
  cover_image_url: string | null
  bundle_items?: { product_id: string }[]
}

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const patternCount = bundle.bundle_items?.length || 0

  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/bundles/${bundle.slug}`}>
        {/* Image */}
        <div className="relative aspect-3/4 bg-gray-100">
          {bundle.cover_image_url ? (
            <Image
              src={bundle.cover_image_url}
              alt={bundle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-16 h-16" />
            </div>
          )}

          {/* Discount Badge */}
          {bundle.discount_percentage && bundle.discount_percentage > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
              Save {bundle.discount_percentage}%
            </div>
          )}

          {/* Bundle Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Package className="w-3 h-3" />
            Bundle
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {bundle.title}
          </h3>

          {/* Pattern Count */}
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {patternCount} {patternCount === 1 ? 'pattern' : 'patterns'} included
            </span>
          </div>

          {/* Description (visible on hover) */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {bundle.description}
          </p>
        </div>
      </Link>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Price */}
        <div>
          <span className="text-lg font-bold text-gray-900">
            ${bundle.price.toFixed(2)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            // TODO: Add to cart functionality in Sprint 4
            console.log('Add bundle to cart:', bundle.id)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
