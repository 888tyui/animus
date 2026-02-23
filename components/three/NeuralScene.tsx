'use client'

import { useRef, useMemo, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ═══════════════════════════════════════════
   Constants & Types
   ═══════════════════════════════════════════ */

const NODE_COUNT = 130
const PARTICLE_COUNT = 300
const SPHERE_RADIUS = 14
const CONNECTION_DISTANCE = 6
const MAX_CONNECTIONS = 3
const PULSE_COUNT = 10

const PALETTE = [
  new THREE.Color(0, 2.0, 1.2),     // Emerald green (HDR for bloom)
  new THREE.Color(2.2, 0.5, 0.8),   // Coral pink (HDR)
  new THREE.Color(2.2, 1.5, 0.4),   // Warm amber (HDR)
  new THREE.Color(1.0, 0.6, 2.0),   // Soft lavender (HDR)
]

interface NodeData {
  position: THREE.Vector3
  size: number
  color: THREE.Color
}

/* ═══════════════════════════════════════════
   Node Generation — Fibonacci Sphere
   ═══════════════════════════════════════════ */

function generateNodes(count: number, radius: number): NodeData[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const nodes: NodeData[] = []

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i

    const jitter = 0.7 + Math.random() * 0.8
    const r = radius * jitter

    const px = Math.cos(theta) * radiusAtY * r + (Math.random() - 0.5) * 2.5
    const py = y * r + (Math.random() - 0.5) * 2.5
    const pz = Math.sin(theta) * radiusAtY * r + (Math.random() - 0.5) * 2.5

    const isHub = Math.random() < 0.08
    const isMedium = Math.random() < 0.3
    const size = isHub ? 0.28 : isMedium ? 0.14 : 0.07

    const colorIndex = Math.floor(Math.random() * PALETTE.length)
    const color = PALETTE[colorIndex].clone()
    const brightness = 0.7 + Math.random() * 0.6
    color.multiplyScalar(brightness)

    nodes.push({
      position: new THREE.Vector3(px, py, pz),
      size,
      color,
    })
  }

  return nodes
}

/* ═══════════════════════════════════════════
   Edge Generation
   ═══════════════════════════════════════════ */

function generateEdges(
  nodes: NodeData[],
  maxDist: number,
  maxConn: number
): [number, number][] {
  const edges: [number, number][] = []
  const connectionCount = new Map<number, number>()

  for (let i = 0; i < nodes.length; i++) {
    const candidates: { index: number; dist: number }[] = []
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      const dist = nodes[i].position.distanceTo(nodes[j].position)
      if (dist < maxDist) {
        candidates.push({ index: j, dist })
      }
    }

    candidates.sort((a, b) => a.dist - b.dist)

    let added = 0
    for (const c of candidates) {
      if (added >= maxConn) break
      const fromCount = connectionCount.get(i) || 0
      const toCount = connectionCount.get(c.index) || 0
      if (fromCount >= maxConn + 1 || toCount >= maxConn + 1) continue

      const key1 = `${Math.min(i, c.index)}-${Math.max(i, c.index)}`
      const exists = edges.some(
        ([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}` === key1
      )
      if (!exists) {
        edges.push([i, c.index])
        connectionCount.set(i, fromCount + 1)
        connectionCount.set(c.index, toCount + 1)
        added++
      }
    }
  }

  return edges
}

/* ═══════════════════════════════════════════
   Nodes — Static InstancedMesh (no per-frame update)
   ═══════════════════════════════════════════ */

function Nodes({ nodes }: { nodes: NodeData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const color = new THREE.Color()
    nodes.forEach((node, i) => {
      dummy.position.copy(node.position)
      dummy.scale.setScalar(node.size)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      color.copy(node.color)
      meshRef.current.setColorAt(i, color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true
  }, [nodes, dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════
   Edges — Static LineSegments (no per-frame update)
   ═══════════════════════════════════════════ */

function Edges({
  nodes,
  edges,
}: {
  nodes: NodeData[]
  edges: [number, number][]
}) {
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(edges.length * 6)
    const col = new Float32Array(edges.length * 6)

    edges.forEach(([a, b], i) => {
      const p1 = nodes[a].position
      const p2 = nodes[b].position
      const c1 = nodes[a].color
      const c2 = nodes[b].color

      pos[i * 6] = p1.x
      pos[i * 6 + 1] = p1.y
      pos[i * 6 + 2] = p1.z
      pos[i * 6 + 3] = p2.x
      pos[i * 6 + 4] = p2.y
      pos[i * 6 + 5] = p2.z

      const dim = 0.25
      col[i * 6] = c1.r * dim
      col[i * 6 + 1] = c1.g * dim
      col[i * 6 + 2] = c1.b * dim
      col[i * 6 + 3] = c2.r * dim
      col[i * 6 + 4] = c2.g * dim
      col[i * 6 + 5] = c2.b * dim
    })

    return { positions: pos, colors: col }
  }, [nodes, edges])

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.14}
        toneMapped={false}
      />
    </lineSegments>
  )
}

/* ═══════════════════════════════════════════
   Energy Pulses — Traveling light along edges
   ═══════════════════════════════════════════ */

function EnergyPulses({
  nodes,
  edges,
}: {
  nodes: NodeData[]
  edges: [number, number][]
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const pulseData = useMemo(() => {
    return Array.from({ length: PULSE_COUNT }, () => {
      const edgeIndex = Math.floor(Math.random() * edges.length)
      return {
        edgeIndex,
        speed: 0.3 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
      }
    })
  }, [edges])

  useEffect(() => {
    const color = new THREE.Color()
    pulseData.forEach((_, i) => {
      color.set(PALETTE[i % PALETTE.length])
      color.multiplyScalar(3)
      meshRef.current.setColorAt(i, color)
    })
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true
  }, [pulseData])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    pulseData.forEach((pulse, i) => {
      const [a, b] = edges[pulse.edgeIndex]
      const p1 = nodes[a].position
      const p2 = nodes[b].position
      const progress = (Math.sin(t * pulse.speed + pulse.offset) + 1) / 2

      dummy.position.lerpVectors(p1, p2, progress)
      dummy.scale.setScalar(0.06)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PULSE_COUNT]}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════
   Ambient Particles — Static (rotates with parent group)
   ═══════════════════════════════════════════ */

function Particles() {
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [])

  const colors = useMemo(() => {
    const col = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      col[i * 3] = c.r * 0.3
      col[i * 3 + 1] = c.g * 0.3
      col[i * 3 + 2] = c.b * 0.3
    }
    return col
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  )
}

/* ═══════════════════════════════════════════
   Camera Rig — Mouse Parallax
   ═══════════════════════════════════════════ */

function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0, z: 28 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  useFrame(() => {
    target.current.x = mouse.current.x * 2
    target.current.y = -mouse.current.y * 1.5

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      target.current.x,
      0.015
    )
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      target.current.y,
      0.015
    )
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ═══════════════════════════════════════════
   Main Neural Network Scene
   ═══════════════════════════════════════════ */

function NeuralNetworkGraph() {
  const groupRef = useRef<THREE.Group>(null!)

  const { nodes, edges } = useMemo(() => {
    const n = generateNodes(NODE_COUNT, SPHERE_RADIUS)
    const e = generateEdges(n, CONNECTION_DISTANCE, MAX_CONNECTIONS)
    return { nodes: n, edges: e }
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.035
  })

  return (
    <group ref={groupRef}>
      <Nodes nodes={nodes} />
      <Edges nodes={nodes} edges={edges} />
      <EnergyPulses nodes={nodes} edges={edges} />
      <Particles />
    </group>
  )
}

/* ═══════════════════════════════════════════
   Exported Canvas Component
   ═══════════════════════════════════════════ */

export default function NeuralScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 28], fov: 60, near: 0.1, far: 100 }}
      dpr={[1, 1.25]}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <color attach="background" args={['#06050E']} />
      <fog attach="fog" args={['#06050E', 22, 55]} />

      <CameraRig />
      <NeuralNetworkGraph />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  )
}
