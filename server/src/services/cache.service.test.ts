import { describe, it, expect, beforeEach } from 'vitest'
import { cacheGet, cacheSet, cacheDel } from './cache.service.js'

describe('cache service', () => {
  const key = 'test-key'

  beforeEach(() => {
    cacheDel(key)
  })

  it('stores and retrieves a value', () => {
    cacheSet(key, { foo: 'bar' })
    expect(cacheGet(key)).toEqual({ foo: 'bar' })
  })

  it('returns undefined for missing keys', () => {
    expect(cacheGet('nonexistent')).toBeUndefined()
  })

  it('deletes a key', () => {
    cacheSet(key, 'hello')
    cacheDel(key)
    expect(cacheGet(key)).toBeUndefined()
  })

  it('expires after TTL', async () => {
    cacheSet(key, 'short-lived', 1) // 1 second TTL
    expect(cacheGet(key)).toBe('short-lived')
    await new Promise((r) => setTimeout(r, 1100))
    expect(cacheGet(key)).toBeUndefined()
  })

  it('overwrites existing value', () => {
    cacheSet(key, 'first')
    cacheSet(key, 'second')
    expect(cacheGet(key)).toBe('second')
  })

  it('stores typed values', () => {
    cacheSet(key, 42)
    expect(cacheGet<number>(key)).toBe(42)
  })
})
