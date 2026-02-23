'use client'

import { type FC, useMemo } from 'react'
import { Plus, LayoutGrid, List, ChevronDown } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import type { SortMode, ViewMode } from '@/lib/store/slices/uiSlice'
import GraphCard from './GraphCard'
import EmptyState from './EmptyState'
import styles from './GraphList.module.css'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'health', label: 'Health' },
  { value: 'files', label: 'Files' },
]

const GraphList: FC = () => {
  const graphs = useAnimusStore((s) => s.graphs)
  const workspaces = useAnimusStore((s) => s.workspaces)
  const activeWorkspaceId = useAnimusStore((s) => s.activeWorkspaceId)
  const openNewGraphModal = useAnimusStore((s) => s.openNewGraphModal)
  const searchQuery = useAnimusStore((s) => s.searchQuery)
  const sortMode = useAnimusStore((s) => s.sortMode)
  const viewMode = useAnimusStore((s) => s.viewMode)
  const setSortMode = useAnimusStore((s) => s.setSortMode)
  const setViewMode = useAnimusStore((s) => s.setViewMode)

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId]
  )

  const filteredGraphs = useMemo(() => {
    let list =
      activeWorkspaceId === null
        ? graphs
        : graphs.filter((g) => g.workspaceId === activeWorkspaceId)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.repoName.toLowerCase().includes(q) ||
          g.repoOwner.toLowerCase().includes(q)
      )
    }

    const sorted = [...list]
    switch (sortMode) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'health':
        sorted.sort((a, b) => b.healthScore - a.healthScore)
        break
      case 'files':
        sorted.sort((a, b) => b.fileCount - a.fileCount)
        break
      default:
        sorted.sort((a, b) => b.lastViewedAt - a.lastViewedAt)
    }
    return sorted
  }, [graphs, activeWorkspaceId, searchQuery, sortMode])

  // If no graphs exist at all and no workspace filter and no search, show EmptyState
  if (filteredGraphs.length === 0 && activeWorkspaceId === null && !searchQuery.trim()) {
    return <EmptyState />
  }

  const title = activeWorkspace ? activeWorkspace.name : 'Your Graphs'
  const count = filteredGraphs.length

  // Show "No results" when search yields nothing
  if (filteredGraphs.length === 0 && searchQuery.trim()) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>0 graphs</p>
        </div>
        <div className={styles.emptySearch}>
          <p>No graphs matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>
          {count} {count === 1 ? 'graph' : 'graphs'}
        </p>
      </div>

      {/* Controls Bar */}
      <div className={styles.controls}>
        <div className={styles.sortWrapper}>
          <select
            className={styles.sortSelect}
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="Sort graphs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className={styles.sortChevron} />
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
            title="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      <div className={viewMode === 'list' ? styles.listGrid : styles.grid}>
        {filteredGraphs.map((graph) => (
          <GraphCard key={graph.id} graph={graph} />
        ))}

        {/* New Graph card — always last */}
        <button className={styles.newCard} onClick={openNewGraphModal}>
          <div className={styles.newCardIcon}>
            <Plus size={22} />
          </div>
          <span className={styles.newCardLabel}>New Graph</span>
        </button>
      </div>
    </div>
  )
}

export default GraphList
