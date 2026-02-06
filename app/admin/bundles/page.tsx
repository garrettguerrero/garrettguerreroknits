import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import BundleTable from '@/components/admin/BundleTable'
import BundleFilters from '@/components/admin/BundleFilters'

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with stable ordering
  let query = supabase
    .from('bundles')
    .select('*, bundle_items(count)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.ilike('title', `%${params.search}%`)
  }

  if (params.status === 'published') {
    query = query.eq('is_published', true)
  } else if (params.status === 'draft') {
    query = query.eq('is_published', false)
  }

  const { data: bundles, error } = await query

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Bundles
          </h1>
          <p className="text-gray-600">
            Create pattern bundles with discounted pricing
          </p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Bundle
        </Link>
      </div>

      {/* Filters */}
      <BundleFilters />

      {/* Results */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load bundles</p>
        </div>
      ) : bundles && bundles.length > 0 ? (
        <BundleTable bundles={bundles} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No bundles found</p>
          <Link
            href="/admin/bundles/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Bundle
          </Link>
        </div>
      )}
    </div>
  )
}
