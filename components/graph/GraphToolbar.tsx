'use client'

import { ArrowLeft, Thermometer, RotateCcw } from 'lucide-react'
import styles from './GraphToolbar.module.css'

/* ═══════════════════════════════════════════
   Graph Toolbar — Control Bar
   ═══════════════════════════════════════════ */

interface GraphToolbarProps {
  graphName: string
  heatmapOn: boolean
  onToggleHeatmap: () => void
  onReset: () => void
  onBack: () => void
}

export default function GraphToolbar({
  graphName,
  heatmapOn,
  onToggleHeatmap,
  onReset,
  onBack,
}: GraphToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
        <span className={styles.graphName}>{graphName}</span>
      </div>
      <div className={styles.toolbarRight}>
        <button
          className={`${styles.toolbarBtn} ${heatmapOn ? styles.toolbarBtnActive : ''}`}
          onClick={onToggleHeatmap}
        >
          <Thermometer size={14} />
          <span>Heatmap</span>
        </button>
        <button className={styles.toolbarBtn} onClick={onReset}>
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
