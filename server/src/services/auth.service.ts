import { v4 as uuidv4 } from 'uuid'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { type FastifyInstance } from 'fastify'
import { cacheGet, cacheSet, cacheDel } from './cache.service.js'

const CHALLENGE_TTL = 300 // 5 minutes

export function generateChallenge(walletAddress: string): string {
  const nonce = uuidv4()
  const timestamp = new Date().toISOString()

  const message = [
    'Sign this message to verify your identity with Animus.',
    '',
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${timestamp}`,
  ].join('\n')

  cacheSet(`challenge:${walletAddress}`, { nonce, message }, CHALLENGE_TTL)

  return message
}

export function verifySignature(
  walletAddress: string,
  signature: string,
  challenge: string
): boolean {
  const cached = cacheGet<{ nonce: string; message: string }>(`challenge:${walletAddress}`)

  if (!cached || cached.message !== challenge) {
    return false
  }

  try {
    const publicKeyBytes = bs58.decode(walletAddress)
    const signatureBytes = bs58.decode(signature)
    const messageBytes = new TextEncoder().encode(challenge)

    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)

    // Consume the challenge (one-time use)
    cacheDel(`challenge:${walletAddress}`)

    return valid
  } catch {
    return false
  }
}

export async function upsertUser(
  fastify: FastifyInstance,
  walletAddress: string,
  walletName?: string
) {
  const user = await fastify.prisma.user.upsert({
    where: { walletAddress },
    update: {
      lastLoginAt: new Date(),
      ...(walletName ? { walletName } : {}),
    },
    create: {
      walletAddress,
      walletName: walletName || null,
    },
  })

  return user
}
