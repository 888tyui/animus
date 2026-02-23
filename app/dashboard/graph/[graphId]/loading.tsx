'use client'

import styles from './loading.module.css'

export default function GraphLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <span className={styles.loadingText}>Loading graph...</span>
    </div>
  )
}
