import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
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
                  href="/marketplace?filter=free"
                  className="px-8 py-4 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition text-lg"
                >
                  Free Patterns
                </Link>
              </div>
            </div>
          </div>
        </section>

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
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Start Your Next Project Today
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of makers creating beautiful handmade pieces.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
