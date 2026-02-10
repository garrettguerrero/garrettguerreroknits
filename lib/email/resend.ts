import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Production email addresses (requires domain verification in Resend)
// Using different prefixes on main domain for different email types
export const FROM_EMAIL = 'Garrett Guerrero Knits <orders@garrettguerreroknits.com>'
export const SUPPORT_EMAIL = 'support@garrettguerreroknits.com'

// Auth emails are sent by Supabase Auth, not Resend
// Configure this in: Supabase Dashboard → Authentication → Email Templates
// Set sender to: auth@garrettguerreroknits.com
export const AUTH_FROM_EMAIL = 'Garrett Guerrero Knits <auth@garrettguerreroknits.com>'
