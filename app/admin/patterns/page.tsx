import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import PatternTable from '@/components/admin/PatternTable'
import PatternFilters from '@/components/admin/PatternFilters'

export default async function PatternsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; category?: string; featured?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with stable ordering
  let query = supabase
    .from('products')
    .select('*')
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

  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  } else if (params.featured === 'false') {
    query = query.eq('is_featured', false)
  }

  const { data: patterns, error } = await query

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Patterns
          </h1>
          <p className="text-gray-600">
            Manage your knitting and crochet patterns
          </p>
        </div>
        <Link
          href="/admin/patterns/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add New Pattern
        </Link>
      </div>

      {/* Filters */}
      <PatternFilters />

      {/* Results */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load patterns</p>
        </div>
      ) : patterns && patterns.length > 0 ? (
        <PatternTable patterns={patterns} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No patterns found</p>
          <Link
            href="/admin/patterns/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Pattern
          </Link>
        </div>
      )}
    </div>
  )
}
