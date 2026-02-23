'use client'

import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   Demo File Data
   ═══════════════════════════════════════════ */

export interface DemoFile {
  name: string
  path: string
  ext: string
  lines: number
  complexity: number
  deps: number
  dependents: number
  cluster: number
}

const DEMO_FILES: DemoFile[] = [
  // Core
  { name: 'index.tsx', path: 'src/index.tsx', ext: 'tsx', lines: 38, complexity: 8, deps: 3, dependents: 0, cluster: 0 },
  { name: 'App.tsx', path: 'src/App.tsx', ext: 'tsx', lines: 192, complexity: 45, deps: 9, dependents: 1, cluster: 0 },
  { name: 'router.ts', path: 'src/router.ts', ext: 'ts', lines: 87, complexity: 28, deps: 6, dependents: 1, cluster: 0 },
  { name: 'constants.ts', path: 'src/constants.ts', ext: 'ts', lines: 44, complexity: 3, deps: 0, dependents: 8, cluster: 0 },
  // Components
  { name: 'Button.tsx', path: 'src/components/Button.tsx', ext: 'tsx', lines: 96, complexity: 14, deps: 2, dependents: 18, cluster: 1 },
  { name: 'Card.tsx', path: 'src/components/Card.tsx', ext: 'tsx', lines: 78, complexity: 12, deps: 2, dependents: 9, cluster: 1 },
  { name: 'Modal.tsx', path: 'src/components/Modal.tsx', ext: 'tsx', lines: 142, complexity: 34, deps: 4, dependents: 7, cluster: 1 },
  { name: 'Sidebar.tsx', path: 'src/components/Sidebar.tsx', ext: 'tsx', lines: 210, complexity: 52, deps: 6, dependents: 3, cluster: 1 },
  { name: 'Header.tsx', path: 'src/components/Header.tsx', ext: 'tsx', lines: 118, complexity: 22, deps: 5, dependents: 2, cluster: 1 },
  { name: 'Table.tsx', path: 'src/components/Table.tsx', ext: 'tsx', lines: 284, complexity: 68, deps: 5, dependents: 6, cluster: 1 },
  { name: 'Input.tsx', path: 'src/components/Input.tsx', ext: 'tsx', lines: 72, complexity: 10, deps: 1, dependents: 14, cluster: 1 },
  { name: 'Avatar.tsx', path: 'src/components/Avatar.tsx', ext: 'tsx', lines: 48, complexity: 6, deps: 1, dependents: 5, cluster: 1 },
  { name: 'Tooltip.tsx', path: 'src/components/Tooltip.tsx', ext: 'tsx', lines: 86, complexity: 18, deps: 2, dependents: 10, cluster: 1 },
  // Hooks
  { name: 'useAuth.ts', path: 'src/hooks/useAuth.ts', ext: 'ts', lines: 134, complexity: 38, deps: 3, dependents: 8, cluster: 2 },
  { name: 'useTheme.ts', path: 'src/hooks/useTheme.ts', ext: 'ts', lines: 56, complexity: 10, deps: 1, dependents: 12, cluster: 2 },
  { name: 'useDebounce.ts', path: 'src/hooks/useDebounce.ts', ext: 'ts', lines: 24, complexity: 4, deps: 0, dependents: 6, cluster: 2 },
  { name: 'useMediaQuery.ts', path: 'src/hooks/useMediaQuery.ts', ext: 'ts', lines: 32, complexity: 6, deps: 0, dependents: 4, cluster: 2 },
  // Utils
  { name: 'api.ts', path: 'src/utils/api.ts', ext: 'ts', lines: 186, complexity: 42, deps: 2, dependents: 15, cluster: 3 },
  { name: 'format.ts', path: 'src/utils/format.ts', ext: 'ts', lines: 92, complexity: 18, deps: 0, dependents: 11, cluster: 3 },
  { name: 'validation.ts', path: 'src/utils/validation.ts', ext: 'ts', lines: 148, complexity: 35, deps: 1, dependents: 9, cluster: 3 },
  { name: 'storage.ts', path: 'src/utils/storage.ts', ext: 'ts', lines: 64, complexity: 8, deps: 0, dependents: 5, cluster: 3 },
  // Store
  { name: 'store.ts', path: 'src/store/index.ts', ext: 'ts', lines: 42, complexity: 12, deps: 4, dependents: 6, cluster: 4 },
  { name: 'userSlice.ts', path: 'src/store/userSlice.ts', ext: 'ts', lines: 98, complexity: 24, deps: 2, dependents: 4, cluster: 4 },
  { name: 'uiSlice.ts', path: 'src/store/uiSlice.ts', ext: 'ts', lines: 56, complexity: 10, deps: 1, dependents: 3, cluster: 4 },
  // Pages
  { name: 'Home.tsx', path: 'src/pages/Home.tsx', ext: 'tsx', lines: 168, complexity: 38, deps: 8, dependents: 1, cluster: 5 },
  { name: 'Dashboard.tsx', path: 'src/pages/Dashboard.tsx', ext: 'tsx', lines: 312, complexity: 72, deps: 12, dependents: 1, cluster: 5 },
  { name: 'Settings.tsx', path: 'src/pages/Settings.tsx', ext: 'tsx', lines: 224, complexity: 48, deps: 10, dependents: 1, cluster: 5 },
  { name: 'Profile.tsx', path: 'src/pages/Profile.tsx', ext: 'tsx', lines: 156, complexity: 32, deps: 7, dependents: 1, cluster: 5 },
  { name: 'Login.tsx', path: 'src/pages/Login.tsx', ext: 'tsx', lines: 108, complexity: 22, deps: 5, dependents: 1, cluster: 5 },
  // Styles
  { name: 'globals.css', path: 'src/styles/globals.css', ext: 'css', lines: 186, complexity: 5, deps: 0, dependents: 1, cluster: 6 },
  { name: 'theme.css', path: 'src/styles/theme.css', ext: 'css', lines: 94, complexity: 2, deps: 0, dependents: 3, cluster: 6 },
  { name: 'components.css', path: 'src/styles/components.css', ext: 'css', lines: 342, complexity: 8, deps: 1, dependents: 8, cluster: 6 },
  // Config
  { name: 'package.json', path: 'package.json', ext: 'json', lines: 48, complexity: 0, deps: 0, dependents: 0, cluster: 7 },
  { name: 'tsconfig.json', path: 'tsconfig.json', ext: 'json', lines: 28, complexity: 0, deps: 0, dependents: 0, cluster: 7 },
  { name: 'next.config.ts', path: 'next.config.ts', ext: 'ts', lines: 22, complexity: 4, deps: 1, dependents: 0, cluster: 7 },
  { name: '.env', path: '.env', ext: 'env', lines: 12, complexity: 0, deps: 0, dependents: 3, cluster: 7 },
  // Lib
  { name: 'prisma.ts', path: 'src/lib/prisma.ts', ext: 'ts', lines: 18, complexity: 4, deps: 1, dependents: 6, cluster: 3 },
  { name: 'auth.ts', path: 'src/lib/auth.ts', ext: 'ts', lines: 96, complexity: 28, deps: 3, dependents: 4, cluster: 3 },
  { name: 'logger.ts', path: 'src/lib/logger.ts', ext: 'ts', lines: 42, complexity: 8, deps: 0, dependents: 7, cluster: 3 },
]

/* ═══════════════════════════════════════════
   Color Mapping
   ═══════════════════════════════════════════ */

const EXT_COLORS: Record<string, THREE.Color> = {
  tsx: new THREE.Color(0, 2.0, 1.2),
  jsx: new THREE.Color(0, 2.0, 1.2),
  ts: new THREE.Color(0.04, 1.6, 1.0),
  js: new THREE.Color(0.04, 1.6, 1.0),
  css: new THREE.Color(2.2, 0.5, 0.8),
  json: new THREE.Color(2.2, 1.5, 0.4),
  env: new THREE.Color(0.6, 0.6, 0.6),
  md: new THREE.Color(0.5, 0.5, 0.5),
}

function getColor(ext: string): THREE.Color {
  return EXT_COLORS[ext] || new THREE.Color(0.8, 0.8, 0.8)
}

/* ═══════════════════════════════════════════
   Cluster Layout
   ═══════════════════════════════════════════ */

const CLUSTER_CENTERS: [number, number, number][] = [
  [0, 3, 0],       // Core
  [-7, 1, -1],     // Components
  [6, 4, -2],      // Hooks
  [7, -3, 1],      // Utils/Lib
  [-5, -4, 0],     // Store
  [0, -4, -3],     // Pages
  [-7, -1, 3],     // Styles
  [6, 0, 4],       // Config
]

interface NodeData {
  file: DemoFile
  position: THREE.Vector3
  size: number
  color: THREE.Color
}

function generateDemoNodes(): { nodes: NodeData[]; edges: [number, number][] } {
  const nodes: NodeData[] = DEMO_FILES.map((file) => {
    const center = CLUSTER_CENTERS[file.cluster]
    const jitter = 2.5
    const pos = new THREE.Vector3(
      center[0] + (Math.random() - 0.5) * jitter,
      center[1] + (Math.random() - 0.5) * jitter,
      center[2] + (Math.random() - 0.5) * jitter
    )
    const size = 0.18 + (file.lines / 300) * 0.35
    const color = getColor(file.ext)
    return { file, position: pos, size, color }
  })

  const edges: [number, number][] = []
  for (let i = 0; i < nodes.length; i++) {
    const candidates: { j: number; dist: number }[] = []
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      const dist = nodes[i].position.distanceTo(nodes[j].position)
      if (dist < 5.5) candidates.push({ j, dist })
    }
    candidates.sort((a, b) => a.dist - b.dist)
    const max = Math.min(nodes[i].file.deps, candidates.length, 3)
    for (let k = 0; k < max; k++) {
      const key = [Math.min(i, candidates[k].j), Math.max(i, candidates[k].j)].join('-')
      if (!edges.some(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}` === key)) {
        edges.push([i, candidates[k].j])
      }
    }
  }

  return { nodes, edges }
}

/* ═══════════════════════════════════════════
   Interactive Nodes
   ═══════════════════════════════════════════ */

function InteractiveNodes({
  nodes,
  selectedIndex,
  heatmapOn,
  onSelect,
}: {
  nodes: NodeData[]
  selectedIndex: number | null
  heatmapOn: boolean
  onSelect: (index: number | null) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const heatColors = useMemo(() => {
    return nodes.map((n) => {
      const c = n.file.complexity
      if (c > 50) return new THREE.Color(2.0, 0.3, 0.3) // red
      if (c > 30) return new THREE.Color(1.8, 1.0, 0.2) // orange
      if (c > 15) return new THREE.Color(1.2, 1.6, 0.1) // yellow-green
      return new THREE.Color(0.2, 1.8, 0.6) // green
    })
  }, [nodes])

  useEffect(() => {
    const color = new THREE.Color()
    nodes.forEach((node, i) => {
      dummy.position.copy(node.position)
      dummy.scale.setScalar(node.size)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      color.copy(heatmapOn ? heatColors[i] : node.color)
      if (selectedIndex !== null && selectedIndex !== i) {
        color.multiplyScalar(0.3)
      }
      meshRef.current.setColorAt(i, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true
  }, [nodes, selectedIndex, heatmapOn, heatColors, dummy])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    nodes.forEach((node, i) => {
      const isSelected = selectedIndex === i
      const pulse = isSelected
        ? 1.3 + Math.sin(t * 3) * 0.15
        : 1 + Math.sin(t * 1.2 + i * 0.3) * 0.1
      dummy.position.copy(node.position)
      dummy.scale.setScalar(node.size * pulse)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
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

/* ═══════════════════════════════════════════
   Demo Edges
   ═══════════════════════════════════════════ */

function DemoEdges({
  nodes,
  edges,
  selectedIndex,
  heatmapOn,
}: {
  nodes: NodeData[]
  edges: [number, number][]
  selectedIndex: number | null
  heatmapOn: boolean
}) {
  const ref = useRef<THREE.LineSegments>(null!)

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(edges.length * 6)
    const col = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      const p1 = nodes[a].position
      const p2 = nodes[b].position
      pos[i * 6] = p1.x
      pos[i * 6 + 1] = p1.y
      pos[i * 6 + 2] = p1.z
      pos[i * 6 + 3] = p2.x
      pos[i * 6 + 4] = p2.y
      pos[i * 6 + 5] = p2.z

      const dim = 0.35
      const c1 = nodes[a].color
      const c2 = nodes[b].color
      col[i * 6] = c1.r * dim
      col[i * 6 + 1] = c1.g * dim
      col[i * 6 + 2] = c1.b * dim
      col[i * 6 + 3] = c2.r * dim
      col[i * 6 + 4] = c2.g * dim
      col[i * 6 + 5] = c2.b * dim
    })
    return { positions: pos, colors: col }
  }, [nodes, edges])

  useFrame(() => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.LineBasicMaterial
    mat.opacity = selectedIndex !== null ? 0.1 : 0.2
  })

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.2} toneMapped={false} />
    </lineSegments>
  )
}

/* ═══════════════════════════════════════════
   Ambient Particles
   ═══════════════════════════════════════════ */

function AmbientDust() {
  const ref = useRef<THREE.Points>(null!)
  const count = 200

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.005
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00E89C"
        transparent
        opacity={0.25}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  )
}

/* ═══════════════════════════════════════════
   Scene Content
   ═══════════════════════════════════════════ */

function SceneContent({
  onSelect,
  selectedIndex,
  heatmapOn,
}: {
  onSelect: (index: number | null) => void
  selectedIndex: number | null
  heatmapOn: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const { nodes, edges } = useMemo(() => generateDemoNodes(), [])

  const nodesData = useMemo(() => nodes, [nodes])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <>
      <AmbientDust />
      <group ref={groupRef}>
        <InteractiveNodes
          nodes={nodesData}
          selectedIndex={selectedIndex}
          heatmapOn={heatmapOn}
          onSelect={onSelect}
        />
        <DemoEdges
          nodes={nodesData}
          edges={edges}
          selectedIndex={selectedIndex}
          heatmapOn={heatmapOn}
        />
      </group>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={8}
        maxDistance={30}
        enablePan={false}
      />
    </>
  )
}

/* ═══════════════════════════════════════════
   Exported Demo Canvas
   ═══════════════════════════════════════════ */

interface DemoSceneProps {
  onSelect: (file: DemoFile | null) => void
  selectedIndex: number | null
  heatmapOn: boolean
}

export default function DemoScene({ onSelect, selectedIndex, heatmapOn }: DemoSceneProps) {
  const handleSelect = useCallback(
    (index: number | null) => {
      if (index === null) {
        onSelect(null)
        return
      }
      onSelect(DEMO_FILES[index])
    },
    [onSelect]
  )

  // Keep internal index in sync
  const internalIndex = useMemo(() => {
    if (selectedIndex === null) return null
    return selectedIndex
  }, [selectedIndex])

  return (
    <Canvas
      camera={{ position: [0, 1, 16], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onPointerMissed={() => onSelect(null)}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#06050E']} />
      <fog attach="fog" args={['#06050E', 18, 40]} />

      <SceneContent
        onSelect={handleSelect}
        selectedIndex={internalIndex}
        heatmapOn={heatmapOn}
      />

      <EffectComposer>
        <Bloom intensity={1.4} luminanceThreshold={0.12} mipmapBlur />
        <Vignette offset={0.4} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  )
}

export { DEMO_FILES }
