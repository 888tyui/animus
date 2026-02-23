'use client'

import { type FC } from 'react'
import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const SIZES: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 36,
}

const Spinner: FC<SpinnerProps> = ({ size = 'md', color }) => {
  const px = SIZES[size]

  return (
    <span
      className={styles.spinner}
      style={{
        width: px,
        height: px,
        borderColor: color ? `${color}33` : undefined,
        borderTopColor: color || undefined,
      }}
      role="status"
      aria-label="Loading"
    />
  )
}

export default Spinner
