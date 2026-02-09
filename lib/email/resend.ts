import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Production email addresses (requires domain verification in Resend)
// Using subdomain orders.garrettguerreroknits.com for all transactional emails
export const FROM_EMAIL = 'Garrett Guerrero Knits <noreply@orders.garrettguerreroknits.com>'
export const SUPPORT_EMAIL = 'support@orders.garrettguerreroknits.com'
