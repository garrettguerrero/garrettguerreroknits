import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import DiscountTable from '@/components/admin/DiscountTable'
import DiscountFilters from '@/components/admin/DiscountFilters'

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with stable ordering
  let query = supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

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
      <DiscountFilters />

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
