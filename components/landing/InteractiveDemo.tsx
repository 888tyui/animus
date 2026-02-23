'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  RotateCcw,
  Thermometer,
  X,
  FileCode2,
  GitFork,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import styles from './InteractiveDemo.module.css'

const DemoScene = dynamic(() => import('@/components/three/DemoScene'), {
  ssr: false,
  loading: () => <div className={styles.sceneLoading} />,
})

interface SelectedFile {
  name: string
  path: string
  ext: string
  lines: number
  complexity: number
  deps: number
  dependents: number
  cluster: number
}

const EXT_LABELS: Record<string, { label: string; color: string }> = {
  tsx: { label: 'TypeScript React', color: '#00E89C' },
  jsx: { label: 'JavaScript React', color: '#00E89C' },
  ts: { label: 'TypeScript', color: '#0ABF80' },
  js: { label: 'JavaScript', color: '#0ABF80' },
  css: { label: 'CSS', color: '#FF5C87' },
  json: { label: 'JSON', color: '#FFB444' },
  env: { label: 'Environment', color: '#888' },
  md: { label: 'Markdown', color: '#999' },
}

export default function InteractiveDemo() {
  const sectionRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [heatmapOn, setHeatmapOn] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Import the file list to map back to index
  const handleFileSelect = useCallback((file: SelectedFile | null) => {
    setSelectedFile(file)
    if (file === null) {
      setSelectedIndex(null)
    }
  }, [])

  // When a file is selected externally from the scene, find its index
  useEffect(() => {
    if (selectedFile) {
      // Dynamic import the list
      import('@/components/three/DemoScene').then((mod) => {
        const files = mod.DEMO_FILES
        const idx = files.findIndex(
          (f: SelectedFile) => f.path === selectedFile.path
        )
        setSelectedIndex(idx >= 0 ? idx : null)
      })
    }
  }, [selectedFile])

  // Panel animation is handled via CSS transitions

  // Scroll reveal
  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add(styles.visible)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const complexityPercent = selectedFile
    ? Math.min(100, Math.round((selectedFile.complexity / 80) * 100))
    : 0

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
    <section ref={sectionRef} id="demo" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Interactive Demo</span>
          <h2 className={styles.title}>
            Try it{' '}
            <span className={styles.titleAccent}>yourself</span>
          </h2>
          <p className={styles.subtitle}>
            Orbit, zoom, and click any node to inspect a file. This is a
            sample codebase — your repos will look even better.
          </p>
        </div>

        <div ref={wrapperRef} className={styles.demoWrapper}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.windowDots}>
                <span className={styles.dot} style={{ background: '#FF5F57' }} />
                <span className={styles.dot} style={{ background: '#FFBD2E' }} />
                <span className={styles.dot} style={{ background: '#28C840' }} />
              </div>
              <span className={styles.toolbarTitle}>
                sample-project — Animus Graph View
              </span>
            </div>
            <div className={styles.toolbarActions}>
              <button
                className={`${styles.toolbarBtn} ${heatmapOn ? styles.toolbarBtnActive : ''}`}
                onClick={() => setHeatmapOn(!heatmapOn)}
              >
                <Thermometer size={14} />
                <span>Heatmap</span>
              </button>
              <button
                className={styles.toolbarBtn}
                onClick={() => {
                  setSelectedFile(null)
                  setSelectedIndex(null)
                  setHeatmapOn(false)
                }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Canvas Container */}
          <div className={styles.canvasContainer}>
            <DemoScene
              onSelect={handleFileSelect}
              selectedIndex={selectedIndex}
              heatmapOn={heatmapOn}
            />

            {/* Legend */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#00E89C' }} />
                <span>.tsx</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#0ABF80' }} />
                <span>.ts</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#FF5C87' }} />
                <span>.css</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#FFB444' }} />
                <span>.json</span>
              </div>
            </div>

            {/* Hint */}
            {!selectedFile && (
              <div className={styles.hint}>
                Click any node to inspect
              </div>
            )}

            {/* Inspection Panel */}
            {selectedFile && (
              <div ref={panelRef} className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelFileInfo}>
                    <FileCode2
                      size={16}
                      style={{
                        color:
                          EXT_LABELS[selectedFile.ext]?.color || '#888',
                      }}
                    />
                    <span className={styles.panelFileName}>
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    className={styles.panelClose}
                    onClick={() => {
                      setSelectedFile(null)
                      setSelectedIndex(null)
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className={styles.panelPath}>{selectedFile.path}</div>

                <div className={styles.panelBadge}>
                  <span
                    className={styles.extBadge}
                    style={{
                      borderColor: `${EXT_LABELS[selectedFile.ext]?.color || '#888'}44`,
                      color: EXT_LABELS[selectedFile.ext]?.color || '#888',
                    }}
                  >
                    {EXT_LABELS[selectedFile.ext]?.label || selectedFile.ext}
                  </span>
                </div>

                <div className={styles.panelStats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Lines</span>
                    <span className={styles.statValue}>
                      {selectedFile.lines}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Dependencies</span>
                    <span className={styles.statValue}>
                      <GitFork size={12} />
                      {selectedFile.deps}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Dependents</span>
                    <span className={styles.statValue}>
                      <ArrowUpRight size={12} />
                      {selectedFile.dependents}
                    </span>
                  </div>
                </div>

                <div className={styles.complexitySection}>
                  <div className={styles.complexityHeader}>
                    <Activity
                      size={13}
                      style={{ color: complexityColor }}
                    />
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
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
