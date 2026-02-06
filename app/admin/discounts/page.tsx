import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import DiscountTable from '@/components/admin/DiscountTable'

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (params.search) {
    query = query.ilike('code', `%${params.search}%`)
  }

  if (params.status === 'active') {
    query = query.eq('is_active', true)
  } else if (params.status === 'inactive') {
    query = query.eq('is_active', false)
  }

  const { data: allDiscounts, error } = await query

  // Filter expired codes on the server side based on status filter
  let discounts = allDiscounts
  const now = new Date()

  if (discounts && params.status === 'active') {
    // For "active" filter, exclude expired codes
    discounts = discounts.filter(
      (d) => !d.valid_until || new Date(d.valid_until) >= now
    )
  } else if (discounts && params.status === 'inactive') {
    // For "inactive" filter, exclude expired codes
    discounts = discounts.filter(
      (d) => !d.valid_until || new Date(d.valid_until) >= now
    )
  } else if (discounts && params.status === 'expired') {
    // For "expired" filter, show only expired codes
    discounts = discounts.filter(
      (d) => d.valid_until && new Date(d.valid_until) < now
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Discount Codes
          </h1>
          <p className="text-gray-600">
            Create and manage promotional discount codes
          </p>
        </div>
        <Link
          href="/admin/discounts/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Code
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Search by code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              defaultValue={params.status || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
            <Link
              href="/admin/discounts"
              className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Results */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load discount codes</p>
        </div>
      ) : discounts && discounts.length > 0 ? (
        <DiscountTable discounts={discounts} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No discount codes found</p>
          <Link
            href="/admin/discounts/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Code
          </Link>
        </div>
      )}
    </div>
  )
}
