import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let profileError = null

  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data
    profileError = error
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-bold">✅ Authenticated</p>
              <p>
                <strong>User ID:</strong> {user.id}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          ) : (
            <p className="text-red-600 font-bold">❌ Not Authenticated</p>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          {profileError ? (
            <div className="text-red-600">
              <p className="font-bold">❌ Error loading profile</p>
              <pre className="mt-2 p-4 bg-red-50 rounded text-sm overflow-auto">
                {JSON.stringify(profileError, null, 2)}
              </pre>
            </div>
          ) : profile ? (
            <div className="space-y-2">
              <p>
                <strong>Profile ID:</strong> {profile.id}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Display Name:</strong> {profile.display_name || 'N/A'}
              </p>
              <p className="text-lg">
                <strong>Is Admin:</strong>{' '}
                {profile.is_admin ? (
                  <span className="text-green-600 font-bold">✅ TRUE</span>
                ) : (
                  <span className="text-red-600 font-bold">❌ FALSE</span>
                )}
              </p>
              <p>
                <strong>Newsletter Subscribed:</strong>{' '}
                {profile.newsletter_subscribed ? 'Yes' : 'No'}
              </p>
            </div>
          ) : user ? (
            <p className="text-yellow-600">⚠️ Profile not found</p>
          ) : (
            <p className="text-gray-500">Not logged in</p>
          )}
        </div>

        {/* Full Data */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Raw Data</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">User Object:</h3>
              <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-bold mb-2">Profile Object:</h3>
              <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Test Link */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold mb-2">Test Admin Access</h3>
          <p className="text-sm text-gray-600 mb-4">
            Based on the information above, you should{' '}
            {profile?.is_admin ? 'be able to' : 'NOT be able to'} access the
            admin panel.
          </p>
          <a
            href="/admin"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Try Accessing /admin
          </a>
        </div>
      </div>
    </div>
  )
}
