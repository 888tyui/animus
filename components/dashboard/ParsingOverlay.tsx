'use client'

import { type FC, useMemo, useEffect } from 'react'
import { useAnimusStore } from '@/lib/store'
import styles from './ParsingOverlay.module.css'

const STAGE_LABELS: Record<string, string> = {
  fetching: 'Fetching repository...',
  parsing: 'Discovering files...',
  computing: 'Inferring dependencies...',
  layouting: 'Building layout...',
  done: 'Complete!',
}

const ParsingOverlay: FC = () => {
  const parsingState = useAnimusStore((s) => s.parsingState)

  const { isActive, progress, stage } = parsingState

  // Lock scroll while parsing overlay is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [isActive])

  // We no longer show file/edge counts during parsing because the graph hasn't
  // been added to the store yet. Showing the "last graph" would display data
  // from an unrelated graph, confusing the user.

  const stageLabel = useMemo(() => {
    if (!stage) return 'Preparing...'
    return STAGE_LABELS[stage] || 'Processing...'
  }, [stage])

  const repoDisplay = useMemo(() => {
    const url = parsingState.repoUrl
    if (!url) return null
    // Extract owner/repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) return `${match[1]}/${match[2]}`
    return url
  }, [parsingState.repoUrl])

  const progressPercent = Math.min(Math.round(progress), 100)

  if (!isActive) return null

  // Auto-dismiss is handled by the parent component (NewGraphModal sets isActive to false)

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {/* Forming Animation */}
        <div className={styles.animation}>
          {/* Connection lines */}
          <div className={`${styles.formingLine} ${styles.fLine1}`} />
          <div className={`${styles.formingLine} ${styles.fLine2}`} />
          <div className={`${styles.formingLine} ${styles.fLine3}`} />
          <div className={`${styles.formingLine} ${styles.fLine4}`} />

          {/* Dots */}
          <div className={`${styles.formingDot} ${styles.dot1}`} />
          <div className={`${styles.formingDot} ${styles.dot2}`} />
          <div className={`${styles.formingDot} ${styles.dot3}`} />
          <div className={`${styles.formingDot} ${styles.dot4}`} />
          <div className={`${styles.formingDot} ${styles.dot5}`} />
          <div className={`${styles.formingDot} ${styles.dot6}`} />
        </div>

        {/* Repo Name + Stage Text */}
        {repoDisplay && (
          <p className={styles.repoName}>{repoDisplay}</p>
        )}
        <p className={styles.stageText}>{stageLabel}</p>

        {/* Progress Bar */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={styles.progressLabel}>{progressPercent}%</span>
        </div>

        {/* Counts removed: the graph being parsed hasn't been added to the store
            yet, so we'd show data from an unrelated graph. The progress bar
            and stage label provide sufficient feedback. */}
      </div>
    </div>
  )
}

export default ParsingOverlay
