export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar Skeleton */}
          <div className="lg:w-64 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Products Grid Skeleton */}
          <div className="flex-1">
            {/* Sort Dropdown Skeleton */}
            <div className="flex justify-end mb-6">
              <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Image Skeleton */}
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>

                  {/* Content Skeleton */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>

                    {/* Category Badge */}
                    <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>

                    {/* Price */}
                    <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>

                    {/* Button */}
                    <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
