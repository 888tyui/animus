'use client'

import { type FC, type ReactNode } from 'react'
import { useAnimusStore } from '@/lib/store'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import NewGraphModal from './NewGraphModal'
import NewWorkspaceModal from './NewWorkspaceModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import MoveToWorkspaceModal from './MoveToWorkspaceModal'
import ParsingOverlay from './ParsingOverlay'
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay'
import ToastContainer from '@/components/ui/ToastContainer'
import styles from './DashboardShell.module.css'

interface DashboardShellProps {
  children: ReactNode
}

const DashboardShell: FC<DashboardShellProps> = ({ children }) => {
  const sidebarCollapsed = useAnimusStore((s) => s.sidebarCollapsed)
  const onboardingComplete = useAnimusStore((s) => s.onboardingComplete)

  return (
    <div
      className={`${styles.shell} ${sidebarCollapsed ? styles.collapsed : ''}`}
    >
      <Sidebar />
      <div className={styles.main}>
        <TopBar />
        <main className={styles.content}>{children}</main>
      </div>

      {/* Global Modals & Overlays */}
      <NewGraphModal />
      <NewWorkspaceModal />
      <DeleteConfirmModal />
      <MoveToWorkspaceModal />
      <ParsingOverlay />

      {/* Onboarding Wizard */}
      {!onboardingComplete && <OnboardingOverlay />}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default DashboardShell
