'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import type { Graph, GraphControlsAPI } from '@/lib/types'
import GraphNodes from './GraphNodes'
import GraphEdges from './GraphEdges'
import GraphParticles from './GraphParticles'

/* ═══════════════════════════════════════════
   Graph Scene — R3F Canvas Composition
   ═══════════════════════════════════════════ */

const MIN_DISTANCE = 5
const MAX_DISTANCE = 60

interface GraphSceneProps {
  graph: Graph
  selectedIndex: number | null
  heatmapOn: boolean
  onSelect: (index: number | null) => void
  onControlsReady?: (api: GraphControlsAPI) => void
}

/* ── CameraController (lives inside Canvas) ── */

interface CameraControllerProps {
  nodes: Graph['nodes']
  controlsRef: React.RefObject<any>
  onControlsReady?: (api: GraphControlsAPI) => void
}

function CameraController({
  nodes,
  controlsRef,
  onControlsReady,
}: CameraControllerProps) {
  const { camera } = useThree()

  const api = useMemo<GraphControlsAPI>(() => {
    const zoomIn = () => {
      const controls = controlsRef.current
      if (!controls) return

      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const distance = camera.position.distanceTo(controls.target)
      const newDistance = Math.max(MIN_DISTANCE, distance * 0.8)

      camera.position
        .copy(controls.target)
        .addScaledVector(direction, -newDistance)
      controls.update()
    }

    const zoomOut = () => {
      const controls = controlsRef.current
      if (!controls) return

      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)
      const distance = camera.position.distanceTo(controls.target)
      const newDistance = Math.min(MAX_DISTANCE, distance * 1.25)

      camera.position
        .copy(controls.target)
        .addScaledVector(direction, -newDistance)
      controls.update()
    }

    const fitToView = () => {
      const controls = controlsRef.current
      if (!controls || nodes.length === 0) return

      const box = new THREE.Box3()
      nodes.forEach((n) =>
        box.expandByPoint(new THREE.Vector3(...n.position)),
      )

      const center = new THREE.Vector3()
      box.getCenter(center)

      const sphere = new THREE.Sphere()
      box.getBoundingSphere(sphere)

      const perspCamera = camera as THREE.PerspectiveCamera
      const fov = perspCamera.fov * (Math.PI / 180)
      const dist = Math.min(
        MAX_DISTANCE,
        Math.max(MIN_DISTANCE, (sphere.radius / Math.sin(fov / 2)) * 1.3),
      )

      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)

      camera.position.copy(center).addScaledVector(direction, -dist)
      controls.target.copy(center)
      controls.update()
    }

    return { zoomIn, zoomOut, fitToView }
  }, [camera, controlsRef, nodes])

  useEffect(() => {
    onControlsReady?.(api)
  }, [api, onControlsReady])

  return null
}

/* ── Main Scene ── */

export default function GraphScene({
  graph,
  selectedIndex,
  heatmapOn,
  onSelect,
  onControlsReady,
}: GraphSceneProps) {
  const controlsRef = useRef<any>(null)

  const handlePointerMissed = useCallback(() => {
    onSelect(null)
  }, [onSelect])

  return (
    <Canvas
      camera={{ position: [0, 4, 28], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onPointerMissed={handlePointerMissed}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#06050E']} />
      <fog attach="fog" args={['#06050E', 30, 70]} />

      <ambientLight intensity={0.3} />

      <GraphParticles />

      <GraphNodes
        nodes={graph.nodes}
        selectedIndex={selectedIndex}
        heatmapOn={heatmapOn}
        onSelect={onSelect}
      />

      <GraphEdges
        nodes={graph.nodes}
        edges={graph.edges}
        selectedIndex={selectedIndex}
      />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />

      <CameraController
        nodes={graph.nodes}
        controlsRef={controlsRef}
        onControlsReady={onControlsReady}
      />

      <EffectComposer>
        <Bloom intensity={1.4} luminanceThreshold={0.12} mipmapBlur />
        <Vignette offset={0.4} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
