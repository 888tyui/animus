'use client'

import { type FC } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, Menu, Search, X } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import WalletButton from './WalletButton'
import styles from './TopBar.module.css'

const TopBar: FC = () => {
  const pathname = usePathname()
  const workspaces = useAnimusStore((s) => s.workspaces)
  const graphs = useAnimusStore((s) => s.graphs)
  const setSidebarMobileOpen = useAnimusStore((s) => s.setSidebarMobileOpen)
  const searchQuery = useAnimusStore((s) => s.searchQuery)
  const setSearchQuery = useAnimusStore((s) => s.setSearchQuery)

  const breadcrumbs = buildBreadcrumbs(pathname, workspaces, graphs)

  return (
    <header className={styles.topBar}>
      {/* Hamburger — mobile only */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className={styles.crumbGroup}>
            {i > 0 && (
              <ChevronRight size={12} className={styles.separator} />
            )}
            <span
              className={
                i === breadcrumbs.length - 1
                  ? styles.crumbActive
                  : styles.crumb
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Search Bar */}
      <div className={styles.searchWrapper}>
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search graphs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.searchClear}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <WalletButton />
      </div>
    </header>
  )
}

function buildBreadcrumbs(
  pathname: string,
  workspaces: { id: string; name: string }[],
  graphs: { id: string; name: string; workspaceId: string }[]
): string[] {
  const crumbs: string[] = ['Dashboard']

  // Match /dashboard/graph/[id]
  const graphMatch = pathname.match(/\/dashboard\/graph\/(.+)/)
  if (graphMatch) {
    const graphId = graphMatch[1]
    const graph = graphs.find((g) => g.id === graphId)
    if (graph) {
      const workspace = workspaces.find((w) => w.id === graph.workspaceId)
      if (workspace) {
        crumbs.push(workspace.name)
      }
      crumbs.push(graph.name)
    }
    return crumbs
  }

  return crumbs
}

export default TopBar
