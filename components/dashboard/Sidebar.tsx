'use client'

import { type FC, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
} from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import WorkspaceSection from './WorkspaceSection'
import styles from './Sidebar.module.css'

const Sidebar: FC = () => {
  const sidebarCollapsed = useAnimusStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAnimusStore((s) => s.toggleSidebar)
  const sidebarMobileOpen = useAnimusStore((s) => s.sidebarMobileOpen)
  const setSidebarMobileOpen = useAnimusStore((s) => s.setSidebarMobileOpen)
  const openNewGraphModal = useAnimusStore((s) => s.openNewGraphModal)
  const openNewWorkspaceModal = useAnimusStore((s) => s.openNewWorkspaceModal)
  const workspaces = useAnimusStore((s) => s.workspaces)
  const activeWorkspaceId = useAnimusStore((s) => s.activeWorkspaceId)
  const setActiveWorkspace = useAnimusStore((s) => s.setActiveWorkspace)

  const isAllGraphsActive = activeWorkspaceId === null

  const closeMobileSidebar = useCallback(() => {
    setSidebarMobileOpen(false)
  }, [setSidebarMobileOpen])

  const handleAllGraphsClick = useCallback(() => {
    setActiveWorkspace(null)
    setSidebarMobileOpen(false)
  }, [setActiveWorkspace, setSidebarMobileOpen])

  const handleNewGraphClick = useCallback(() => {
    openNewGraphModal()
    setSidebarMobileOpen(false)
  }, [openNewGraphModal, setSidebarMobileOpen])

  const handleNewWorkspaceClick = useCallback(() => {
    openNewWorkspaceModal()
    setSidebarMobileOpen(false)
  }, [openNewWorkspaceModal, setSidebarMobileOpen])

  const sidebarClassName = [
    styles.sidebar,
    sidebarCollapsed ? styles.collapsed : '',
    sidebarMobileOpen ? styles.mobileOpen : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarMobileOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClassName}>
        {/* Top: Logo */}
        <div className={styles.top}>
          <Link href="/" className={styles.logo}>
            <Image src="/mascot.png" alt="Animus" width={28} height={28} className={styles.logoMascot} />
            {!sidebarCollapsed && <span className={styles.logoText}>animus</span>}
          </Link>

          <button
            className={styles.collapseBtn}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>

        {/* New Graph Button */}
        <div className={styles.newGraphWrapper}>
          <button
            className={styles.newGraphBtn}
            onClick={handleNewGraphClick}
            title="New Graph"
          >
            <Plus size={16} />
            {!sidebarCollapsed && <span>New Graph</span>}
          </button>
        </div>

        <div className={styles.divider} />

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* All Graphs */}
          <button
            className={`${styles.navItem} ${isAllGraphsActive ? styles.navItemActive : ''}`}
            onClick={handleAllGraphsClick}
            title="All Graphs"
          >
            <LayoutGrid size={16} />
            {!sidebarCollapsed && <span>All Graphs</span>}
          </button>

          {/* Workspaces */}
          <div className={styles.workspacesList}>
            {workspaces.map((ws) => (
              <WorkspaceSection
                key={ws.id}
                workspace={ws}
                collapsed={sidebarCollapsed}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </div>
        </nav>

        {/* Bottom: New Workspace + Docs */}
        <div className={styles.bottom}>
          <div className={styles.divider} />
          <button
            className={styles.newWorkspaceBtn}
            onClick={handleNewWorkspaceClick}
            title="New Workspace"
          >
            <Plus size={14} />
            {!sidebarCollapsed && <span>New Workspace</span>}
          </button>
          <Link
            href="/docs"
            className={styles.docsLink}
            title="Documentation"
            onClick={closeMobileSidebar}
          >
            <BookOpen size={14} />
            {!sidebarCollapsed && <span>Docs</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
