'use client'

import { useMemo, useState } from 'react'
import { FILE_TYPES, DEFAULT_FILE_TYPE } from '@/lib/constants'
import type { GraphNode } from '@/lib/types'
import styles from './GraphLegend.module.css'

/* ═══════════════════════════════════════════
   Graph Legend — File Type Colors
   ═══════════════════════════════════════════ */

interface GraphLegendProps {
  nodes: GraphNode[]
}

export default function GraphLegend({ nodes }: GraphLegendProps) {
  const [expanded, setExpanded] = useState(false)

  const allExtensions = useMemo(() => {
    const counts: Record<string, number> = {}
    nodes.forEach((n) => {
      const ext = n.extension
      counts[ext] = (counts[ext] || 0) + 1
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([ext]) => ({
        ext,
        color: (FILE_TYPES[ext] || DEFAULT_FILE_TYPE).color,
      }))
  }, [nodes])

  const visibleExtensions = expanded ? allExtensions : allExtensions.slice(0, 6)
  const hiddenCount = allExtensions.length - 6

  if (allExtensions.length === 0) return null

  return (
    <div className={styles.legend}>
      {visibleExtensions.map(({ ext, color }) => (
        <div key={ext} className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: color }} />
          <span>.{ext}</span>
        </div>
      ))}
      {hiddenCount > 0 && (
        <button
          className={styles.toggleBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Less' : `+${hiddenCount}`}
        </button>
      )}
    </div>
  )
}
