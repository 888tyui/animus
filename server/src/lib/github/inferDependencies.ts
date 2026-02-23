import type { GraphNode, GraphEdge } from '../../types/index.js'

export function inferDependencies(nodes: GraphNode[]): GraphEdge[] {
  if (nodes.length <= 1) return []

  const edgeSet = new Set<string>()
  const edges: GraphEdge[] = []
  const maxEdges = Math.max(nodes.length * 3, 10)

  const nodesByDir = buildDirectoryMap(nodes)
  const nodesByBasename = buildBasenameMap(nodes)

  applyRelatedFilesRule(nodesByBasename, edgeSet, edges, maxEdges)
  applyIndexHubRule(nodes, nodesByDir, edgeSet, edges, maxEdges)
  applySiblingRule(nodesByDir, edgeSet, edges, maxEdges)
  applyFuzzyMatchRule(nodes, edgeSet, edges, maxEdges)
  applyConfigFanRule(nodes, nodesByDir, edgeSet, edges, maxEdges)

  return edges
}

function getDir(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx === -1 ? '' : path.slice(0, idx)
}

function getBasename(name: string): string {
  const dotIdx = name.indexOf('.')
  return dotIdx === -1 ? name : name.slice(0, dotIdx)
}

function buildDirectoryMap(nodes: GraphNode[]): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (let i = 0; i < nodes.length; i++) {
    const dir = getDir(nodes[i].path)
    const list = map.get(dir)
    if (list) { list.push(i) } else { map.set(dir, [i]) }
  }
  return map
}

function buildBasenameMap(nodes: GraphNode[]): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (let i = 0; i < nodes.length; i++) {
    const base = getBasename(nodes[i].name)
    if (!base) continue
    const list = map.get(base)
    if (list) { list.push(i) } else { map.set(base, [i]) }
  }
  return map
}

function addEdge(source: number, target: number, edgeSet: Set<string>, edges: GraphEdge[], maxEdges: number): boolean {
  if (edges.length >= maxEdges) return false
  if (source === target) return false
  const key = source < target ? `${source}:${target}` : `${target}:${source}`
  if (edgeSet.has(key)) return false
  edgeSet.add(key)
  edges.push({ source, target })
  return true
}

function applyRelatedFilesRule(nodesByBasename: Map<string, number[]>, edgeSet: Set<string>, edges: GraphEdge[], maxEdges: number): void {
  for (const [, indices] of nodesByBasename) {
    if (indices.length < 2 || indices.length > 8) continue
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        if (edges.length >= maxEdges) return
        addEdge(indices[i], indices[j], edgeSet, edges, maxEdges)
      }
    }
  }
}

function applyIndexHubRule(nodes: GraphNode[], nodesByDir: Map<string, number[]>, edgeSet: Set<string>, edges: GraphEdge[], maxEdges: number): void {
  for (let i = 0; i < nodes.length; i++) {
    const lower = nodes[i].name.toLowerCase()
    if (lower !== 'index.ts' && lower !== 'index.tsx' && lower !== 'index.js' && lower !== 'index.jsx') continue
    const dir = getDir(nodes[i].path)
    const siblings = nodesByDir.get(dir)
    if (!siblings) continue
    for (const sibIdx of siblings) {
      if (edges.length >= maxEdges) return
      addEdge(i, sibIdx, edgeSet, edges, maxEdges)
    }
  }
}

function applySiblingRule(nodesByDir: Map<string, number[]>, edgeSet: Set<string>, edges: GraphEdge[], maxEdges: number): void {
  for (const [, indices] of nodesByDir) {
    if (indices.length < 2) continue
    for (let i = 0; i < indices.length; i++) {
      if (edges.length >= maxEdges) return
      let count = 0
      for (let j = 0; j < indices.length && count < 3; j++) {
        if (i === j) continue
        if (addEdge(indices[i], indices[j], edgeSet, edges, maxEdges)) count++
      }
    }
  }
}

function applyFuzzyMatchRule(nodes: GraphNode[], edgeSet: Set<string>, edges: GraphEdge[], maxEdges: number): void {
  if (nodes.length > 2000) return
  for (let i = 0; i < nodes.length; i++) {
    if (edges.length >= maxEdges) return
    const baseName = getBasename(nodes[i].name).toLowerCase()
    if (baseName.length < 3) continue
    const coreNameI = baseName.startsWith('use') && baseName.length > 3 ? baseName.slice(3) : baseName
    const dirI = getDir(nodes[i].path)
    let matchCount = 0
    for (let j = i + 1; j < nodes.length && matchCount < 2; j++) {
      const dirJ = getDir(nodes[j].path)
      if (dirI === dirJ) continue
      const otherBase = getBasename(nodes[j].name).toLowerCase()
      if (otherBase.length < 3) continue
      const coreNameJ = otherBase.startsWith('use') && otherBase.length > 3 ? otherBase.slice(3) : otherBase
      if (
        coreNameI === coreNameJ ||
        (coreNameI.length >= 4 && coreNameJ.includes(coreNameI)) ||
        (coreNameJ.length >= 4 && coreNameI.includes(coreNameJ))
      ) {
        if (addEdge(i, j, edgeSet, edges, maxEdges)) matchCount++
      }
    }
  }
}

function applyConfigFanRule(nodes: GraphNode[], nodesByDir: Map<string, number[]>, edgeSet: Set<string>, edges: GraphEdge[], maxEdges: number): void {
  const configNames = new Set([
    'package.json', 'tsconfig.json', 'tsconfig.node.json',
    'next.config.js', 'next.config.ts', 'next.config.mjs',
    'vite.config.ts', 'vite.config.js',
    'tailwind.config.ts', 'tailwind.config.js',
    'postcss.config.js', 'postcss.config.mjs',
    '.eslintrc.json', '.eslintrc.js', 'eslint.config.js', 'eslint.config.mjs',
  ])
  for (let i = 0; i < nodes.length; i++) {
    if (!configNames.has(nodes[i].name)) continue
    if (edges.length >= maxEdges) return
    const dir = getDir(nodes[i].path)
    const siblings = nodesByDir.get(dir)
    if (!siblings) continue
    let count = 0
    for (const sibIdx of siblings) {
      if (count >= 5) break
      if (edges.length >= maxEdges) return
      if (addEdge(i, sibIdx, edgeSet, edges, maxEdges)) count++
    }
  }
}
