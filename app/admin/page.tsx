import { createClient } from '@/lib/supabase/server'
import { DollarSign, Users, Mail, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get stats
  const [
    { count: totalPatterns },
    { count: totalUsers },
    { count: newsletterSubscribers },
    { data: recentOrders },
    { data: topPatterns },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('newsletter_subscribed', true),
    supabase
      .from('purchases')
      .select(
        `
        *,
        profile:profiles(email, display_name)
      `
      )
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, title, slug, times_downloaded, is_published')
      .eq('is_published', true)
      .order('times_downloaded', { ascending: false })
      .limit(5),
  ])

  // Calculate total revenue this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthlyRevenue } = await supabase
    .from('purchases')
    .select('amount_paid')
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString())

  const totalRevenue = monthlyRevenue?.reduce(
    (sum, purchase) => sum + Number(purchase.amount_paid),
    0
  )

  const stats = [
    {
      name: 'Revenue (This Month)',
      value: `$${(totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      name: 'Total Patterns',
      value: totalPatterns || 0,
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Newsletter Subscribers',
      value: newsletterSubscribers || 0,
      icon: Mail,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your shop.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-bold text-gray-900">
              Recent Orders
            </h2>
          </div>
          <div className="p-6">
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.profile?.display_name || order.profile?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ${Number(order.amount_paid).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No orders yet
              </p>
            )}
          </div>
        </div>

        {/* Top Patterns */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-bold text-gray-900">
              Most Downloaded Patterns
            </h2>
          </div>
          <div className="p-6">
            {topPatterns && topPatterns.length > 0 ? (
              <div className="space-y-4">
                {topPatterns.map((pattern: any) => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/patterns/${pattern.slug}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {pattern.title}
                      </Link>
                    </div>
                    <p className="text-sm text-gray-600">
                      {pattern.times_downloaded} downloads
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No patterns yet.{' '}
                <Link
                  href="/admin/patterns/new"
                  className="text-blue-600 hover:underline"
                >
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/patterns/new"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Add New Pattern
          </Link>
          <Link
            href="/admin/patterns"
            className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            View All Patterns
          </Link>
        </div>
      </div>
    </div>
  )
}
