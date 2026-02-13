import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LibraryCard from '@/components/LibraryCard'

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/library')
  }

  // Fetch user's library with update information
  const { data: libraryItems, error } = await supabase
    .from('library_with_updates')
    .select(
      `
      *,
      product:products(*)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              My Library
            </h1>
            <p className="text-gray-600">
              Access all your purchased and free patterns
            </p>
          </div>

          {/* Content */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">
                Failed to load your library. Please try again.
              </p>
            </div>
          ) : libraryItems && libraryItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libraryItems.map((item: any) => (
                <LibraryCard key={item.id} libraryItem={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🧶</div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                Your library is empty
              </h2>
              <p className="text-gray-600 mb-2">
                Start building your collection of knitting and crochet patterns!
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Browse our marketplace or claim a free pattern to get started
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="/marketplace?filter=free"
                  className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Get Free Pattern
                </a>
                <a
                  href="/marketplace"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Browse All Patterns
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
