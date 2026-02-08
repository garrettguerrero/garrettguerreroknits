import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Download, BookOpen, Package, Library } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import BundleCard from '@/components/BundleCard'
import AddToCartButton from '@/components/AddToCartButton'

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch pattern
  const { data: pattern, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !pattern) {
    notFound()
  }

  // Check if user owns this pattern
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let ownsPattern = false
  if (user) {
    const { data: library } = await supabase
      .from('library')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', pattern.id)
      .single()

    ownsPattern = !!library
  }

  // Fetch related patterns (same category, similar skill level, exclude current)
  const { data: relatedPatterns } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('category', pattern.category)
    .eq('skill_level', pattern.skill_level)
    .neq('id', pattern.id)
    .limit(3)

  // Fetch bundles that include this pattern
  const { data: relatedBundles } = await supabase
    .from('bundle_items')
    .select('bundle_id, bundles(*)')
    .eq('product_id', pattern.id)

  const bundles =
    relatedBundles
      ?.map((item: any) => item.bundles)
      .filter((bundle: any) => bundle && bundle.is_published) || []

  const isFree = pattern.price === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          {' / '}
          <Link href="/marketplace" className="hover:text-gray-700">
            Marketplace
          </Link>
          {' / '}
          <span className="text-gray-900">{pattern.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-200 mb-6">
              {pattern.cover_image_url ? (
                <Image
                  src={pattern.cover_image_url}
                  alt={pattern.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
                {pattern.category}
              </div>

              {/* Free Badge */}
              {isFree && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                  Free
                </div>
              )}
            </div>

            {/* Title and Rating */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                {pattern.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                {pattern.average_rating && pattern.total_reviews > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-900">
                        {pattern.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      ({pattern.total_reviews}{' '}
                      {pattern.total_reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">No reviews yet</span>
                )}
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">
                  {pattern.times_downloaded} downloads
                </span>
              </div>

              {/* Short Description */}
              <p className="text-lg text-gray-700 leading-relaxed">
                {pattern.short_description}
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button className="px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                    Overview
                  </button>
                  <button className="px-6 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                    Details
                  </button>
                  <button className="px-6 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                    Reviews
                  </button>
                </nav>
              </div>

              {/* Tab Content - Overview */}
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {pattern.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {ownsPattern ? (
                  /* Already Owned */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                      <span className="font-medium">You own this pattern</span>
                    </div>
                    <Link
                      href="/library"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      <Library className="w-5 h-5" />
                      View in Library
                    </Link>
                  </div>
                ) : (
                  /* Purchase */
                  <div>
                    <div className="mb-6">
                      {isFree ? (
                        <div>
                          <p className="text-3xl font-bold text-green-600 mb-2">
                            Free
                          </p>
                          <p className="text-sm text-gray-600">
                            Get this pattern for free
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl font-bold text-gray-900 mb-2">
                            ${pattern.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            One-time purchase • Lifetime access
                          </p>
                        </div>
                      )}
                    </div>

                    <AddToCartButton
                      productId={pattern.id}
                      title={pattern.title}
                      price={Number(pattern.price)}
                      slug={pattern.slug}
                      coverImage={pattern.cover_image_url || undefined}
                      isFree={isFree}
                    />

                    <p className="text-xs text-center text-gray-500 mt-3">
                      Instant download after purchase
                    </p>
                  </div>
                )}
              </div>

              {/* Pattern Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pattern Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-600">Skill Level</dt>
                    <dd className="text-sm font-medium text-gray-900 capitalize">
                      {pattern.skill_level}
                    </dd>
                  </div>
                  {pattern.yarn_weight && (
                    <div>
                      <dt className="text-sm text-gray-600">Yarn Weight</dt>
                      <dd className="text-sm font-medium text-gray-900 capitalize">
                        {pattern.yarn_weight.replace('_', ' ')}
                      </dd>
                    </div>
                  )}
                  {pattern.finished_size && (
                    <div>
                      <dt className="text-sm text-gray-600">Finished Size</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {pattern.finished_size}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-600">Category</dt>
                    <dd className="text-sm font-medium text-gray-900 capitalize">
                      {pattern.category}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Bundles containing this pattern */}
              {bundles.length > 0 && (
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Save with a Bundle
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    This pattern is included in {bundles.length}{' '}
                    {bundles.length === 1 ? 'bundle' : 'bundles'}
                  </p>
                  <div className="space-y-2">
                    {bundles.map((bundle: any) => (
                      <Link
                        key={bundle.id}
                        href={`/bundles/${bundle.slug}`}
                        className="block p-3 bg-white rounded-lg hover:shadow-md transition"
                      >
                        <p className="font-medium text-gray-900">{bundle.title}</p>
                        <p className="text-sm text-purple-600">
                          Save {bundle.discount_percentage}%
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Patterns */}
        {(relatedPatterns && relatedPatterns.length > 0) && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPatterns.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
