import type { GraphNode, GraphEdge } from '@/lib/types'

/**
 * Compute per-node metrics (complexity, deps, dependents) from the
 * current nodes and edges arrays.
 *
 * Returns a new array of nodes with updated metric fields.
 * The original array is not mutated.
 */
export function computeNodeMetrics(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphNode[] {
  if (nodes.length === 0) return []

  // Count outgoing deps (source) and incoming dependents (target) per node index
  const depsCount = new Uint32Array(nodes.length)
  const dependentsCount = new Uint32Array(nodes.length)

  for (const edge of edges) {
    if (edge.source >= 0 && edge.source < nodes.length) {
      depsCount[edge.source]++
    }
    if (edge.target >= 0 && edge.target < nodes.length) {
      dependentsCount[edge.target]++
    }
  }

  return nodes.map((node, i) => {
    const deps = depsCount[i]
    const dependents = dependentsCount[i]
    const complexity = calculateComplexity(node, dependents)

    return {
      ...node,
      deps,
      dependents,
      complexity,
    }
  })
}

/**
 * Calculate a complexity score (0-100) for a single node.
 *
 * Formula: min(100, round(
 *   (estimatedLines / 300) * 40 +
 *   (directoryDepth / 5) * 30 +
 *   (dependents / 8) * 30
 * ))
 */
function calculateComplexity(node: GraphNode, dependents: number): number {
  const estimatedLines = node.lines > 0 ? node.lines : Math.max(1, Math.round(node.size / 40))
  const depth = getDirectoryDepth(node.path)

  const lineFactor = (estimatedLines / 300) * 40
  const depthFactor = (depth / 5) * 30
  const dependentsFactor = (dependents / 8) * 30

  const raw = lineFactor + depthFactor + dependentsFactor
  return Math.min(100, Math.round(raw))
}

/**
 * Count the number of "/" separators in a path to determine directory depth.
 * "src/components/Button.tsx" has depth 2.
 */
function getDirectoryDepth(path: string): number {
  let count = 0
  for (let i = 0; i < path.length; i++) {
    if (path[i] === '/') count++
  }
  return count
}

/**
 * Compute an overall repository health score (0-100).
 *
 * Formula:
 *   healthScore = 100
 *     - avgComplexity * 0.3
 *     - (highComplexityFileRatio) * 30
 *     - (couplingRatio) * 20
 *     - (maxDeps / 50) * 20
 *
 * Where:
 *   - avgComplexity = average node complexity
 *   - highComplexityFileRatio = files with complexity > 70 / total files
 *   - couplingRatio = edges / nodes (how interconnected the graph is)
 *   - maxDeps = highest dependency count on any single node
 *
 * Result is clamped to 0-100.
 */
export function computeHealthScore(
  nodes: GraphNode[],
  edges: GraphEdge[]
): number {
  if (nodes.length === 0) return 100

  // Average complexity
  let totalComplexity = 0
  let highComplexityCount = 0
  let maxDeps = 0

  for (const node of nodes) {
    totalComplexity += node.complexity
    if (node.complexity > 70) highComplexityCount++
    if (node.deps > maxDeps) maxDeps = node.deps
  }

  const avgComplexity = totalComplexity / nodes.length
  const highComplexRatio = highComplexityCount / nodes.length
  const couplingRatio = nodes.length > 0 ? edges.length / nodes.length : 0

  const score =
    100 -
    avgComplexity * 0.3 -
    highComplexRatio * 30 -
    couplingRatio * 20 -
    (maxDeps / 50) * 20

  return Math.round(Math.max(0, Math.min(100, score)))
}
