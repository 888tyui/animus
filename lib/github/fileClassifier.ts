import { FILE_TYPES, DEFAULT_FILE_TYPE } from '@/lib/constants'
import type { FileTypeInfo } from '@/lib/types'
import { getExtension } from '@/lib/utils'

/**
 * Classify a file by its path/extension, returning the matching
 * FileTypeInfo (label, color, hdrColor, category) or a default fallback.
 */
export function classifyFile(path: string): FileTypeInfo {
  const ext = getExtension(path)
  return FILE_TYPES[ext] || DEFAULT_FILE_TYPE
}

/**
 * Assign a cluster index to a file based on its top-level directory.
 * Files at the repository root are assigned to a shared "root" cluster.
 *
 * The clusterMap accumulates directory-to-index mappings across calls
 * so that the same directory always maps to the same cluster number.
 *
 * @param path      Full file path (e.g. "src/components/Button.tsx")
 * @param clusterMap  Mutable map of directory name -> cluster index
 * @returns The numeric cluster index for this file
 */
export function assignCluster(
  path: string,
  clusterMap: Map<string, number>
): number {
  const segments = path.split('/')

  // Top-level files (no directory) go into the "(root)" cluster
  const topDir = segments.length > 1 ? segments[0] : '(root)'

  const existing = clusterMap.get(topDir)
  if (existing !== undefined) {
    return existing
  }

  const nextIndex = clusterMap.size
  clusterMap.set(topDir, nextIndex)
  return nextIndex
}
