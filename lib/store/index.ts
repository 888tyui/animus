import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createWorkspaceSlice, type WorkspaceSlice } from './slices/workspaceSlice'
import { createGraphSlice, type GraphSlice } from './slices/graphSlice'
import { createUISlice, type UISlice } from './slices/uiSlice'
import { createWalletSlice, type WalletSlice } from './slices/walletSlice'
import type { Graph } from '@/lib/types'

export type AnimusStore = WorkspaceSlice & GraphSlice & UISlice & WalletSlice

export const useAnimusStore = create<AnimusStore>()(
  persist(
    (...a) => ({
      ...createWorkspaceSlice(...a),
      ...createGraphSlice(...a),
      ...createUISlice(...a),
      ...createWalletSlice(...a),
    }),
    {
      name: 'animus-dashboard',
      version: 1,
      partialize: (state) => ({
        workspaces: state.workspaces,
        // Persist graph summaries only — strip nodes/edges to avoid localStorage quota overflow.
        // Full node/edge data is loaded on-demand from the server when opening a graph.
        graphs: state.graphs.map(({ nodes, edges, ...summary }) => ({
          ...summary,
          nodes: [] as Graph['nodes'],
          edges: [] as Graph['edges'],
        })),
        onboardingComplete: state.onboardingComplete,
        walletAddress: state.walletAddress,
        walletName: state.walletName,
      } as unknown as AnimusStore),
      migrate: (persisted: unknown, version: number) => {
        // v0 → v1: strip nodes/edges from persisted graphs
        if (version === 0 && persisted && typeof persisted === 'object') {
          const state = persisted as Record<string, unknown>
          if (Array.isArray(state.graphs)) {
            state.graphs = (state.graphs as Array<Record<string, unknown>>).map(
              ({ nodes, edges, ...rest }) => ({ ...rest, nodes: [], edges: [] })
            )
          }
        }
        return persisted as AnimusStore
      },
    }
  )
)
