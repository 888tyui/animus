'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={bodyStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconStyle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5C87" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 style={titleStyle}>Something went wrong</h1>
            <p style={descStyle}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {error.digest && (
              <p style={digestStyle}>Error ID: {error.digest}</p>
            )}
            <button onClick={reset} style={btnStyle}>
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  background: '#06050E',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  minHeight: '100vh',
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '2rem',
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: 400,
  padding: '3rem 2rem',
  borderRadius: 20,
  background: 'rgba(12, 11, 24, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
}

const iconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: 16,
  background: 'rgba(255, 92, 135, 0.1)',
  marginBottom: 20,
}

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 400,
  color: '#F2F0EE',
  marginBottom: 8,
}

const descStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'rgba(242, 240, 238, 0.55)',
  lineHeight: 1.6,
  marginBottom: 8,
}

const digestStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: 'rgba(242, 240, 238, 0.3)',
  marginBottom: 24,
}

const btnStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '12px 28px',
  borderRadius: 100,
  border: 'none',
  background: 'linear-gradient(135deg, #00E89C 0%, #00C07A 100%)',
  color: '#06050E',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
}
