'use client'

import {
  X,
  FileCode2,
  GitFork,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import { FILE_TYPES, DEFAULT_FILE_TYPE } from '@/lib/constants'
import type { GraphNode } from '@/lib/types'
import styles from './InspectionPanel.module.css'

/* ═══════════════════════════════════════════
   Inspection Panel — Selected Node Details
   ═══════════════════════════════════════════ */

interface InspectionPanelProps {
  node: GraphNode | null
  onClose: () => void
}

export default function InspectionPanel({ node, onClose }: InspectionPanelProps) {
  if (!node) return null

  const fileType = FILE_TYPES[node.extension] || DEFAULT_FILE_TYPE
  const complexityPercent = Math.min(100, node.complexity)

  const complexityLabel =
    complexityPercent > 66
      ? 'High'
      : complexityPercent > 33
      ? 'Medium'
      : 'Low'

  const complexityColor =
    complexityPercent > 66
      ? '#FF6B6B'
      : complexityPercent > 33
      ? '#FFAA44'
      : '#00E89C'

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelFileInfo}>
          <FileCode2
            size={16}
            style={{ color: fileType.color }}
          />
          <span className={styles.panelFileName}>{node.name}</span>
        </div>
        <button className={styles.panelClose} onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className={styles.panelPath}>{node.path}</div>

      <div className={styles.panelBadge}>
        <span
          className={styles.extBadge}
          style={{
            borderColor: `${fileType.color}44`,
            color: fileType.color,
          }}
        >
          {fileType.label}
        </span>
      </div>

      <div className={styles.panelStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Lines</span>
          <span className={styles.statValue}>{node.lines}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Dependencies</span>
          <span className={styles.statValue}>
            <GitFork size={12} />
            {node.deps}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Dependents</span>
          <span className={styles.statValue}>
            <ArrowUpRight size={12} />
            {node.dependents}
          </span>
        </div>
      </div>

      <div className={styles.complexitySection}>
        <div className={styles.complexityHeader}>
          <Activity size={13} style={{ color: complexityColor }} />
          <span className={styles.complexityLabel}>Complexity</span>
          <span
            className={styles.complexityBadge}
            style={{ color: complexityColor }}
          >
            {complexityLabel}
          </span>
        </div>
        <div className={styles.complexityBar}>
          <div
            className={styles.complexityFill}
            style={{
              width: `${complexityPercent}%`,
              background: complexityColor,
            }}
          />
        </div>
      </div>
    </div>
  )
}
