'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error)
  }, [error])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconWrapperStyle}>
          <AlertTriangle size={28} strokeWidth={1.8} style={{ color: '#FF5C87' }} />
        </div>
        <h2 style={titleStyle}>Something went wrong</h2>
        <p style={descStyle}>
          {error.message || 'An unexpected error occurred in the dashboard.'}
        </p>
        {error.digest && (
          <p style={digestStyle}>Error ID: {error.digest}</p>
        )}
        <div style={actionsStyle}>
          <button onClick={reset} style={primaryBtnStyle}>
            <RotateCcw size={15} strokeWidth={2} />
            Try Again
          </button>
          <button onClick={() => router.push('/dashboard')} style={secondaryBtnStyle}>
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  padding: '2rem',
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: 420,
  padding: '3rem 2rem',
  borderRadius: 20,
  background: 'rgba(12, 11, 24, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
}

const iconWrapperStyle: React.CSSProperties = {
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
  fontFamily: 'var(--font-display), serif',
  fontSize: '1.5rem',
  fontWeight: 400,
  color: '#F2F0EE',
  marginBottom: 8,
}

const descStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body), system-ui, sans-serif',
  fontSize: '0.875rem',
  color: 'rgba(242, 240, 238, 0.55)',
  lineHeight: 1.6,
  marginBottom: 8,
  maxWidth: 320,
}

const digestStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: 'rgba(242, 240, 238, 0.3)',
  marginBottom: 24,
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 16,
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 20px',
  borderRadius: 100,
  border: 'none',
  background: 'linear-gradient(135deg, #00E89C 0%, #00C07A 100%)',
  color: '#06050E',
  fontSize: '0.8125rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body), system-ui, sans-serif',
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 20px',
  borderRadius: 100,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(255, 255, 255, 0.04)',
  color: '#F2F0EE',
  fontSize: '0.8125rem',
  fontWeight: 500,
  fontFamily: 'var(--font-body), system-ui, sans-serif',
  cursor: 'pointer',
}
