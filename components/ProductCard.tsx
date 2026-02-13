'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import AddToCartButton from './AddToCartButton'

type Product = {
  id: string
  title: string
  slug: string
  short_description: string
  price: number
  category: string
  cover_image_url: string | null
  average_rating: number | null
  total_reviews: number
}

export default function ProductCard({ product }: { product: Product }) {
  const isFree = product.price === 0

  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/patterns/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-3/4 bg-gray-100">
          {product.cover_image_url ? (
            <Image
              src={product.cover_image_url}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Free Badge */}
          {isFree && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
              Free
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium rounded-full capitalize">
            {product.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            {product.average_rating && product.total_reviews > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {product.average_rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({product.total_reviews} {product.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No reviews yet</span>
            )}
          </div>

          {/* Short Description (visible on hover) */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.short_description}
          </p>
        </div>
      </Link>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          {/* Price */}
          {isFree ? (
            <span className="text-lg font-bold text-green-600">Free</span>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <AddToCartButton
          productId={product.id}
          title={product.title}
          price={product.price}
          slug={product.slug}
          coverImage={product.cover_image_url || undefined}
          isFree={isFree}
        />
      </div>
    </div>
  )
}
