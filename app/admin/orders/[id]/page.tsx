import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, User, CreditCard, Receipt } from 'lucide-react'
import RefundButton from '@/components/admin/RefundButton'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch order with related data
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      profiles(email, display_name),
      order_items(
        *,
        products(id, title, slug),
        bundles(id, title, slug)
      ),
      discount_codes(code, discount_type, discount_value)
    `
    )
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Completed
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case 'refunded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            Refunded
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Order Details
            </h1>
            <p className="text-gray-600 font-mono">ID: {order.id}</p>
          </div>
          {order.status === 'completed' && (
            <RefundButton orderId={order.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Order Items
              </h2>
            </div>
            <div className="space-y-4">
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.products?.title || item.bundles?.title || 'Unknown Item'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.products ? 'Pattern' : 'Bundle'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${Number(item.price_at_purchase).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ${Number(order.total_amount).toFixed(2)}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount
                    {order.discount_codes && (
                      <span className="ml-1 font-mono text-xs">
                        ({order.discount_codes.code})
                      </span>
                    )}
                  </span>
                  <span className="text-green-600">
                    -${Number(order.discount_amount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  ${Number(order.final_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Status</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Status</p>
                {getStatusBadge(order.status)}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="space-y-2">
              {order.profiles?.display_name && (
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-sm text-gray-900">
                    {order.profiles.display_name}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm text-gray-900">
                  {order.profiles?.email || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
            </div>
            <div className="space-y-2">
              {order.stripe_payment_intent_id ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="text-sm text-gray-900">Stripe</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Intent</p>
                    <p className="text-xs text-gray-900 font-mono break-all">
                      {order.stripe_payment_intent_id}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No payment information</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
