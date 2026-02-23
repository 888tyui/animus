import type { StateCreator } from 'zustand'
import type { Graph, ParsingState } from '@/lib/types'
import type { AnimusStore } from '@/lib/store'
import { api, getAuthToken } from '@/lib/api/client'
import { toast } from '@/lib/store/toastStore'

export interface GraphSlice {
  graphs: Graph[]
  activeGraphId: string | null
  parsingState: ParsingState
  addGraph: (graph: Graph) => void
  removeGraph: (id: string) => void
  renameGraph: (id: string, name: string) => void
  moveGraphToWorkspace: (graphId: string, workspaceId: string) => void
  setActiveGraph: (id: string | null) => void
  updateLastViewed: (id: string) => void
  setParsingState: (state: Partial<ParsingState>) => void
  hydrateGraphs: (graphs: Graph[]) => void
}

export const createGraphSlice: StateCreator<AnimusStore, [], [], GraphSlice> = (set, get) => ({
  graphs: [],
  activeGraphId: null,
  parsingState: { isActive: false, repoUrl: '', progress: 0, stage: null },
  addGraph: (graph) => set((s) => ({ graphs: [...s.graphs, graph] })),
  removeGraph: (id) => {
    const prev = get().graphs.find((g) => g.id === id)
    const prevActiveGraphId = get().activeGraphId
    set((s) => ({
      graphs: s.graphs.filter((g) => g.id !== id),
      activeGraphId: s.activeGraphId === id ? null : s.activeGraphId,
    }))
    if (getAuthToken()) {
      api.delete(`/graphs/${id}`).catch(() => {
        // Rollback: re-add the graph and restore activeGraphId
        if (prev) {
          set((s) => ({
            graphs: [...s.graphs, prev],
            activeGraphId: prevActiveGraphId,
          }))
        }
        toast.error('Failed to delete graph. Changes reverted.')
      })
    }
  },
  renameGraph: (id, name) => {
    const prev = get().graphs.find((g) => g.id === id)
    set((s) => ({
      graphs: s.graphs.map((g) => (g.id === id ? { ...g, name } : g)),
    }))
    if (getAuthToken()) {
      api.patch(`/graphs/${id}`, { name }).catch(() => {
        // Only rollback if the graph still exists in the store
        if (prev && get().graphs.some((g) => g.id === id)) {
          set((s) => ({
            graphs: s.graphs.map((g) => (g.id === id ? { ...g, name: prev.name } : g)),
          }))
        }
        toast.error('Failed to rename graph. Changes reverted.')
      })
    }
  },
  moveGraphToWorkspace: (graphId, workspaceId) => {
    const prev = get().graphs.find((g) => g.id === graphId)
    set((s) => ({
      graphs: s.graphs.map((g) => (g.id === graphId ? { ...g, workspaceId } : g)),
    }))
    if (getAuthToken()) {
      api.patch(`/graphs/${graphId}`, { workspaceId: workspaceId || null }).catch(() => {
        // Only rollback if the graph still exists
        if (prev && get().graphs.some((g) => g.id === graphId)) {
          set((s) => ({
            graphs: s.graphs.map((g) => (g.id === graphId ? { ...g, workspaceId: prev.workspaceId } : g)),
          }))
        }
        toast.error('Failed to move graph. Changes reverted.')
      })
    }
  },
  setActiveGraph: (id) => set({ activeGraphId: id }),
  updateLastViewed: (id) => set((s) => ({
    graphs: s.graphs.map((g) => (g.id === id ? { ...g, lastViewedAt: Date.now() } : g)),
  })),
  setParsingState: (state) => set((s) => ({
    parsingState: { ...s.parsingState, ...state },
  })),
  hydrateGraphs: (serverGraphs) => set((s) => {
    // Merge instead of wholesale replace: keep any locally-added graphs
    // (e.g., from an in-flight SSE parse) that aren't on the server yet.
    const serverIds = new Set(serverGraphs.map((g) => g.id))
    const localOnly = s.graphs.filter((g) => !serverIds.has(g.id))
    return { graphs: [...serverGraphs, ...localOnly] }
  }),
})
