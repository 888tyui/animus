import type { StateCreator } from 'zustand'
import type { Workspace } from '@/lib/types'
import { generateId } from '@/lib/utils'
import { WORKSPACE_COLORS } from '@/lib/constants'
import type { AnimusStore } from '@/lib/store'
import { api, getAuthToken } from '@/lib/api/client'
import { toast } from '@/lib/store/toastStore'

export interface WorkspaceSlice {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  createWorkspace: (name: string, color?: string) => string
  renameWorkspace: (id: string, name: string) => void
  deleteWorkspace: (id: string) => void
  setActiveWorkspace: (id: string | null) => void
  hydrateWorkspaces: (workspaces: Workspace[]) => void
}

export const createWorkspaceSlice: StateCreator<AnimusStore, [], [], WorkspaceSlice> = (set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  createWorkspace: (name, color) => {
    const id = generateId()
    const wsColor = color || WORKSPACE_COLORS[get().workspaces.length % WORKSPACE_COLORS.length]
    const ws: Workspace = {
      id,
      name,
      color: wsColor,
      createdAt: Date.now(),
      sortOrder: get().workspaces.length,
    }
    set((s) => ({ workspaces: [...s.workspaces, ws] }))

    if (getAuthToken()) {
      api.post<{ id: string; name: string; color: string; sortOrder: number; createdAt: string }>(
        '/workspaces',
        { name, color: wsColor }
      ).catch(() => {
        // Rollback on failure
        set((s) => ({ workspaces: s.workspaces.filter((w) => w.id !== id) }))
        toast.error('Failed to create workspace. Please try again.')
      })
    }

    // Return local ID immediately — no ID replacement to avoid race conditions.
    // On next login, hydration from server will reconcile.
    return id
  },
  renameWorkspace: (id, name) => {
    const prev = get().workspaces.find((w) => w.id === id)
    set((s) => ({
      workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name } : w)),
    }))
    if (getAuthToken()) {
      api.patch(`/workspaces/${id}`, { name }).catch(() => {
        // Only rollback if workspace still exists (not deleted in the meantime)
        if (prev && get().workspaces.some((w) => w.id === id)) {
          set((s) => ({
            workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name: prev.name } : w)),
          }))
        }
        toast.error('Failed to rename workspace. Changes reverted.')
      })
    }
  },
  deleteWorkspace: (id) => {
    const prev = get().workspaces.find((w) => w.id === id)
    const prevGraphs = get().graphs.filter((g) => g.workspaceId === id)
    set((s) => ({
      workspaces: s.workspaces.filter((w) => w.id !== id),
      graphs: s.graphs.map((g) => (g.workspaceId === id ? { ...g, workspaceId: '' } : g)),
      activeWorkspaceId: s.activeWorkspaceId === id ? null : s.activeWorkspaceId,
    }))
    if (getAuthToken()) {
      api.delete(`/workspaces/${id}`).catch(() => {
        // Rollback
        if (prev) {
          set((s) => ({
            workspaces: [...s.workspaces, prev],
            graphs: s.graphs.map((g) => {
              const was = prevGraphs.find((pg) => pg.id === g.id)
              return was ? { ...g, workspaceId: id } : g
            }),
          }))
        }
        toast.error('Failed to delete workspace. Changes reverted.')
      })
    }
  },
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  hydrateWorkspaces: (workspaces) => set({ workspaces }),
})
