import * as React from 'react'

interface OrderItem {
  title: string
  price: number
  type: 'pattern' | 'bundle'
}

interface PurchaseConfirmationEmailProps {
  orderId: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  customerEmail: string
  appUrl: string
}

export const PurchaseConfirmationEmail = ({
  orderId,
  items,
  subtotal,
  discount,
  total,
  customerEmail,
  appUrl,
}: PurchaseConfirmationEmailProps) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#1f2937', fontSize: '32px', marginBottom: '10px' }}>
          Garrett Guerrero Knits
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Order Confirmation</p>
      </div>

      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '20px', marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
        <h2 style={{ color: '#16a34a', fontSize: '24px', margin: '0 0 10px 0' }}>
          Thank you for your order!
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '5px' }}>
          Order #{orderId.slice(0, 8)}
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          A confirmation has been sent to {customerEmail}
        </p>
      </div>

      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ color: '#1f2937', fontSize: '18px', marginTop: '0', marginBottom: '20px' }}>
          Order Summary
        </h3>

        <div>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <div>
                <div style={{ fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>{item.type}</div>
              </div>
              <div style={{ fontWeight: '500', color: '#1f2937' }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span style={{ color: '#1f2937' }}>${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#16a34a' }}>Discount</span>
              <span style={{ color: '#16a34a' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginTop: '12px' }}>
            <span style={{ color: '#1f2937' }}>Total</span>
            <span style={{ color: '#1f2937' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '25px', marginBottom: '30px', textAlign: 'center' }}>
        <h3 style={{ color: '#1e40af', fontSize: '18px', marginTop: '0', marginBottom: '15px' }}>
          📚 Your patterns are ready!
        </h3>
        <p style={{ marginBottom: '20px', color: '#1f2937' }}>
          Access all your purchased patterns in your library
        </p>
        <a
          href={`${appUrl}/library`}
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
          View My Library
        </a>
      </div>

      <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h4 style={{ color: '#92400e', fontSize: '16px', marginTop: '0', marginBottom: '10px' }}>
          💡 Tips for your patterns:
        </h4>
        <ul style={{ marginBottom: '0', paddingLeft: '20px', color: '#92400e' }}>
          <li>Download the PDF for offline access</li>
          <li>Read online with our interactive pattern reader</li>
          <li>Get notified when we release updates</li>
          <li>Leave a review to help other crafters</li>
        </ul>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        <p style={{ marginBottom: '10px' }}>Happy crafting! 🧶</p>
        <p style={{ marginBottom: '5px' }}>Questions about your order? Reply to this email or contact us at support@garrettguerreroknits.com</p>
        <p style={{ marginTop: '15px' }}>
          <a href={`${appUrl}/library`} style={{ color: '#2563eb', textDecoration: 'none', marginRight: '15px' }}>My Library</a>
          <a href={`${appUrl}/marketplace`} style={{ color: '#2563eb', textDecoration: 'none', marginRight: '15px' }}>Browse More Patterns</a>
          <a href={appUrl} style={{ color: '#2563eb', textDecoration: 'none' }}>Visit Our Site</a>
        </p>
      </div>
    </body>
  </html>
)

export default PurchaseConfirmationEmail
