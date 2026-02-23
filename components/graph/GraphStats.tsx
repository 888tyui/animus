'use client'

import { FileText, GitFork } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import type { Graph } from '@/lib/types'
import styles from './GraphStats.module.css'

/* ═══════════════════════════════════════════
   Graph Stats — Floating Badge
   ═══════════════════════════════════════════ */

interface GraphStatsProps {
  graph: Graph
}

function getHealthColor(score: number): string {
  if (score >= 70) return '#00E89C'
  if (score >= 40) return '#FFAA44'
  return '#FF6B6B'
}

export default function GraphStats({ graph }: GraphStatsProps) {
  const healthColor = getHealthColor(graph.healthScore)
  const circumference = 2 * Math.PI * 10
  const offset = circumference - (graph.healthScore / 100) * circumference

  return (
    <div className={styles.stats}>
      <div className={styles.statItem}>
        <FileText size={12} />
        <span>{formatNumber(graph.fileCount)}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.statItem}>
        <GitFork size={12} />
        <span>{formatNumber(graph.edgeCount)}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.statItem}>
        <svg
          className={styles.healthRing}
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2.5"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke={healthColor}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 12 12)"
          />
        </svg>
        <span style={{ color: healthColor }}>{graph.healthScore}</span>
      </div>
    </div>
  )
}
