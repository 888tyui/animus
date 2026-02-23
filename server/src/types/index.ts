import { z } from 'zod'

// --- Request schemas ---

export const uuidParam = z.object({
  id: z.string().uuid(),
})

export const updateUserBody = z.object({
  walletName: z.string().max(50).optional(),
  onboardingComplete: z.boolean().optional(),
  settings: z.record(z.unknown()).optional().refine(
    (val) => !val || JSON.stringify(val).length <= 10_240,
    { message: 'Settings JSON must be under 10KB' }
  ),
})

export const createWorkspaceBody = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export const updateWorkspaceBody = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const parseGraphBody = z.object({
  repoUrl: z.string().min(1),
  workspaceId: z.string().uuid().optional(),
})

export const updateGraphBody = z.object({
  name: z.string().min(1).max(200).optional(),
  workspaceId: z.string().uuid().nullable().optional(),
})

// --- Response DTOs ---

export interface UserDTO {
  id: string
  walletAddress: string
  walletName: string | null
  onboardingComplete: boolean
  settings: unknown
}

export interface WorkspaceDTO {
  id: string
  name: string
  color: string
  sortOrder: number
  createdAt: string
}

export interface GraphSummaryDTO {
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

export interface GraphFullDTO extends GraphSummaryDTO {
  nodes: unknown[]
  edges: unknown[]
}

// --- Shared types for pipeline ---

export interface GraphNode {
  id: string
  path: string
  name: string
  extension: string
  size: number
  lines: number
  complexity: number
  cluster: number
  position: [number, number, number]
  deps: number
  dependents: number
}

export interface GraphEdge {
  source: number
  target: number
}

export interface GitHubTreeEntry {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

export interface FileTypeInfo {
  label: string
  color: string
  hdrColor: [number, number, number]
  category: string
}
