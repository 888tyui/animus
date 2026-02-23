import type { GraphNode, GraphEdge } from '@/lib/types'

/**
 * Infer dependency edges between nodes based on file path heuristics.
 * Since we only have the file tree (not file contents), we use structural
 * patterns to guess which files are related.
 *
 * Rules:
 * 1. Related files: same basename, different extension (Button.tsx <-> Button.module.css)
 * 2. Index hubs: index.ts/index.tsx connects to all siblings in its directory
 * 3. Same-directory siblings: files in the same dir get edges (top 3 by name similarity)
 * 4. Import pattern inference: fuzzy name match across directories (useAuth -> auth)
 * 5. Config fans: package.json / tsconfig.json connect to nearby files
 * 6. Deduplicate and cap total edges at ~3x node count
 */
export function inferDependencies(nodes: GraphNode[]): GraphEdge[] {
  if (nodes.length <= 1) return []

  const edgeSet = new Set<string>()
  const edges: GraphEdge[] = []

  const maxEdges = Math.max(nodes.length * 3, 10)

  // Pre-compute lookup structures
  const nodesByDir = buildDirectoryMap(nodes)
  const nodesByBasename = buildBasenameMap(nodes)

  // Rule 1: Related files (same basename, different extension)
  applyRelatedFilesRule(nodesByBasename, edgeSet, edges, maxEdges)

  // Rule 2: Index hub connections
  applyIndexHubRule(nodes, nodesByDir, edgeSet, edges, maxEdges)

  // Rule 3: Same-directory siblings (top 3 by name similarity)
  applySiblingRule(nodesByDir, edgeSet, edges, maxEdges)

  // Rule 4: Import pattern inference (fuzzy cross-directory matching)
  applyFuzzyMatchRule(nodes, edgeSet, edges, maxEdges)

  // Rule 5: Config fans
  applyConfigFanRule(nodes, nodesByDir, edgeSet, edges, maxEdges)

  return edges
}

// ---------------------------------------------------------------------------
// Helper structures
// ---------------------------------------------------------------------------

function getDir(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx === -1 ? '' : path.slice(0, idx)
}

function getBasename(name: string): string {
  // "Button.module.css" -> "Button"
  // "useAuth.ts" -> "useAuth"
  const dotIdx = name.indexOf('.')
  return dotIdx === -1 ? name : name.slice(0, dotIdx)
}

function buildDirectoryMap(nodes: GraphNode[]): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (let i = 0; i < nodes.length; i++) {
    const dir = getDir(nodes[i].path)
    const list = map.get(dir)
    if (list) {
      list.push(i)
    } else {
      map.set(dir, [i])
    }
  }
  return map
}

function buildBasenameMap(nodes: GraphNode[]): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (let i = 0; i < nodes.length; i++) {
    const base = getBasename(nodes[i].name)
    if (!base) continue
    const list = map.get(base)
    if (list) {
      list.push(i)
    } else {
      map.set(base, [i])
    }
  }
  return map
}

function addEdge(
  source: number,
  target: number,
  edgeSet: Set<string>,
  edges: GraphEdge[],
  maxEdges: number
): boolean {
  if (edges.length >= maxEdges) return false
  if (source === target) return false

  // Canonical key: smaller index first to avoid duplicates
  const key = source < target ? `${source}:${target}` : `${target}:${source}`
  if (edgeSet.has(key)) return false

  edgeSet.add(key)
  edges.push({ source, target })
  return true
}

// ---------------------------------------------------------------------------
// Rule implementations
// ---------------------------------------------------------------------------

/**
 * Rule 1: Files with the same basename but different extensions are related.
 * e.g., Button.tsx, Button.module.css, Button.test.tsx, Button.stories.tsx
 */
function applyRelatedFilesRule(
  nodesByBasename: Map<string, number[]>,
  edgeSet: Set<string>,
  edges: GraphEdge[],
  maxEdges: number
): void {
  for (const [, indices] of nodesByBasename) {
    if (indices.length < 2 || indices.length > 8) continue
    // Connect all pairs (small groups)
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        if (edges.length >= maxEdges) return
        addEdge(indices[i], indices[j], edgeSet, edges, maxEdges)
      }
    }
  }
}

/**
 * Rule 2: index.ts / index.tsx files connect to all siblings in their directory.
 */
function applyIndexHubRule(
  nodes: GraphNode[],
  nodesByDir: Map<string, number[]>,
  edgeSet: Set<string>,
  edges: GraphEdge[],
  maxEdges: number
): void {
  for (let i = 0; i < nodes.length; i++) {
    const lower = nodes[i].name.toLowerCase()
    if (lower !== 'index.ts' && lower !== 'index.tsx' && lower !== 'index.js' && lower !== 'index.jsx') {
      continue
    }

    const dir = getDir(nodes[i].path)
    const siblings = nodesByDir.get(dir)
    if (!siblings) continue

    for (const sibIdx of siblings) {
      if (edges.length >= maxEdges) return
      addEdge(i, sibIdx, edgeSet, edges, maxEdges)
    }
  }
}

/**
 * Rule 3: Same-directory siblings, limited to the 3 closest by name similarity.
 */
function applySiblingRule(
  nodesByDir: Map<string, number[]>,
  edgeSet: Set<string>,
  edges: GraphEdge[],
  maxEdges: number
): void {
  for (const [, indices] of nodesByDir) {
    if (indices.length < 2) continue

    // For each file, connect to top 3 most similar siblings
    for (let i = 0; i < indices.length; i++) {
      if (edges.length >= maxEdges) return

      // We already sorted by dir, just take nearest neighbors by index
      // (files near each other alphabetically tend to be related)
      let count = 0
      for (let j = 0; j < indices.length && count < 3; j++) {
        if (i === j) continue
        if (addEdge(indices[i], indices[j], edgeSet, edges, maxEdges)) {
          count++
        }
      }
    }
  }
}

/**
 * Rule 4: Fuzzy name match across directories.
 * e.g., hooks/useAuth.ts <-> lib/auth.ts, utils/date.ts <-> helpers/dateFormat.ts
 */
function applyFuzzyMatchRule(
  nodes: GraphNode[],
  edgeSet: Set<string>,
  edges: GraphEdge[],
  maxEdges: number
): void {
  // Only attempt for reasonably sized repos to avoid O(n^2) blowup
  if (nodes.length > 2000) return

  for (let i = 0; i < nodes.length; i++) {
    if (edges.length >= maxEdges) return

    const baseName = getBasename(nodes[i].name).toLowerCase()
    if (baseName.length < 3) continue

    // Strip common prefixes like "use" for hook files
    const coreNameI = baseName.startsWith('use') && baseName.length > 3
      ? baseName.slice(3)
      : baseName

    const dirI = getDir(nodes[i].path)
    let matchCount = 0

    for (let j = i + 1; j < nodes.length && matchCount < 2; j++) {
      // Only match across different directories
      const dirJ = getDir(nodes[j].path)
      if (dirI === dirJ) continue

      const otherBase = getBasename(nodes[j].name).toLowerCase()
      if (otherBase.length < 3) continue

      const coreNameJ = otherBase.startsWith('use') && otherBase.length > 3
        ? otherBase.slice(3)
        : otherBase

      // Check if one core name contains the other
      if (
        coreNameI === coreNameJ ||
        (coreNameI.length >= 4 && coreNameJ.includes(coreNameI)) ||
        (coreNameJ.length >= 4 && coreNameI.includes(coreNameJ))
      ) {
        if (addEdge(i, j, edgeSet, edges, maxEdges)) {
          matchCount++
        }
      }
    }
  }
}

/**
 * Rule 5: Config files (package.json, tsconfig.json, etc.) fan out to nearby files.
 */
function applyConfigFanRule(
  nodes: GraphNode[],
  nodesByDir: Map<string, number[]>,
  edgeSet: Set<string>,
  edges: GraphEdge[],
  maxEdges: number
): void {
  const configNames = new Set([
    'package.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'next.config.js',
    'next.config.ts',
    'next.config.mjs',
    'vite.config.ts',
    'vite.config.js',
    'tailwind.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    'postcss.config.mjs',
    '.eslintrc.json',
    '.eslintrc.js',
    'eslint.config.js',
    'eslint.config.mjs',
  ])

  for (let i = 0; i < nodes.length; i++) {
    if (!configNames.has(nodes[i].name)) continue
    if (edges.length >= maxEdges) return

    const dir = getDir(nodes[i].path)
    const siblings = nodesByDir.get(dir)
    if (!siblings) continue

    // Connect config to up to 5 siblings
    let count = 0
    for (const sibIdx of siblings) {
      if (count >= 5) break
      if (edges.length >= maxEdges) return
      if (addEdge(i, sibIdx, edgeSet, edges, maxEdges)) {
        count++
      }
    }
  }
}
