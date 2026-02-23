export interface Workspace {
  id: string
  name: string
  color: string  // brand accent color hex
  createdAt: number
  sortOrder: number
}

export interface GraphNode {
  id: string
  path: string         // "src/components/Button.tsx"
  name: string         // "Button.tsx"
  extension: string    // "tsx"
  size: number         // bytes from GitHub API
  lines: number        // estimated
  complexity: number   // 0-100
  cluster: number      // directory-based cluster
  position: [number, number, number]
  deps: number
  dependents: number
}

export interface GraphEdge {
  source: number  // index into nodes
  target: number
}

export interface Graph {
  id: string
  name: string
  repoOwner: string
  repoName: string
  repoUrl: string
  workspaceId: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  fileCount: number
  edgeCount: number
  healthScore: number  // 0-100
  createdAt: number
  lastViewedAt: number
}

export interface ParsingState {
  isActive: boolean
  repoUrl: string
  progress: number
  stage: 'fetching' | 'parsing' | 'computing' | 'layouting' | 'done' | null
}

// GitHubTreeEntry from API
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

export interface GraphControlsAPI {
  zoomIn: () => void
  zoomOut: () => void
  fitToView: () => void
}
