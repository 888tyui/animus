import { FILE_TYPES, DEFAULT_FILE_TYPE } from '../constants.js'
import type { FileTypeInfo } from '../../types/index.js'
import { getExtension } from '../utils.js'

export function classifyFile(path: string): FileTypeInfo {
  const ext = getExtension(path)
  return FILE_TYPES[ext] || DEFAULT_FILE_TYPE
}

export function assignCluster(
  path: string,
  clusterMap: Map<string, number>
): number {
  const segments = path.split('/')
  const topDir = segments.length > 1 ? segments[0] : '(root)'

  const existing = clusterMap.get(topDir)
  if (existing !== undefined) {
    return existing
  }

  const nextIndex = clusterMap.size
  clusterMap.set(topDir, nextIndex)
  return nextIndex
}
