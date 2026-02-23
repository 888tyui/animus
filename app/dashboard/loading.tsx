'use client'

import styles from './loading.module.css'

export default function DashboardLoading() {
  return (
    <div className={styles.loadingGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader}>
            <div className={`${styles.shimmer} ${styles.skeletonIcon}`} />
            <div className={styles.skeletonHeaderText}>
              <div className={`${styles.shimmer} ${styles.skeletonTitle}`} />
              <div className={`${styles.shimmer} ${styles.skeletonSubtitle}`} />
            </div>
          </div>
          <div className={styles.skeletonBody}>
            <div className={`${styles.shimmer} ${styles.skeletonLine}`} />
            <div className={`${styles.shimmer} ${styles.skeletonLineShort}`} />
          </div>
          <div className={styles.skeletonFooter}>
            <div className={`${styles.shimmer} ${styles.skeletonBadge}`} />
            <div className={`${styles.shimmer} ${styles.skeletonBadge}`} />
            <div className={`${styles.shimmer} ${styles.skeletonBadgeLong}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
