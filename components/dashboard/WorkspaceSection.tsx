'use client'

import { type FC, useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Pencil,
} from 'lucide-react'
import type { Workspace } from '@/lib/types'
import { useAnimusStore } from '@/lib/store'
import InlineRename from './InlineRename'
import styles from './WorkspaceSection.module.css'

interface WorkspaceSectionProps {
  workspace: Workspace
  collapsed?: boolean
  onNavigate?: () => void
}

const WorkspaceSection: FC<WorkspaceSectionProps> = ({ workspace, collapsed = false, onNavigate }) => {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const graphs = useAnimusStore((s) =>
    s.graphs.filter((g) => g.workspaceId === workspace.id)
  )
  const activeWorkspaceId = useAnimusStore((s) => s.activeWorkspaceId)
  const setActiveWorkspace = useAnimusStore((s) => s.setActiveWorkspace)
  const setDeleteConfirmTarget = useAnimusStore((s) => s.setDeleteConfirmTarget)
  const renameWorkspace = useAnimusStore((s) => s.renameWorkspace)

  const isActive = activeWorkspaceId === workspace.id

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleRename = () => {
    setMenuOpen(false)
    setIsRenaming(true)
  }

  const handleRenameConfirm = useCallback(
    (newName: string) => {
      renameWorkspace(workspace.id, newName)
      setIsRenaming(false)
    },
    [workspace.id, renameWorkspace]
  )

  const handleRenameCancel = useCallback(() => {
    setIsRenaming(false)
  }, [])

  const handleDelete = () => {
    setMenuOpen(false)
    setDeleteConfirmTarget({
      type: 'workspace',
      id: workspace.id,
      name: workspace.name,
    })
  }

  if (collapsed) {
    return (
      <button
        className={`${styles.collapsedDot} ${isActive ? styles.active : ''}`}
        onClick={() => {
          setActiveWorkspace(workspace.id)
          onNavigate?.()
        }}
        title={workspace.name}
      >
        <span
          className={styles.colorDot}
          style={{ backgroundColor: workspace.color }}
        />
      </button>
    )
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={`${styles.header} ${isActive ? styles.active : ''}`}>
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </button>

        <button
          className={styles.nameBtn}
          onClick={() => {
            setActiveWorkspace(workspace.id)
            onNavigate?.()
          }}
        >
          <span
            className={styles.colorDot}
            style={{ backgroundColor: workspace.color }}
          />
          {isRenaming ? (
            <InlineRename
              value={workspace.name}
              onConfirm={handleRenameConfirm}
              onCancel={handleRenameCancel}
              className={styles.name}
            />
          ) : (
            <span className={styles.name}>{workspace.name}</span>
          )}
        </button>

        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Workspace options"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className={styles.contextMenu}>
              <button className={styles.contextItem} onClick={handleRename}>
                <Pencil size={13} />
                <span>Rename</span>
              </button>
              <button
                className={`${styles.contextItem} ${styles.danger}`}
                onClick={handleDelete}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Graphs list */}
      {expanded && (
        <div className={styles.graphsList}>
          {graphs.length === 0 ? (
            <span className={styles.emptyText}>No graphs yet</span>
          ) : (
            graphs.map((graph) => (
              <Link
                key={graph.id}
                href={`/dashboard/graph/${graph.id}`}
                className={styles.graphItem}
                onClick={() => onNavigate?.()}
              >
                <span className={styles.graphName}>
                  {graph.name.length > 22
                    ? graph.name.slice(0, 22) + '...'
                    : graph.name}
                </span>
                <span className={styles.fileCount}>{graph.fileCount}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default WorkspaceSection
