import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import BundleCard from '@/components/BundleCard'
import { ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured pattern
  const { data: featuredPattern } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(1)
    .single()

  // Fetch recent releases (last 6 patterns)
  const { data: recentPatterns } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch popular bundles
  const { data: bundles } = await supabase
    .from('bundles')
    .select('*, bundle_items(product_id)')
    .eq('is_published', true)
    .limit(3)

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Pattern */}
      {featuredPattern ? (
        <section className="relative bg-linear-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  Featured Pattern
                </span>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
                  {featuredPattern.title}
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {featuredPattern.short_description}
                </p>
                <div className="flex gap-4">
                  <Link
                    href={`/patterns/${featuredPattern.slug}`}
                    className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-lg inline-flex items-center gap-2"
                  >
                    View Pattern
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="px-8 py-4 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition text-lg"
                  >
                    Browse All
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-2xl">
                {featuredPattern.cover_image_url ? (
                  <Image
                    src={featuredPattern.cover_image_url}
                    alt={featuredPattern.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Fallback hero if no featured pattern
        <section className="bg-linear-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
                Beautifully Crafted
                <br />
                <span className="text-blue-600">Knitting Patterns</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Discover thoughtfully designed patterns for knitters and
                crocheters of all skill levels. From cozy scarves to intricate
                garments.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/marketplace"
                  className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-lg"
                >
                  Browse Patterns
                </Link>
                <Link
                  href="/marketplace?price=free"
                  className="px-8 py-4 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition text-lg"
                >
                  Free Patterns
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Releases */}
      {recentPatterns && recentPatterns.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  New Releases
                </h2>
                <p className="text-gray-600">
                  Fresh patterns just added to the collection
                </p>
              </div>
              <Link
                href="/marketplace?sort=newest"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPatterns.map((pattern) => (
                <ProductCard key={pattern.id} product={pattern} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bundles Section */}
      {bundles && bundles.length > 0 && (
        <section className="py-16 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  Pattern Bundles
                </h2>
                <p className="text-gray-600">
                  Save big with our curated pattern collections
                </p>
              </div>
              <Link
                href="/bundles"
                className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <BundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 text-2xl">
                📐
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">
                Clear Instructions
              </h3>
              <p className="text-gray-600">
                Step-by-step guidance with photos and videos to help you
                succeed.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4 text-2xl">
                💾
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">
                Instant Access
              </h3>
              <p className="text-gray-600">
                Download PDF patterns immediately and access them forever in
                your library.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 text-2xl">
                ✨
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">
                All Skill Levels
              </h3>
              <p className="text-gray-600">
                From beginner-friendly to advanced techniques, find patterns
                for your level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Start Your Next Project Today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of makers creating beautiful handmade pieces.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition text-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-transparent text-white font-medium rounded-lg border-2 border-white hover:bg-white/10 transition text-lg"
            >
              Browse Patterns
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
