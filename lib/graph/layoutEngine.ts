import type { GraphNode } from '@/lib/types'

/**
 * Compute 3D positions for graph nodes using a cluster-based layout.
 *
 * Strategy:
 * 1. Group nodes by their cluster index
 * 2. Place cluster centers on a golden-angle spiral in the XZ plane
 * 3. Scatter each node around its cluster center with random jitter
 * 4. Scale positions to keep within a reasonable bounding box (~±15 units)
 *
 * Returns a new array of nodes with the `position` field set.
 * The original array is not mutated.
 */
export function computeLayout(nodes: GraphNode[]): GraphNode[] {
  if (nodes.length === 0) return []

  // Handle single-node case: place at origin
  if (nodes.length === 1) {
    return [{ ...nodes[0], position: [0, 0, 0] }]
  }

  // Group node indices by cluster
  const clusterGroups = new Map<number, number[]>()
  for (let i = 0; i < nodes.length; i++) {
    const cluster = nodes[i].cluster
    const group = clusterGroups.get(cluster)
    if (group) {
      group.push(i)
    } else {
      clusterGroups.set(cluster, [i])
    }
  }

  const clusterCount = clusterGroups.size

  // Compute cluster centers using golden angle spiral
  const clusterCenters = new Map<number, [number, number, number]>()
  let clusterIdx = 0

  for (const [clusterId] of clusterGroups) {
    const center = computeClusterCenter(clusterIdx, clusterCount)
    clusterCenters.set(clusterId, center)
    clusterIdx++
  }

  // Assign positions to each node
  // Use a deterministic seed based on node index for reproducibility
  const result: GraphNode[] = new Array(nodes.length)

  for (const [clusterId, indices] of clusterGroups) {
    const center = clusterCenters.get(clusterId)!
    const groupSize = indices.length

    for (let localIdx = 0; localIdx < indices.length; localIdx++) {
      const nodeIdx = indices[localIdx]
      const node = nodes[nodeIdx]

      const position = computeNodePosition(
        center,
        localIdx,
        groupSize,
        nodeIdx  // use as seed for deterministic jitter
      )

      result[nodeIdx] = { ...node, position }
    }
  }

  // Scale positions to fit within bounding box
  return scaleToFit(result, 15)
}

/**
 * Compute a cluster center position on a golden-angle spiral in the XZ plane.
 *
 * @param index       The cluster's ordinal index
 * @param totalCount  Total number of clusters
 */
function computeClusterCenter(
  index: number,
  totalCount: number
): [number, number, number] {
  if (totalCount === 1) {
    return [0, 0, 0]
  }

  const goldenAngle = 2.4 // ~137.5 degrees in radians
  const theta = index * goldenAngle

  // Radius scales with cluster count for better separation
  const baseRadius = 4 + Math.sqrt(totalCount) * 2.2
  const jitter = seededRandom(index * 7 + 13) * 2.0
  const radius = baseRadius + jitter

  const x = radius * Math.cos(theta)
  const z = radius * Math.sin(theta)
  const y = (seededRandom(index * 11 + 3) - 0.5) * 6 // random Y in [-3, 3]

  return [x, y, z]
}

/**
 * Compute a node's position as an offset from its cluster center.
 * Nodes in the same cluster are distributed in a small sphere around the center.
 */
function computeNodePosition(
  center: [number, number, number],
  localIndex: number,
  groupSize: number,
  seed: number
): [number, number, number] {
  if (groupSize === 1) {
    return [...center]
  }

  // Distribute nodes in a fibonacci sphere around the cluster center
  // Radius grows with group size so nodes don't overlap
  const baseRadius = 0.6 + Math.sqrt(groupSize) * 0.45

  // Use golden ratio spiral for even distribution in 3D
  const phi = Math.acos(1 - (2 * (localIndex + 0.5)) / groupSize)
  const theta = Math.PI * (1 + Math.sqrt(5)) * localIndex

  const dx = baseRadius * Math.sin(phi) * Math.cos(theta)
  const dy = baseRadius * Math.sin(phi) * Math.sin(theta)
  const dz = baseRadius * Math.cos(phi)

  // Add small random jitter
  const jx = (seededRandom(seed * 3 + 1) - 0.5) * 0.3
  const jy = (seededRandom(seed * 5 + 2) - 0.5) * 0.3
  const jz = (seededRandom(seed * 7 + 3) - 0.5) * 0.3

  return [
    center[0] + dx + jx,
    center[1] + dy + jy,
    center[2] + dz + jz,
  ]
}

/**
 * Scale all node positions so the graph fits within ±maxExtent units on each axis.
 */
function scaleToFit(nodes: GraphNode[], maxExtent: number): GraphNode[] {
  if (nodes.length === 0) return nodes

  // Find current bounding box
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  for (const node of nodes) {
    const [x, y, z] = node.position
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const rangeZ = maxZ - minZ || 1
  const maxRange = Math.max(rangeX, rangeY, rangeZ)

  // Only scale if we exceed the bounding box
  if (maxRange <= maxExtent * 2) return nodes

  const scale = (maxExtent * 2) / maxRange

  // Center of the bounding box
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const cz = (minZ + maxZ) / 2

  return nodes.map((node) => ({
    ...node,
    position: [
      (node.position[0] - cx) * scale,
      (node.position[1] - cy) * scale,
      (node.position[2] - cz) * scale,
    ] as [number, number, number],
  }))
}

/**
 * Simple deterministic pseudo-random number generator (0..1).
 * Uses a hash-like function to convert an integer seed into a float.
 */
function seededRandom(seed: number): number {
  let x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
