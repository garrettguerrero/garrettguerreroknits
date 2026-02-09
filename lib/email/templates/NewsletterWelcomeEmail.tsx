import * as React from 'react'

interface NewsletterWelcomeEmailProps {
  appUrl: string
}

export const NewsletterWelcomeEmail = ({ appUrl }: NewsletterWelcomeEmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#1f2937', fontSize: '32px', marginBottom: '10px' }}>
          Garrett Guerrero Knits
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Welcome to our community! 🧶</p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '15px' }}>✨</div>
        <h2 style={{ color: '#1f2937', fontSize: '24px', marginTop: '0', marginBottom: '15px' }}>
          Thanks for subscribing!
        </h2>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '0' }}>
          You're now part of our crafting community. Get ready for pattern inspiration, tips, and exclusive offers!
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#1f2937', fontSize: '20px', marginBottom: '15px' }}>
          What to expect:
        </h3>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🎨</span>
            <div>
              <strong style={{ color: '#1f2937' }}>New Pattern Releases</strong>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                Be the first to know when we launch new designs
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>💡</span>
            <div>
              <strong style={{ color: '#1f2937' }}>Crafting Tips & Tricks</strong>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                Expert advice to level up your knitting and crochet skills
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>🎁</span>
            <div>
              <strong style={{ color: '#1f2937' }}>Exclusive Offers</strong>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                Subscriber-only discounts and free patterns
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '24px', marginRight: '12px' }}>📚</span>
            <div>
              <strong style={{ color: '#1f2937' }}>Community Inspiration</strong>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                Project ideas, yarn recommendations, and more
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '25px', marginBottom: '30px', textAlign: 'center' }}>
        <h3 style={{ color: '#1e40af', fontSize: '18px', marginTop: '0', marginBottom: '15px' }}>
          🎉 Start exploring our patterns
        </h3>
        <p style={{ marginBottom: '20px', color: '#1f2937' }}>
          Browse our collection of beautiful knitting and crochet patterns
        </p>
        <a
          href={`${appUrl}/marketplace`}
          style={{
            display: 'inline-block',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '14px 32px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Browse Patterns
        </a>
      </div>

      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <p style={{ color: '#92400e', marginTop: '0', marginBottom: '10px' }}>
          <strong>💡 Pro tip:</strong> Create a free account to save your favorite patterns and access them from any device!
        </p>
        <div style={{ textAlign: 'center' }}>
          <a
            href={`${appUrl}/auth/signup`}
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              color: '#92400e',
              padding: '10px 24px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              border: '1px solid #fcd34d',
            }}
          >
            Create Free Account
          </a>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        <p style={{ marginBottom: '10px' }}>We're so glad you're here! 🧶</p>
        <p style={{ marginBottom: '15px' }}>
          Questions or feedback? Reply to this email anytime.
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '20px' }}>
          You're receiving this because you subscribed to our newsletter.<br />
          Don't want these emails? You can unsubscribe at any time.
        </p>
      </div>
    </body>
  </html>
)

export default NewsletterWelcomeEmail
