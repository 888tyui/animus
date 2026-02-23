import { describe, it, expect } from 'vitest'
import {
  uuidParam,
  createWorkspaceBody,
  updateWorkspaceBody,
  updateUserBody,
  parseGraphBody,
  updateGraphBody,
} from './index.js'

describe('Zod validation schemas', () => {
  describe('uuidParam', () => {
    it('accepts valid UUID', () => {
      const result = uuidParam.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' })
      expect(result.success).toBe(true)
    })

    it('rejects non-UUID string', () => {
      const result = uuidParam.safeParse({ id: 'not-a-uuid' })
      expect(result.success).toBe(false)
    })

    it('rejects empty string', () => {
      const result = uuidParam.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('createWorkspaceBody', () => {
    it('accepts valid name', () => {
      const result = createWorkspaceBody.safeParse({ name: 'My Workspace' })
      expect(result.success).toBe(true)
    })

    it('accepts name with optional color', () => {
      const result = createWorkspaceBody.safeParse({ name: 'WS', color: '#FF5C87' })
      expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
      const result = createWorkspaceBody.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })

    it('rejects name over 100 chars', () => {
      const result = createWorkspaceBody.safeParse({ name: 'a'.repeat(101) })
      expect(result.success).toBe(false)
    })

    it('rejects invalid color format', () => {
      const result = createWorkspaceBody.safeParse({ name: 'WS', color: 'red' })
      expect(result.success).toBe(false)
    })

    it('rejects 3-digit hex color', () => {
      const result = createWorkspaceBody.safeParse({ name: 'WS', color: '#FFF' })
      expect(result.success).toBe(false)
    })
  })

  describe('updateWorkspaceBody', () => {
    it('accepts empty object (all optional)', () => {
      const result = updateWorkspaceBody.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts partial update', () => {
      const result = updateWorkspaceBody.safeParse({ name: 'Renamed' })
      expect(result.success).toBe(true)
    })

    it('rejects negative sortOrder', () => {
      const result = updateWorkspaceBody.safeParse({ sortOrder: -1 })
      expect(result.success).toBe(false)
    })
  })

  describe('updateUserBody', () => {
    it('accepts valid walletName', () => {
      const result = updateUserBody.safeParse({ walletName: 'My Wallet' })
      expect(result.success).toBe(true)
    })

    it('rejects walletName over 50 chars', () => {
      const result = updateUserBody.safeParse({ walletName: 'a'.repeat(51) })
      expect(result.success).toBe(false)
    })

    it('accepts onboardingComplete boolean', () => {
      const result = updateUserBody.safeParse({ onboardingComplete: true })
      expect(result.success).toBe(true)
    })

    it('rejects oversized settings JSON', () => {
      const bigSettings: Record<string, string> = {}
      for (let i = 0; i < 500; i++) {
        bigSettings[`key${i}`] = 'x'.repeat(100)
      }
      const result = updateUserBody.safeParse({ settings: bigSettings })
      expect(result.success).toBe(false)
    })
  })

  describe('parseGraphBody', () => {
    it('accepts repoUrl only', () => {
      const result = parseGraphBody.safeParse({ repoUrl: 'https://github.com/owner/repo' })
      expect(result.success).toBe(true)
    })

    it('accepts repoUrl with workspaceId', () => {
      const result = parseGraphBody.safeParse({
        repoUrl: 'https://github.com/owner/repo',
        workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty repoUrl', () => {
      const result = parseGraphBody.safeParse({ repoUrl: '' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid workspaceId', () => {
      const result = parseGraphBody.safeParse({ repoUrl: 'url', workspaceId: 'bad' })
      expect(result.success).toBe(false)
    })
  })

  describe('updateGraphBody', () => {
    it('accepts name update', () => {
      const result = updateGraphBody.safeParse({ name: 'New Name' })
      expect(result.success).toBe(true)
    })

    it('accepts null workspaceId (remove from workspace)', () => {
      const result = updateGraphBody.safeParse({ workspaceId: null })
      expect(result.success).toBe(true)
    })

    it('rejects name over 200 chars', () => {
      const result = updateGraphBody.safeParse({ name: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })
  })
})
