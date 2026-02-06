'use client'

import { Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function MarketplaceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') || ''
  const skill = searchParams.get('skill') || ''
  const yarn = searchParams.get('yarn') || ''
  const price = searchParams.get('price') || ''
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'newest'

  const [searchValue, setSearchValue] = useState(search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (searchValue) {
        params.set('search', searchValue)
      } else {
        params.delete('search')
      }

      // Only navigate if search value actually changed
      if (searchValue !== search) {
        router.push(`/marketplace?${params.toString()}`)
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/marketplace?${params.toString()}`)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`/marketplace?${params.toString()}`)
  }

  const hasFilters = category || skill || yarn || price || search

  return (
    <>
      {/* Filters Sidebar */}
      <aside className="lg:w-64 shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div>
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search patterns..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="knit"
                    checked={category === 'knit'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Knit</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="crochet"
                    checked={category === 'crochet'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Crochet</span>
                </label>
              </div>
            </div>

            {/* Skill Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Skill Level
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="skill"
                    value=""
                    checked={!skill}
                    onChange={(e) => handleFilterChange('skill', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="skill"
                    value="beginner"
                    checked={skill === 'beginner'}
                    onChange={(e) => handleFilterChange('skill', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Beginner</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="skill"
                    value="intermediate"
                    checked={skill === 'intermediate'}
                    onChange={(e) => handleFilterChange('skill', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Intermediate</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="skill"
                    value="advanced"
                    checked={skill === 'advanced'}
                    onChange={(e) => handleFilterChange('skill', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Advanced</span>
                </label>
              </div>
            </div>

            {/* Yarn Weight */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Yarn Weight
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value=""
                    checked={!yarn}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value="fingering"
                    checked={yarn === 'fingering'}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fingering</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value="sport"
                    checked={yarn === 'sport'}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Sport</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value="dk"
                    checked={yarn === 'dk'}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">DK</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value="worsted"
                    checked={yarn === 'worsted'}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Worsted</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value="bulky"
                    checked={yarn === 'bulky'}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bulky</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="yarn"
                    value="super_bulky"
                    checked={yarn === 'super_bulky'}
                    onChange={(e) => handleFilterChange('yarn', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Super Bulky</span>
                </label>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value=""
                    checked={!price}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="free"
                    checked={price === 'free'}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Free</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="under10"
                    checked={price === 'under10'}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Under $10</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="10-20"
                    checked={price === '10-20'}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">$10 - $20</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="over20"
                    checked={price === 'over20'}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">$20+</span>
                </label>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <a
              href="/marketplace"
              className="block w-full mt-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition text-center"
            >
              Clear All
            </a>
          )}
        </div>
      </aside>

      {/* Sort Dropdown (rendered separately in main content) */}
      <div className="hidden" id="sort-component">
        <select
          id="sort"
          name="sort"
          value={sort}
          onChange={handleSortChange}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </>
  )
}
