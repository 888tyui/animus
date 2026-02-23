import NodeCache from 'node-cache'

const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  maxKeys: 10_000,
  useClones: false,
})

export function cacheGet<T>(key: string): T | undefined {
  return cache.get<T>(key)
}

export function cacheSet<T>(key: string, value: T, ttl?: number): boolean {
  try {
    if (ttl !== undefined) {
      return cache.set(key, value, ttl)
    }
    return cache.set(key, value)
  } catch {
    // maxKeys exceeded — evict old keys aren't supported natively,
    // but NodeCache will throw if maxKeys is hit. Silently fail.
    return false
  }
}

export function cacheDel(key: string): number {
  return cache.del(key)
}
