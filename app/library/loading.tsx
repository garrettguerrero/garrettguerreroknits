export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-80 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <div className="h-12 w-full max-w-md bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Library Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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

                {/* Buttons */}
                <div className="space-y-2">
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
