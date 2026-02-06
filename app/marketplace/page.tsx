import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters'
import SortDropdown from '@/components/marketplace/SortDropdown'

type SearchParams = {
  category?: string
  skill?: string
  yarn?: string
  price?: string
  sort?: string
  search?: string
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_published', true)

  // Apply filters
  if (params.category) {
    query = query.eq('category', params.category)
  }

  if (params.skill) {
    query = query.eq('skill_level', params.skill)
  }

  if (params.yarn) {
    query = query.eq('yarn_weight', params.yarn)
  }

  if (params.price) {
    switch (params.price) {
      case 'free':
        query = query.eq('price', 0)
        break
      case 'under10':
        query = query.gt('price', 0).lt('price', 10)
        break
      case '10-20':
        query = query.gte('price', 10).lte('price', 20)
        break
      case 'over20':
        query = query.gt('price', 20)
        break
    }
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  // Apply sorting
  switch (params.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'popular':
      query = query.order('times_downloaded', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: products, error } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Marketplace
          </h1>
          <p className="text-gray-600">
            Discover {products?.length || 0} beautiful patterns
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (Client Component) */}
          <MarketplaceFilters />

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {products?.length || 0} {products?.length === 1 ? 'pattern' : 'patterns'} found
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-700">
                  Sort by:
                </label>
                <SortDropdown />
              </div>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">Failed to load patterns</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No patterns found matching your filters</p>
                <a
                  href="/marketplace"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters and view all
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
