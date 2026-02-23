import { v4 as uuidv4 } from 'uuid'

export function generateId(): string {
  return uuidv4()
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function truncatePath(path: string, maxLen = 40): string {
  if (path.length <= maxLen) return path
  const parts = path.split('/')
  if (parts.length <= 2) return '...' + path.slice(-maxLen + 3)
  return parts[0] + '/.../' + parts.slice(-2).join('/')
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function getExtension(path: string): string {
  const name = path.split('/').pop() || ''
  const lower = name.toLowerCase()
  // Handle special filenames
  if (lower === 'dockerfile') return 'dockerfile'
  if (lower.startsWith('.env')) return 'env'
  if (lower === '.gitignore') return 'gitignore'
  if (lower === '.editorconfig') return 'editorconfig'
  if (lower === '.npmignore') return 'npmignore'
  if (lower === 'license' || lower === 'licence') return 'txt'
  if (lower === 'makefile') return 'sh'
  // Handle .d.ts, .d.mts, etc.
  if (lower.endsWith('.d.ts') || lower.endsWith('.d.mts') || lower.endsWith('.d.cts')) return 'ts'
  const dotIdx = name.lastIndexOf('.')
  if (dotIdx === -1 || dotIdx === 0) return ''
  return name.slice(dotIdx + 1).toLowerCase()
}

export function getFileName(path: string): string {
  return path.split('/').pop() || path
}
