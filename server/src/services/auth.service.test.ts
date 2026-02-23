import { describe, it, expect } from 'vitest'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { generateChallenge, verifySignature } from './auth.service.js'

// Generate a real Solana keypair for testing
function createTestKeypair() {
  const keypair = nacl.sign.keyPair()
  const walletAddress = bs58.encode(keypair.publicKey)
  return { walletAddress, keypair }
}

function signMessage(message: string, keypair: nacl.SignKeyPair): string {
  const messageBytes = new TextEncoder().encode(message)
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
  return bs58.encode(signature)
}

describe('auth service', () => {
  describe('generateChallenge', () => {
    it('returns a message containing the wallet address', () => {
      const { walletAddress } = createTestKeypair()
      const challenge = generateChallenge(walletAddress)
      expect(challenge).toContain(walletAddress)
    })

    it('includes nonce and timestamp', () => {
      const { walletAddress } = createTestKeypair()
      const challenge = generateChallenge(walletAddress)
      expect(challenge).toContain('Nonce:')
      expect(challenge).toContain('Timestamp:')
    })

    it('generates unique challenges each time', () => {
      const { walletAddress } = createTestKeypair()
      const c1 = generateChallenge(walletAddress)
      const c2 = generateChallenge(walletAddress)
      expect(c1).not.toBe(c2)
    })
  })

  describe('verifySignature', () => {
    it('verifies a valid signature', () => {
      const { walletAddress, keypair } = createTestKeypair()
      const challenge = generateChallenge(walletAddress)
      const signature = signMessage(challenge, keypair)

      expect(verifySignature(walletAddress, signature, challenge)).toBe(true)
    })

    it('rejects an invalid signature', () => {
      const { walletAddress } = createTestKeypair()
      const challenge = generateChallenge(walletAddress)

      // Sign with a different keypair
      const { keypair: otherKeypair } = createTestKeypair()
      const badSignature = signMessage(challenge, otherKeypair)

      expect(verifySignature(walletAddress, badSignature, challenge)).toBe(false)
    })

    it('rejects when challenge does not match cached', () => {
      const { walletAddress, keypair } = createTestKeypair()
      generateChallenge(walletAddress) // creates cached challenge
      const fakeChallenge = 'Sign this fake message'
      const signature = signMessage(fakeChallenge, keypair)

      expect(verifySignature(walletAddress, signature, fakeChallenge)).toBe(false)
    })

    it('consumes challenge after use (one-time)', () => {
      const { walletAddress, keypair } = createTestKeypair()
      const challenge = generateChallenge(walletAddress)
      const signature = signMessage(challenge, keypair)

      expect(verifySignature(walletAddress, signature, challenge)).toBe(true)
      // Second attempt with same challenge should fail
      expect(verifySignature(walletAddress, signature, challenge)).toBe(false)
    })

    it('rejects when no challenge was generated', () => {
      const { walletAddress, keypair } = createTestKeypair()
      const message = 'arbitrary message'
      const signature = signMessage(message, keypair)

      expect(verifySignature(walletAddress, signature, message)).toBe(false)
    })
  })
})
