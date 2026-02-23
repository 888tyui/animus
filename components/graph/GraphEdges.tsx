'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphNode, GraphEdge } from '@/lib/types'
import { FILE_TYPES, DEFAULT_FILE_TYPE } from '@/lib/constants'

/* ═══════════════════════════════════════════
   Graph Edges — LineSegments
   ═══════════════════════════════════════════ */

interface GraphEdgesProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedIndex: number | null
}

function getNodeHdrColor(ext: string): [number, number, number] {
  const info = FILE_TYPES[ext] || DEFAULT_FILE_TYPE
  return info.hdrColor
}

export default function GraphEdges({
  nodes,
  edges,
  selectedIndex,
}: GraphEdgesProps) {
  const ref = useRef<THREE.LineSegments>(null!)

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(edges.length * 6)
    const col = new Float32Array(edges.length * 6)

    edges.forEach((edge, i) => {
      const p1 = nodes[edge.source]?.position
      const p2 = nodes[edge.target]?.position
      if (!p1 || !p2) return

      pos[i * 6] = p1[0]
      pos[i * 6 + 1] = p1[1]
      pos[i * 6 + 2] = p1[2]
      pos[i * 6 + 3] = p2[0]
      pos[i * 6 + 4] = p2[1]
      pos[i * 6 + 5] = p2[2]

      const dim = 0.35
      const c1 = getNodeHdrColor(nodes[edge.source].extension)
      const c2 = getNodeHdrColor(nodes[edge.target].extension)
      col[i * 6] = c1[0] * dim
      col[i * 6 + 1] = c1[1] * dim
      col[i * 6 + 2] = c1[2] * dim
      col[i * 6 + 3] = c2[0] * dim
      col[i * 6 + 4] = c2[1] * dim
      col[i * 6 + 5] = c2[2] * dim
    })

    return { positions: pos, colors: col }
  }, [nodes, edges])

  useFrame(() => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.LineBasicMaterial

    if (selectedIndex !== null) {
      // When a node is selected, we handle opacity globally
      // Connected edges stay brighter, others dim
      mat.opacity = 0.1
    } else {
      mat.opacity = 0.2
    }
  })

  // Build per-edge opacity awareness for selected node
  const selectedColors = useMemo(() => {
    if (selectedIndex === null) return colors

    const col = new Float32Array(edges.length * 6)
    edges.forEach((edge, i) => {
      const connected =
        edge.source === selectedIndex || edge.target === selectedIndex
      const brightness = connected ? 0.35 : 0.035

      const c1 = getNodeHdrColor(nodes[edge.source]?.extension || '')
      const c2 = getNodeHdrColor(nodes[edge.target]?.extension || '')
      col[i * 6] = c1[0] * brightness
      col[i * 6 + 1] = c1[1] * brightness
      col[i * 6 + 2] = c1[2] * brightness
      col[i * 6 + 3] = c2[0] * brightness
      col[i * 6 + 4] = c2[1] * brightness
      col[i * 6 + 5] = c2[2] * brightness
    })
    return col
  }, [edges, nodes, selectedIndex, colors])

  const activeColors = selectedIndex !== null ? selectedColors : colors

  if (edges.length === 0) return null

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[activeColors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.2}
        toneMapped={false}
      />
    </lineSegments>
  )
}
