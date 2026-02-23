'use client'

import { type FC, useState, useRef, useEffect, useCallback } from 'react'
import styles from './InlineRename.module.css'

interface InlineRenameProps {
  value: string
  onConfirm: (newName: string) => void
  onCancel: () => void
  className?: string
}

const InlineRename: FC<InlineRenameProps> = ({ value, onConfirm, onCancel, className }) => {
  const [text, setText] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmedRef = useRef(false)

  useEffect(() => {
    const input = inputRef.current
    if (input) {
      input.focus()
      input.select()
    }
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmedRef.current) return
    const trimmed = text.trim()
    if (trimmed) {
      confirmedRef.current = true
      onConfirm(trimmed)
    } else {
      onCancel()
    }
  }, [text, onConfirm, onCancel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    },
    [handleConfirm, onCancel]
  )

  const handleBlur = useCallback(() => {
    handleConfirm()
  }, [handleConfirm])

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        spellCheck={false}
        autoComplete="off"
        maxLength={100}
      />
    </div>
  )
}

export default InlineRename
