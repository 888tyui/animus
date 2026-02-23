'use client'

import { type FC, useState, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import styles from './DeleteConfirmModal.module.css'

const DeleteConfirmModal: FC = () => {
  const target = useAnimusStore((s) => s.deleteConfirmTarget)
  const setDeleteConfirmTarget = useAnimusStore((s) => s.setDeleteConfirmTarget)
  const removeGraph = useAnimusStore((s) => s.removeGraph)
  const deleteWorkspace = useAnimusStore((s) => s.deleteWorkspace)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOpen = target !== null

  const handleClose = useCallback(() => {
    setDeleteConfirmTarget(null)
    setIsDeleting(false)
  }, [setDeleteConfirmTarget])

  const handleConfirm = useCallback(() => {
    if (!target || isDeleting) return
    setIsDeleting(true)

    if (target.type === 'graph') {
      removeGraph(target.id)
    } else if (target.type === 'workspace') {
      deleteWorkspace(target.id)
    }

    handleClose()
  }, [target, isDeleting, removeGraph, deleteWorkspace, handleClose])

  if (!target) return null

  const typeLabel = target.type === 'graph' ? 'Graph' : 'Workspace'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth={440} ariaLabel={`Delete ${typeLabel}`}>
      <div className={styles.titleRow}>
        <div className={styles.titleIcon}>
          <AlertTriangle size={18} />
        </div>
        <h2 className={styles.titleText}>Delete {typeLabel}?</h2>
      </div>

      <p className={styles.message}>
        Are you sure you want to delete{' '}
        <span className={styles.itemName}>&lsquo;{target.name}&rsquo;</span>?
        This action cannot be undone.
      </p>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <button className={styles.deleteButton} onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

export default DeleteConfirmModal
