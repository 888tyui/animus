'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Minus, Maximize2, Expand, Shrink } from 'lucide-react'
import type { GraphControlsAPI } from '@/lib/types'
import styles from './GraphControls.module.css'

/* ═══════════════════════════════════════════
   Graph Controls — Zoom & View Buttons
   ═══════════════════════════════════════════ */

interface GraphControlsProps {
  controlsAPI?: GraphControlsAPI | null
}

export default function GraphControls({ controlsAPI }: GraphControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Sync fullscreen state when user exits via Escape key (browser native)
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    // State is synced via fullscreenchange listener
  }, [])

  return (
    <div className={styles.controls}>
      <button
        className={styles.controlBtn}
        title="Zoom In"
        aria-label="Zoom In"
        disabled={!controlsAPI}
        onClick={() => controlsAPI?.zoomIn()}
      >
        <Plus size={16} />
      </button>
      <button
        className={styles.controlBtn}
        title="Zoom Out"
        aria-label="Zoom Out"
        disabled={!controlsAPI}
        onClick={() => controlsAPI?.zoomOut()}
      >
        <Minus size={16} />
      </button>
      <div className={styles.divider} />
      <button
        className={styles.controlBtn}
        title="Fit to View"
        aria-label="Fit to View"
        disabled={!controlsAPI}
        onClick={() => controlsAPI?.fitToView()}
      >
        <Maximize2 size={16} />
      </button>
      <button
        className={styles.controlBtn}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        onClick={handleFullscreen}
      >
        {isFullscreen ? <Shrink size={16} /> : <Expand size={16} />}
      </button>
    </div>
  )
}
