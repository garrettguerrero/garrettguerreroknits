import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LibraryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/library')
  }

  // Fetch user's library
  const { data: libraryItems, error } = await supabase
    .from('library')
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
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  {item.product?.cover_image_url && (
                    <div className="aspect-[4/3] bg-gray-100">
                      <img
                        src={item.product.cover_image_url}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-lg mb-2">
                      {item.product?.title || 'Pattern'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                        Download PDF
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                        Read Pattern
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                Your library is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Browse our marketplace to find patterns you'll love
              </p>
              <a
                href="/marketplace"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Browse Patterns
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
