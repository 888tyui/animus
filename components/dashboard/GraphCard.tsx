'use client'

import { type FC, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, GitFork, MoreHorizontal, Pencil, FolderInput, Trash2 } from 'lucide-react'
import type { Graph } from '@/lib/types'
import { useAnimusStore } from '@/lib/store'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { FILE_TYPES, DEFAULT_FILE_TYPE } from '@/lib/constants'
import InlineRename from './InlineRename'
import styles from './GraphCard.module.css'

interface GraphCardProps {
  graph: Graph
}

const GraphCard: FC<GraphCardProps> = ({ graph }) => {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const setDeleteConfirmTarget = useAnimusStore((s) => s.setDeleteConfirmTarget)
  const setMoveToWorkspaceTarget = useAnimusStore((s) => s.setMoveToWorkspaceTarget)
  const updateLastViewed = useAnimusStore((s) => s.updateLastViewed)

  // Close menu when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen, handleClickOutside])

  // Determine top-right color dot from first node's extension
  const firstExt = graph.nodes.length > 0 ? graph.nodes[0].extension : ''
  const fileTypeInfo = FILE_TYPES[firstExt] || DEFAULT_FILE_TYPE
  const dotColor = fileTypeInfo.color

  // Health score color — uses CSS variable values for consistency
  const healthColor =
    graph.healthScore > 70
      ? 'var(--color-electric)'
      : graph.healthScore > 40
        ? 'var(--color-cyan)'
        : 'var(--color-pulse)'

  // SVG ring calculations
  const ringRadius = 14
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (graph.healthScore / 100) * ringCircumference

  const handleCardClick = () => {
    updateLastViewed(graph.id)
    router.push(`/dashboard/graph/${graph.id}`)
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen((prev) => !prev)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setIsRenaming(true)
  }

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      useAnimusStore.getState().renameGraph(graph.id, newName)
      setIsRenaming(false)
    },
    [graph.id]
  )

  const handleRenameCancel = useCallback(() => {
    setIsRenaming(false)
  }, [])

  const handleMoveToWorkspace = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setMoveToWorkspaceTarget({ graphId: graph.id, graphName: graph.name })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setDeleteConfirmTarget({ type: 'graph', id: graph.id, name: graph.name })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <div
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open graph ${graph.name}`}
    >
      {/* File type dot */}
      <div className={styles.typeDot} style={{ background: dotColor }} />

      {/* Header */}
      <div className={styles.header}>
        {isRenaming ? (
          <InlineRename
            value={graph.name}
            onConfirm={handleRenameConfirm}
            onCancel={handleRenameCancel}
            className={styles.repoName}
          />
        ) : (
          <h3 className={styles.repoName}>{graph.repoName}</h3>
        )}
        <span className={styles.ownerRepo}>
          {graph.repoOwner}/{graph.repoName}
        </span>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <FileText size={14} />
          </span>
          <span>{formatNumber(graph.fileCount)} files</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <GitFork size={14} />
          </span>
          <span>{formatNumber(graph.edgeCount)} edges</span>
        </div>

        {/* Health ring */}
        <div className={styles.healthWrapper}>
          <svg
            width={36}
            height={36}
            className={styles.healthRing}
            viewBox="0 0 36 36"
          >
            <circle
              className={styles.healthTrack}
              cx="18"
              cy="18"
              r={ringRadius}
            />
            <circle
              className={styles.healthProgress}
              cx="18"
              cy="18"
              r={ringRadius}
              stroke={healthColor}
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <span className={styles.healthLabel}>{graph.healthScore}</span>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.lastViewed}>
          {formatRelativeTime(graph.lastViewedAt)}
        </span>

        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            className={styles.menuButton}
            onClick={handleMenuToggle}
            aria-label="Graph options"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={handleRename}>
                <Pencil size={14} />
                <span>Rename</span>
              </button>
              <button className={styles.menuItem} onClick={handleMoveToWorkspace}>
                <FolderInput size={14} />
                <span>Move to Workspace</span>
              </button>
              <button className={styles.menuItemDanger} onClick={handleDelete}>
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GraphCard
