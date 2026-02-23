'use client'

import { useRef, useMemo, useEffect, useCallback, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { GraphNode } from '@/lib/types'
import { FILE_TYPES, DEFAULT_FILE_TYPE } from '@/lib/constants'

/* ═══════════════════════════════════════════
   Graph Nodes — InstancedMesh Spheres
   ═══════════════════════════════════════════ */

interface GraphNodesProps {
  nodes: GraphNode[]
  selectedIndex: number | null
  heatmapOn: boolean
  onSelect: (index: number | null) => void
}

function getNodeColor(ext: string): THREE.Color {
  const info = FILE_TYPES[ext] || DEFAULT_FILE_TYPE
  return new THREE.Color(info.hdrColor[0], info.hdrColor[1], info.hdrColor[2])
}

function getNodeSize(lines: number): number {
  // Logarithmic scaling with a hard cap to prevent giant nodes
  const clamped = Math.min(lines, 2000)
  return 0.15 + Math.log2(1 + clamped / 50) * 0.12
}

export default function GraphNodes({
  nodes,
  selectedIndex,
  heatmapOn,
  onSelect,
}: GraphNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const nodeColors = useMemo(() => {
    return nodes.map((n) => getNodeColor(n.extension))
  }, [nodes])

  const heatColors = useMemo(() => {
    return nodes.map((n) => {
      const c = n.complexity
      if (c > 66) return new THREE.Color(2.0, 0.3, 0.3)
      if (c > 33) return new THREE.Color(1.8, 1.0, 0.2)
      return new THREE.Color(0.2, 1.8, 0.6)
    })
  }, [nodes])

  useEffect(() => {
    const color = new THREE.Color()
    nodes.forEach((node, i) => {
      dummy.position.set(node.position[0], node.position[1], node.position[2])
      dummy.scale.setScalar(getNodeSize(node.lines))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      color.copy(heatmapOn ? heatColors[i] : nodeColors[i])
      if (selectedIndex !== null && selectedIndex !== i) {
        color.multiplyScalar(0.3)
      }
      meshRef.current.setColorAt(i, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true
  }, [nodes, selectedIndex, heatmapOn, heatColors, nodeColors, dummy])

  const frameCountRef = useRef(0)

  useFrame((state) => {
    // Throttle ambient pulse to every 3 frames for performance on large graphs.
    // Selected node still updates every frame for responsive feedback.
    frameCountRef.current++
    const shouldUpdateAll = frameCountRef.current % 3 === 0

    if (!shouldUpdateAll && selectedIndex === null) return

    const t = state.clock.elapsedTime

    if (selectedIndex !== null) {
      // Only update the selected node every frame
      const node = nodes[selectedIndex]
      if (node) {
        const pulse = 1.3 + Math.sin(t * 3) * 0.15
        dummy.position.set(node.position[0], node.position[1], node.position[2])
        dummy.scale.setScalar(getNodeSize(node.lines) * pulse)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(selectedIndex, dummy.matrix)
        meshRef.current.instanceMatrix.needsUpdate = true
      }
    }

    if (shouldUpdateAll) {
      const len = nodes.length
      for (let i = 0; i < len; i++) {
        if (i === selectedIndex) continue // already handled above
        const node = nodes[i]
        const pulse = 1 + Math.sin(t * 1.2 + i * 0.3) * 0.1
        dummy.position.set(node.position[0], node.position[1], node.position[2])
        dummy.scale.setScalar(getNodeSize(node.lines) * pulse)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (e.instanceId !== undefined) {
        onSelect(e.instanceId === selectedIndex ? null : e.instanceId)
      }
    },
    [onSelect, selectedIndex]
  )

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'auto'
  }, [])

  // Clean up cursor on unmount to prevent cursor leak when navigating away
  useEffect(() => {
    return () => { document.body.style.cursor = 'auto' }
  }, [])

  if (nodes.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, nodes.length]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
