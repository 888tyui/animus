'use client'

import { type FC } from 'react'
import { Plus } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import styles from './EmptyState.module.css'

const EmptyState: FC = () => {
  const openNewGraphModal = useAnimusStore((s) => s.openNewGraphModal)

  return (
    <div className={styles.container}>
      {/* Abstract Neural Network Illustration */}
      <div className={styles.illustration}>
        {/* Connection lines */}
        <div className={`${styles.line} ${styles.line1}`} />
        <div className={`${styles.line} ${styles.line2}`} />
        <div className={`${styles.line} ${styles.line3}`} />
        <div className={`${styles.line} ${styles.line4}`} />
        <div className={`${styles.line} ${styles.line5}`} />

        {/* Neural nodes */}
        <div className={`${styles.node} ${styles.node1}`} />
        <div className={`${styles.node} ${styles.node2}`} />
        <div className={`${styles.node} ${styles.node3}`} />
        <div className={`${styles.node} ${styles.node4}`} />
        <div className={`${styles.node} ${styles.node5}`} />
        <div className={`${styles.node} ${styles.node6}`} />
        <div className={`${styles.node} ${styles.node7}`} />
      </div>

      <h2 className={styles.title}>No graphs yet</h2>
      <p className={styles.subtitle}>
        Import your first GitHub repository to visualize its codebase as a
        living neural network
      </p>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          icon={<Plus size={18} />}
          onClick={openNewGraphModal}
        >
          New Graph
        </Button>
      </div>
    </div>
  )
}

export default EmptyState
