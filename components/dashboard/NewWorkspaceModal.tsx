'use client'

import { type FC, useState, useCallback } from 'react'
import { FolderPlus } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import { WORKSPACE_COLORS } from '@/lib/constants'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import styles from './NewWorkspaceModal.module.css'

const NewWorkspaceModal: FC = () => {
  const isOpen = useAnimusStore((s) => s.newWorkspaceModalOpen)
  const closeModal = useAnimusStore((s) => s.closeNewWorkspaceModal)
  const createWorkspace = useAnimusStore((s) => s.createWorkspace)

  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(WORKSPACE_COLORS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = useCallback(() => {
    setName('')
    setSelectedColor(WORKSPACE_COLORS[0])
    setIsSubmitting(false)
    closeModal()
  }, [closeModal])

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    createWorkspace(trimmed, selectedColor)
    handleClose()
  }, [name, selectedColor, isSubmitting, createWorkspace, handleClose])

  const isValid = name.trim().length > 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth={440} ariaLabel="New Workspace">
      <div className={styles.titleRow}>
        <div className={styles.titleIcon}>
          <FolderPlus size={18} />
        </div>
        <h2 className={styles.titleText}>New Workspace</h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Name Input */}
        <Input
          label="Workspace Name"
          placeholder="My Project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          autoFocus
        />

        {/* Color Picker */}
        <div className={styles.colorSection}>
          <span className={styles.colorLabel}>Color</span>
          <div className={styles.colorGrid}>
            {WORKSPACE_COLORS.map((color) => (
              <button
                key={color}
                className={
                  selectedColor === color
                    ? styles.colorCircleSelected
                    : styles.colorCircle
                }
                style={{ background: color, color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
                type="button"
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <div
            className={styles.previewDot}
            style={{ background: selectedColor }}
          />
          {name.trim() ? (
            <span className={styles.previewName}>{name.trim()}</span>
          ) : (
            <span className={styles.previewPlaceholder}>Workspace name</span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default NewWorkspaceModal
