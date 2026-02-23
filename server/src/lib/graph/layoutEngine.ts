import type { GraphNode } from '../../types/index.js'

export function computeLayout(nodes: GraphNode[]): GraphNode[] {
  if (nodes.length === 0) return []

  if (nodes.length === 1) {
    return [{ ...nodes[0], position: [0, 0, 0] }]
  }

  const clusterGroups = new Map<number, number[]>()
  for (let i = 0; i < nodes.length; i++) {
    const cluster = nodes[i].cluster
    const group = clusterGroups.get(cluster)
    if (group) { group.push(i) } else { clusterGroups.set(cluster, [i]) }
  }

  const clusterCount = clusterGroups.size
  const clusterCenters = new Map<number, [number, number, number]>()
  let clusterIdx = 0

  for (const [clusterId] of clusterGroups) {
    const center = computeClusterCenter(clusterIdx, clusterCount)
    clusterCenters.set(clusterId, center)
    clusterIdx++
  }

  const result: GraphNode[] = new Array(nodes.length)

  for (const [clusterId, indices] of clusterGroups) {
    const center = clusterCenters.get(clusterId)!
    const groupSize = indices.length

    for (let localIdx = 0; localIdx < indices.length; localIdx++) {
      const nodeIdx = indices[localIdx]
      const node = nodes[nodeIdx]
      const position = computeNodePosition(center, localIdx, groupSize, nodeIdx)
      result[nodeIdx] = { ...node, position }
    }
  }

  return scaleToFit(result, 15)
}

function computeClusterCenter(index: number, totalCount: number): [number, number, number] {
  if (totalCount === 1) return [0, 0, 0]

  const goldenAngle = 2.4
  const theta = index * goldenAngle
  const baseRadius = 4 + Math.sqrt(totalCount) * 2.2
  const jitter = seededRandom(index * 7 + 13) * 2.0
  const radius = baseRadius + jitter
  const x = radius * Math.cos(theta)
  const z = radius * Math.sin(theta)
  const y = (seededRandom(index * 11 + 3) - 0.5) * 6

  return [x, y, z]
}

function computeNodePosition(
  center: [number, number, number],
  localIndex: number,
  groupSize: number,
  seed: number
): [number, number, number] {
  if (groupSize === 1) return [...center]

  const baseRadius = 0.6 + Math.sqrt(groupSize) * 0.45
  const phi = Math.acos(1 - (2 * (localIndex + 0.5)) / groupSize)
  const theta = Math.PI * (1 + Math.sqrt(5)) * localIndex

  const dx = baseRadius * Math.sin(phi) * Math.cos(theta)
  const dy = baseRadius * Math.sin(phi) * Math.sin(theta)
  const dz = baseRadius * Math.cos(phi)

  const jx = (seededRandom(seed * 3 + 1) - 0.5) * 0.3
  const jy = (seededRandom(seed * 5 + 2) - 0.5) * 0.3
  const jz = (seededRandom(seed * 7 + 3) - 0.5) * 0.3

  return [center[0] + dx + jx, center[1] + dy + jy, center[2] + dz + jz]
}

function scaleToFit(nodes: GraphNode[], maxExtent: number): GraphNode[] {
  if (nodes.length === 0) return nodes

  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  for (const node of nodes) {
    const [x, y, z] = node.position
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  }

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const rangeZ = maxZ - minZ || 1
  const maxRange = Math.max(rangeX, rangeY, rangeZ)

  if (maxRange <= maxExtent * 2) return nodes

  const scale = (maxExtent * 2) / maxRange
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

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
