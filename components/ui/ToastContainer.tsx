'use client'

import { type FC, useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type Toast, type ToastType } from '@/lib/store/toastStore'
import styles from './ToastContainer.module.css'

const ICON_MAP: Record<ToastType, FC<{ size: number; strokeWidth: number }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
}

const ToastItem: FC<{ toast: Toast }> = ({ toast: t }) => {
  const removeToast = useToastStore((s) => s.removeToast)
  const [exiting, setExiting] = useState(false)

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => removeToast(t.id), 300)
  }, [removeToast, t.id])

  // Listen for external removal (auto-dismiss timer from store)
  // to trigger exit animation
  useEffect(() => {
    const duration = t.duration ?? DEFAULT_DURATIONS[t.type]
    if (duration <= 0) return
    // Start exit animation 300ms before store removes it
    const timer = setTimeout(() => setExiting(true), Math.max(duration - 300, 0))
    return () => clearTimeout(timer)
  }, [t.duration, t.type])

  const Icon = ICON_MAP[t.type]
  const duration = t.duration ?? DEFAULT_DURATIONS[t.type]

  return (
    <div
      className={`${styles.toast} ${styles[t.type]} ${exiting ? styles.exiting : ''}`}
      role="alert"
      style={{ '--toast-duration': `${duration}ms` } as React.CSSProperties}
    >
      <div className={styles.icon}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className={styles.body}>
        <p className={styles.message}>{t.message}</p>
      </div>
      <button className={styles.dismiss} onClick={dismiss} aria-label="Dismiss notification">
        <X size={14} strokeWidth={2} />
      </button>
      {duration > 0 && <div className={styles.progress} />}
    </div>
  )
}

const ToastContainer: FC = () => {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className={styles.container} aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

export default ToastContainer
