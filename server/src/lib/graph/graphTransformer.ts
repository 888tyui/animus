import type { GitHubTreeEntry, GraphNode, GraphEdge } from '../../types/index.js'
import { generateId, getExtension, getFileName } from '../utils.js'
import { assignCluster } from '../github/fileClassifier.js'
import { inferDependencies } from '../github/inferDependencies.js'
import { computeNodeMetrics, computeHealthScore } from '../github/computeMetrics.js'
import { computeLayout } from './layoutEngine.js'

export interface TransformResult {
  nodes: GraphNode[]
  edges: GraphEdge[]
  fileCount: number
  edgeCount: number
  healthScore: number
}

export function transformRepoToGraph(
  entries: GitHubTreeEntry[],
  onProgress?: (stage: string, progress: number) => void
): TransformResult {
  if (entries.length === 0) {
    return { nodes: [], edges: [], fileCount: 0, edgeCount: 0, healthScore: 100 }
  }

  onProgress?.('parsing', 10)

  const clusterMap = new Map<string, number>()

  onProgress?.('parsing', 30)

  const nodes: GraphNode[] = entries.map((entry) => {
    const extension = getExtension(entry.path)
    const name = getFileName(entry.path)
    const size = entry.size ?? 0
    const lines = Math.max(1, Math.round(size / 40))
    const cluster = assignCluster(entry.path, clusterMap)

    return {
      id: generateId(),
      path: entry.path,
      name,
      extension,
      size,
      lines,
      complexity: 0,
      cluster,
      position: [0, 0, 0] as [number, number, number],
      deps: 0,
      dependents: 0,
    }
  })

  onProgress?.('computing', 50)
  const edges: GraphEdge[] = inferDependencies(nodes)

  onProgress?.('computing', 70)
  const nodesWithMetrics = computeNodeMetrics(nodes, edges)

  onProgress?.('layouting', 85)
  const nodesWithLayout = computeLayout(nodesWithMetrics)

  onProgress?.('layouting', 95)
  const healthScore = computeHealthScore(nodesWithLayout, edges)

  onProgress?.('done', 100)

  return {
    nodes: nodesWithLayout,
    edges,
    fileCount: nodesWithLayout.length,
    edgeCount: edges.length,
    healthScore,
  }
}
