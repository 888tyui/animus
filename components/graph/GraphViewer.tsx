'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAnimusStore } from '@/lib/store'
import { api, getAuthToken } from '@/lib/api/client'
import { toast } from '@/lib/store/toastStore'
import type { Graph, GraphControlsAPI } from '@/lib/types'
import GraphToolbar from './GraphToolbar'
import InspectionPanel from './InspectionPanel'
import GraphLegend from './GraphLegend'
import GraphControls from './GraphControls'
import GraphStats from './GraphStats'
import styles from './GraphViewer.module.css'

/* ═══════════════════════════════════════════
   Graph Viewer — Main Composition
   ═══════════════════════════════════════════ */

const GraphScene = dynamic(() => import('@/components/graph/GraphScene'), {
  ssr: false,
  loading: () => <div className={styles.sceneLoading} />,
})

interface GraphFullDTO {
  id: string
  name: string
  repoOwner: string
  repoName: string
  repoUrl: string
  workspaceId: string | null
  fileCount: number
  edgeCount: number
  healthScore: number
  createdAt: string
  lastViewedAt: string
  nodes: Graph['nodes']
  edges: Graph['edges']
}

interface GraphViewerProps {
  graphId: string
}

export default function GraphViewer({ graphId }: GraphViewerProps) {
  const router = useRouter()
  const graph = useAnimusStore((s) => s.graphs.find((g) => g.id === graphId))
  const updateLastViewed = useAnimusStore((s) => s.updateLastViewed)
  const hydrateGraphs = useAnimusStore((s) => s.hydrateGraphs)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [heatmapOn, setHeatmapOn] = useState(false)
  const [controlsAPI, setControlsAPI] = useState<GraphControlsAPI | null>(null)
  const [isLoadingFullGraph, setIsLoadingFullGraph] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  // Update last viewed on mount
  useEffect(() => {
    if (graph) {
      updateLastViewed(graph.id)
    }
  }, [graph?.id, updateLastViewed])

  // Lazy-load full graph data when nodes/edges are empty (server-hydrated summary)
  useEffect(() => {
    if (!graph || fetchedRef.current) return
    if (graph.nodes.length > 0) return // already loaded
    if (!getAuthToken()) return // no auth = client-side only, data should be present

    fetchedRef.current = true
    setIsLoadingFullGraph(true)
    setLoadError(null)

    api.get<GraphFullDTO>(`/graphs/${graph.id}`)
      .then((full) => {
        const store = useAnimusStore.getState()
        const updatedGraphs = store.graphs.map((g) =>
          g.id === full.id
            ? {
                ...g,
                nodes: full.nodes,
                edges: full.edges,
                fileCount: full.fileCount,
                edgeCount: full.edgeCount,
                healthScore: full.healthScore,
              }
            : g
        )
        hydrateGraphs(updatedGraphs)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load graph data'
        setLoadError(msg)
        toast.error('Could not load graph data. Check your connection and try again.')
      })
      .finally(() => setIsLoadingFullGraph(false))
  }, [graph, hydrateGraphs])

  const handleSelect = useCallback((index: number | null) => {
    setSelectedIndex(index)
  }, [])

  const handleToggleHeatmap = useCallback(() => {
    setHeatmapOn((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setSelectedIndex(null)
    setHeatmapOn(false)
  }, [])

  const handleBack = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const handleClosePanel = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  const selectedNode = useMemo(() => {
    if (selectedIndex === null || !graph) return null
    return graph.nodes[selectedIndex] || null
  }, [selectedIndex, graph])

  if (!graph) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorContent}>
          <h2 className={styles.errorTitle}>Graph not found</h2>
          <p className={styles.errorDescription}>
            The graph you are looking for does not exist or has been removed.
          </p>
          <button className={styles.errorBtn} onClick={handleBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show loading state while fetching full graph data from server
  if (isLoadingFullGraph || (graph.nodes.length === 0 && getAuthToken() && !loadError)) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorContent}>
          <div className={styles.loadingSpinner} />
          <h2 className={styles.errorTitle}>Loading graph data...</h2>
          <p className={styles.errorDescription}>
            Fetching {graph.name} from the server
          </p>
        </div>
      </div>
    )
  }

  // Show error if full graph fetch failed
  if (loadError) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorContent}>
          <h2 className={styles.errorTitle}>Failed to load graph</h2>
          <p className={styles.errorDescription}>{loadError}</p>
          <button
            className={styles.errorBtn}
            onClick={() => {
              fetchedRef.current = false
              setLoadError(null)
            }}
          >
            Retry
          </button>
          <button className={styles.errorBtn} onClick={handleBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.viewer}>
      <GraphToolbar
        graphName={graph.name}
        heatmapOn={heatmapOn}
        onToggleHeatmap={handleToggleHeatmap}
        onReset={handleReset}
        onBack={handleBack}
      />
      <div className={styles.canvasArea}>
        <GraphScene
          graph={graph}
          selectedIndex={selectedIndex}
          heatmapOn={heatmapOn}
          onSelect={handleSelect}
          onControlsReady={setControlsAPI}
        />
        <InspectionPanel node={selectedNode} onClose={handleClosePanel} />
        <GraphLegend nodes={graph.nodes} />
        <GraphControls controlsAPI={controlsAPI} />
        <GraphStats graph={graph} />
      </div>
    </div>
  )
}
