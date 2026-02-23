import { describe, it, expect } from 'vitest'
import { parseRepoUrl } from './parseRepoUrl.js'

describe('parseRepoUrl', () => {
  it('parses full HTTPS URL', () => {
    expect(parseRepoUrl('https://github.com/vercel/next.js')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
  })

  it('parses URL without protocol', () => {
    expect(parseRepoUrl('github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    })
  })

  it('parses shorthand owner/repo', () => {
    expect(parseRepoUrl('vercel/next.js')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
  })

  it('strips trailing slashes', () => {
    expect(parseRepoUrl('https://github.com/vercel/next.js/')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
  })

  it('strips .git suffix', () => {
    expect(parseRepoUrl('https://github.com/vercel/next.js.git')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
  })

  it('strips query string and hash', () => {
    expect(parseRepoUrl('https://github.com/vercel/next.js?tab=readme#about')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
  })

  it('handles HTTP protocol', () => {
    expect(parseRepoUrl('http://github.com/vercel/next.js')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
    })
  })

  it('throws on empty input', () => {
    expect(() => parseRepoUrl('')).toThrow('Repository URL is required')
  })

  it('throws on non-GitHub URL', () => {
    expect(() => parseRepoUrl('https://gitlab.com/owner/repo')).toThrow('Could not parse')
  })

  it('throws on invalid owner characters', () => {
    expect(() => parseRepoUrl('http://bad:owner/repo')).toThrow()
  })

  it('throws on deeply nested path', () => {
    expect(() => parseRepoUrl('https://github.com/owner/repo/tree/main/src')).toThrow('Could not parse')
  })

  it('rejects shorthand with dots in owner (ambiguous with domain)', () => {
    expect(() => parseRepoUrl('my-org.io/my-repo')).toThrow('Invalid repository format')
  })

  it('handles owner with hyphens only', () => {
    expect(parseRepoUrl('my-org/my-repo')).toEqual({
      owner: 'my-org',
      repo: 'my-repo',
    })
  })

  it('handles single-character names', () => {
    expect(parseRepoUrl('a/b')).toEqual({ owner: 'a', repo: 'b' })
  })
})
