'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import styles from './error.module.css'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GraphError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('[GraphError]', error)
  }, [error])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <AlertTriangle size={28} />
        </div>
        <h2 className={styles.title}>Something went wrong</h2>
        <p className={styles.description}>
          The graph viewer encountered an unexpected error. This may be caused by
          corrupted data or a rendering issue.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={reset}>
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}
