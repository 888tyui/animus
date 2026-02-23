'use client'

import { type FC, type ReactNode, useEffect, useRef, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAnimusStore } from '@/lib/store'
import { api } from '@/lib/api/client'
import { toast } from '@/lib/store/toastStore'
import type { Graph, Workspace } from '@/lib/types'

interface WorkspaceDTO {
  id: string
  name: string
  color: string
  sortOrder: number
  createdAt: string
}

interface GraphSummaryDTO {
  id: string
  name: string
  repoOwner: string
  repoName: string
  repoUrl: string
  workspaceId: string | null
  fileCount: number
  edgeCount: number
  healthScore: number
  createdAt: string
  lastViewedAt: string
}

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connected, publicKey } = useWallet()
  const { signIn, signOut, restoreSession } = useAuth()
  const isAuthenticated = useAnimusStore((s) => s.isAuthenticated)
  const prevConnected = useRef(false)
  const signingIn = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const hydrateFromServer = useCallback(async () => {
    if (!mountedRef.current) return
    try {
      const [serverWorkspaces, serverGraphSummaries] = await Promise.all([
        api.get<WorkspaceDTO[]>('/workspaces'),
        api.get<GraphSummaryDTO[]>('/graphs'),
      ])

      if (!mountedRef.current) return

      const store = useAnimusStore.getState()

      if (serverWorkspaces.length > 0) {
        const workspaces: Workspace[] = serverWorkspaces.map((ws) => ({
          id: ws.id,
          name: ws.name,
          color: ws.color,
          sortOrder: ws.sortOrder,
          createdAt: new Date(ws.createdAt).getTime(),
        }))
        store.hydrateWorkspaces(workspaces)
      }

      // Hydrate with summaries only — full graph (nodes/edges) loaded on demand
      if (serverGraphSummaries.length > 0) {
        const graphs: Graph[] = serverGraphSummaries.map((g) => ({
          id: g.id,
          name: g.name,
          repoOwner: g.repoOwner,
          repoName: g.repoName,
          repoUrl: g.repoUrl,
          workspaceId: g.workspaceId || '',
          nodes: [],
          edges: [],
          fileCount: g.fileCount,
          edgeCount: g.edgeCount,
          healthScore: g.healthScore,
          createdAt: new Date(g.createdAt).getTime(),
          lastViewedAt: new Date(g.lastViewedAt).getTime(),
        }))
        store.hydrateGraphs(graphs)
      }
    } catch (err) {
      console.error('[Auth] Hydration failed:', err)
      toast.warning('Could not sync your data from the server. Working with local data.')
    }
  }, [])

  // Restore session on mount
  useEffect(() => {
    restoreSession()
      .then((user) => {
        if (user && mountedRef.current) {
          hydrateFromServer()
        }
      })
      .catch((err) => {
        // Corrupted localStorage or network failure — clear auth state so user can retry
        console.error('[Auth] Session restore failed:', err)
        toast.warning('Session expired. Please reconnect your wallet.')
        signOut()
      })
  }, [restoreSession, hydrateFromServer, signOut])

  // Auto sign-in when wallet connects, sign-out when disconnects
  useEffect(() => {
    if (connected && publicKey && !prevConnected.current && !isAuthenticated && !signingIn.current) {
      signingIn.current = true
      signIn()
        .then(() => {
          // Re-check: wallet may have disconnected during the async sign-in flow
          if (mountedRef.current && publicKey) {
            toast.success('Wallet connected successfully')
            hydrateFromServer()
          }
        })
        .catch((err) => {
          console.error('[Auth] Sign-in failed:', err)
          toast.error('Wallet sign-in failed. Please try reconnecting.')
          // Don't leave user in a broken state — clear any partial auth
          if (mountedRef.current) signOut()
        })
        .finally(() => { signingIn.current = false })
    }

    if (!connected && prevConnected.current) {
      // Reset signingIn in case disconnect happened mid-SIWS
      signingIn.current = false
      signOut()
    }

    prevConnected.current = connected
  }, [connected, publicKey, isAuthenticated, signIn, signOut, hydrateFromServer])

  return <>{children}</>
}

export default AuthProvider
