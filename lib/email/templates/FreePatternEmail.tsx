import * as React from 'react'

interface FreePatternEmailProps {
  patternTitle: string
  downloadUrl: string
  patternSlug: string
  appUrl: string
}

export const FreePatternEmail = ({
  patternTitle,
  downloadUrl,
  patternSlug,
  appUrl,
}: FreePatternEmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#1f2937', fontSize: '32px', marginBottom: '10px' }}>
          Garrett Guerrero Knits
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Thank you for downloading!</p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', marginBottom: '30px' }}>
        <h2 style={{ color: '#1f2937', fontSize: '24px', marginTop: '0', marginBottom: '15px' }}>
          {patternTitle}
        </h2>
        <p style={{ marginBottom: '20px' }}>
          Your free pattern is ready! Click the button below to download your PDF:
        </p>
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={downloadUrl}
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
            Download Pattern PDF
          </a>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          This download link expires in 24 hours.
        </p>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ color: '#1e40af', fontSize: '18px', marginTop: '0', marginBottom: '10px' }}>
          💡 Create an account to access your patterns anytime
        </h3>
        <p style={{ marginBottom: '15px' }}>
          Save this pattern to your library forever! With an account, you can:
        </p>
        <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Access all your patterns from any device</li>
          <li>Get notified when patterns are updated</li>
          <li>Save your favorite patterns</li>
          <li>Quick checkout for future purchases</li>
        </ul>
        <div style={{ textAlign: 'center' }}>
          <a
            href={`${appUrl}/auth/signup?email=${encodeURIComponent('')}`}
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              color: '#2563eb',
              padding: '10px 24px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              border: '1px solid #2563eb',
            }}
          >
            Create Free Account
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a
          href={`${appUrl}/patterns/${patternSlug}`}
          style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}
        >
          View Pattern Details →
        </a>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        <p style={{ marginBottom: '10px' }}>Happy crafting! 🧶</p>
        <p style={{ marginBottom: '5px' }}>Questions? Reply to this email or contact us at support@garrettguerreroknits.com</p>
        <p style={{ marginTop: '15px' }}>
          <a href={`${appUrl}/marketplace`} style={{ color: '#2563eb', textDecoration: 'none', marginRight: '15px' }}>Browse Patterns</a>
          <a href={appUrl} style={{ color: '#2563eb', textDecoration: 'none' }}>Visit Our Site</a>
        </p>
      </div>
    </body>
  </html>
)

export default FreePatternEmail
