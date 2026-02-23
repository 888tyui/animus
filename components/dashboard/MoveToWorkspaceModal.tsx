'use client'

import { type FC, useState, useCallback, useMemo } from 'react'
import { FolderInput, Plus, Check } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import styles from './MoveToWorkspaceModal.module.css'

const MoveToWorkspaceModal: FC = () => {
  const target = useAnimusStore((s) => s.moveToWorkspaceTarget)
  const setMoveToWorkspaceTarget = useAnimusStore((s) => s.setMoveToWorkspaceTarget)
  const workspaces = useAnimusStore((s) => s.workspaces)
  const graphs = useAnimusStore((s) => s.graphs)
  const moveGraphToWorkspace = useAnimusStore((s) => s.moveGraphToWorkspace)
  const openNewWorkspaceModal = useAnimusStore((s) => s.openNewWorkspaceModal)

  const isOpen = target !== null

  // Find current workspace of the graph
  const currentWorkspaceId = useMemo(() => {
    if (!target) return ''
    const graph = graphs.find((g) => g.id === target.graphId)
    return graph?.workspaceId ?? ''
  }, [target, graphs])

  const [selectedId, setSelectedId] = useState<string>('')

  // Reset selection when target changes
  const prevTargetRef = useMemo(() => currentWorkspaceId, [currentWorkspaceId])

  // Use the current workspace as initial selection
  const effectiveSelectedId = selectedId || prevTargetRef

  const handleClose = useCallback(() => {
    setSelectedId('')
    setIsMoving(false)
    setMoveToWorkspaceTarget(null)
  }, [setMoveToWorkspaceTarget])

  const [isMoving, setIsMoving] = useState(false)

  const handleConfirm = useCallback(() => {
    if (!target || isMoving) return
    setIsMoving(true)
    moveGraphToWorkspace(target.graphId, effectiveSelectedId)
    handleClose()
  }, [target, isMoving, effectiveSelectedId, moveGraphToWorkspace, handleClose])

  const handleNewWorkspace = useCallback(() => {
    handleClose()
    openNewWorkspaceModal()
  }, [handleClose, openNewWorkspaceModal])

  const handleSelectWorkspace = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  if (!target) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth={440} ariaLabel="Move to Workspace">
      <div className={styles.titleRow}>
        <div className={styles.titleIcon}>
          <FolderInput size={18} />
        </div>
        <h2 className={styles.titleText}>Move to Workspace</h2>
      </div>

      <p className={styles.graphLabel}>
        Moving <span className={styles.graphName}>{target.graphName}</span>
      </p>

      {/* Workspace list */}
      <div className={styles.list}>
        {/* No workspace option */}
        <button
          className={effectiveSelectedId === '' ? styles.rowSelected : styles.row}
          onClick={() => handleSelectWorkspace('')}
          type="button"
        >
          <div className={effectiveSelectedId === '' ? styles.radioSelected : styles.radio}>
            {effectiveSelectedId === '' && (
              <span className={styles.radioCheck}>
                <Check size={12} />
              </span>
            )}
          </div>
          <div className={styles.noDot} />
          <span className={styles.rowNameSecondary}>No workspace</span>
        </button>

        {/* Workspace options */}
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            className={effectiveSelectedId === ws.id ? styles.rowSelected : styles.row}
            onClick={() => handleSelectWorkspace(ws.id)}
            type="button"
          >
            <div className={effectiveSelectedId === ws.id ? styles.radioSelected : styles.radio}>
              {effectiveSelectedId === ws.id && (
                <span className={styles.radioCheck}>
                  <Check size={12} />
                </span>
              )}
            </div>
            <div className={styles.dot} style={{ backgroundColor: ws.color }} />
            <span className={styles.rowName}>{ws.name}</span>
          </button>
        ))}
      </div>

      {/* New workspace button */}
      <button
        className={styles.newWorkspaceBtn}
        onClick={handleNewWorkspace}
        type="button"
      >
        <span className={styles.newWorkspaceIcon}>
          <Plus size={14} />
        </span>
        <span>New Workspace</span>
      </button>

      {/* Actions */}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={isMoving}>
          {isMoving ? 'Moving...' : 'Move'}
        </Button>
      </div>
    </Modal>
  )
}

export default MoveToWorkspaceModal
