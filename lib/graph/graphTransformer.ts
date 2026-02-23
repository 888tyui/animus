import type { GitHubTreeEntry, Graph, GraphNode, GraphEdge } from '@/lib/types'
import { generateId, getExtension, getFileName } from '@/lib/utils'
import { classifyFile, assignCluster } from '@/lib/github/fileClassifier'
import { inferDependencies } from '@/lib/github/inferDependencies'
import { computeNodeMetrics, computeHealthScore } from '@/lib/github/computeMetrics'
import { computeLayout } from '@/lib/graph/layoutEngine'

/**
 * Orchestrate the full pipeline from raw GitHub tree entries to a complete
 * Graph object ready for 3D visualization.
 *
 * Pipeline:
 * 1. Build cluster map from directory structure
 * 2. Create GraphNode[] from entries
 * 3. Infer dependency edges
 * 4. Compute per-node metrics (complexity, deps, dependents)
 * 5. Compute 3D layout positions
 * 6. Assemble Graph object with health score and metadata
 *
 * @param entries       Filtered GitHubTreeEntry[] from fetchRepoTree
 * @param repoOwner     GitHub owner (e.g. "facebook")
 * @param repoName      Repository name (e.g. "react")
 * @param repoUrl       Full repository URL
 * @param workspaceId   ID of the workspace this graph belongs to
 * @param onProgress    Optional callback for progress updates (stage name + 0-100)
 */
export function transformRepoToGraph(
  entries: GitHubTreeEntry[],
  repoOwner: string,
  repoName: string,
  repoUrl: string,
  workspaceId: string,
  onProgress?: (stage: string, progress: number) => void
): Graph {
  const now = Date.now()

  // Handle empty repository
  if (entries.length === 0) {
    return {
      id: generateId(),
      name: `${repoOwner}/${repoName}`,
      repoOwner,
      repoName,
      repoUrl,
      workspaceId,
      nodes: [],
      edges: [],
      fileCount: 0,
      edgeCount: 0,
      healthScore: 100,
      createdAt: now,
      lastViewedAt: now,
    }
  }

  // Step 1: Build cluster map from directory structure
  onProgress?.('parsing', 10)

  const clusterMap = new Map<string, number>()

  // Step 2: Create GraphNode[] from entries
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
      complexity: 0,   // computed in step 4
      cluster,
      position: [0, 0, 0] as [number, number, number],  // computed in step 5
      deps: 0,          // computed in step 4
      dependents: 0,    // computed in step 4
    }
  })

  // Step 3: Infer dependency edges
  onProgress?.('computing', 50)

  const edges: GraphEdge[] = inferDependencies(nodes)

  // Step 4: Compute per-node metrics
  onProgress?.('computing', 70)

  const nodesWithMetrics = computeNodeMetrics(nodes, edges)

  // Step 5: Compute 3D layout positions
  onProgress?.('layouting', 85)

  const nodesWithLayout = computeLayout(nodesWithMetrics)

  // Step 6: Compute health score and assemble the Graph
  onProgress?.('layouting', 95)

  const healthScore = computeHealthScore(nodesWithLayout, edges)

  const graph: Graph = {
    id: generateId(),
    name: `${repoOwner}/${repoName}`,
    repoOwner,
    repoName,
    repoUrl,
    workspaceId,
    nodes: nodesWithLayout,
    edges,
    fileCount: nodesWithLayout.length,
    edgeCount: edges.length,
    healthScore,
    createdAt: now,
    lastViewedAt: now,
  }

  onProgress?.('done', 100)

  return graph
}
