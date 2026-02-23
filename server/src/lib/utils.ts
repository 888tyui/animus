import { v4 as uuidv4 } from 'uuid'

export function generateId(): string {
  return uuidv4()
}

export function getExtension(path: string): string {
  const name = path.split('/').pop() || ''
  const lower = name.toLowerCase()
  if (lower === 'dockerfile') return 'dockerfile'
  if (lower.startsWith('.env')) return 'env'
  if (lower === '.gitignore') return 'gitignore'
  if (lower === '.editorconfig') return 'editorconfig'
  if (lower === '.npmignore') return 'npmignore'
  if (lower === 'license' || lower === 'licence') return 'txt'
  if (lower === 'makefile') return 'sh'
  if (lower.endsWith('.d.ts') || lower.endsWith('.d.mts') || lower.endsWith('.d.cts')) return 'ts'
  const dotIdx = name.lastIndexOf('.')
  if (dotIdx === -1 || dotIdx === 0) return ''
  return name.slice(dotIdx + 1).toLowerCase()
}

export function getFileName(path: string): string {
  return path.split('/').pop() || path
}
