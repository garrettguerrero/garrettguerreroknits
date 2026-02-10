import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

// Test script to check Supabase auth configuration
async function testAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  console.log('Testing Supabase Auth Configuration...\n')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...')

  // Try to sign up with a test email
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'Test123456!'

  console.log('\n--- Attempting signup with test email:', testEmail, '---')

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback',
    },
  })

  if (error) {
    console.error('❌ Signup error:', error.message)
    return
  }

  console.log('\n✅ Signup response received:')
  console.log('Session:', data.session ? '✅ Session created (email confirmation disabled)' : '❌ No session (email confirmation enabled)')
  console.log('User ID:', data.user?.id)
  console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No')
  console.log('Confirmation sent:', data.user?.confirmation_sent_at ? 'Yes' : 'No')

  if (!data.session) {
    console.log('\n📧 Email confirmation is ENABLED')
    console.log('Check if confirmation email was sent to:', testEmail)
    console.log('If no email received, SMTP may not be configured')
  } else {
    console.log('\n⚠️  Email confirmation is DISABLED')
    console.log('Users are automatically confirmed without email verification')
  }
}

testAuth().catch(console.error)
