import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import AddBundleToCartButton from '@/components/AddBundleToCartButton'

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch bundle with included patterns
  const { data: bundle, error } = await supabase
    .from('bundles')
    .select(
      `
      *,
      bundle_items(
        product_id,
        products(*)
      )
    `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !bundle) {
    notFound()
  }

  // Calculate total value
  const includedPatterns = bundle.bundle_items.map((item: any) => item.products)
  const totalValue = includedPatterns.reduce(
    (sum: number, pattern: any) => sum + Number(pattern.price),
    0
  )
  const savings = totalValue - Number(bundle.price)
  const savingsPercentage = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          {' / '}
          <Link href="/bundles" className="hover:text-gray-700">
            Bundles
          </Link>
          {' / '}
          <span className="text-gray-900">{bundle.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200 mb-6">
              {bundle.cover_image_url ? (
                <Image
                  src={bundle.cover_image_url}
                  alt={bundle.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-24 h-24" />
                </div>
              )}

              {/* Bundle Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Bundle
              </div>

              {/* Discount Badge */}
              {bundle.discount_percentage && bundle.discount_percentage > 0 && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-full text-lg font-bold">
                  Save {bundle.discount_percentage}%
                </div>
              )}
            </div>

            {/* Title and Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                {bundle.title}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {bundle.description}
              </p>
            </div>

            {/* Included Patterns */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                Included Patterns ({includedPatterns.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {includedPatterns.map((pattern: any) => (
                  <ProductCard key={pattern.id} product={pattern} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <p className="text-3xl font-bold text-gray-900">
                      ${bundle.price.toFixed(2)}
                    </p>
                    <p className="text-lg text-gray-500 line-through">
                      ${totalValue.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-green-600 font-medium mb-4">
                    You save ${savings.toFixed(2)} ({savingsPercentage}%)
                  </p>
                  <p className="text-sm text-gray-600">
                    One-time purchase • Lifetime access to all patterns
                  </p>
                </div>

                <AddBundleToCartButton
                  bundleId={bundle.id}
                  title={bundle.title}
                  price={Number(bundle.price)}
                  slug={bundle.slug}
                  coverImage={bundle.cover_image_url || undefined}
                />

                <p className="text-xs text-center text-gray-500">
                  Instant download after purchase
                </p>
              </div>

              {/* Bundle Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bundle Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-600">Patterns Included</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {includedPatterns.length} patterns
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Total Value</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      ${totalValue.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Your Price</dt>
                    <dd className="text-sm font-medium text-green-600">
                      ${bundle.price.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">You Save</dt>
                    <dd className="text-sm font-medium text-green-600">
                      ${savings.toFixed(2)} ({savingsPercentage}%)
                    </dd>
                  </div>
                </dl>
              </div>

              {/* What's Included */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What's Included
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>All {includedPatterns.length} PDF pattern files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Lifetime access to all patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Free updates and corrections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Instant download after purchase</span>
                  </li>
                </ul>
              </div>

              {/* Browse Individual Patterns */}
              <Link
                href="/marketplace"
                className="block text-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Browse Individual Patterns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
