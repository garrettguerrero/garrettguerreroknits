import { createClient } from '@/lib/supabase/server'
import OrderTable from '@/components/admin/OrderTable'
import OrderFilters from '@/components/admin/OrderFilters'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query with stable ordering
  let query = supabase
    .from('orders')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  // Apply filters
  if (params.search) {
    // Search by order ID or customer email
    query = query.or(
      `id.ilike.%${params.search}%,profiles.email.ilike.%${params.search}%`
    )
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: orders, error } = await query

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Orders
        </h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Results */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load orders</p>
        </div>
      ) : orders && orders.length > 0 ? (
        <OrderTable orders={orders} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  )
}
