import { createClient } from '@/lib/supabase/server'
import BundleCard from '@/components/BundleCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function BundlesPage() {
  const supabase = await createClient()

  // Fetch all published bundles
  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('*, bundle_items(product_id)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Pattern Bundles
          </h1>
          <p className="text-gray-600">
            Save big with our curated pattern collections •{' '}
            {bundles?.length || 0} {bundles?.length === 1 ? 'bundle' : 'bundles'}{' '}
            available
          </p>
        </div>

        {/* Bundles Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">Failed to load bundles</p>
          </div>
        ) : bundles && bundles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No bundles available yet</p>
            <Link
              href="/marketplace"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse individual patterns
            </Link>
          </div>
        )}

        {/* Why Bundles Section */}
        <div className="mt-16 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Why Choose Bundles?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">
                Get multiple patterns at a discounted price compared to buying
                individually.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Curated Collections
              </h3>
              <p className="text-sm text-gray-600">
                Carefully selected patterns that work beautifully together or
                share a theme.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">More to Create</h3>
              <p className="text-sm text-gray-600">
                Expand your pattern library and always have your next project
                ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
