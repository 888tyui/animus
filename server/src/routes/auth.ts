import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { generateChallenge, verifySignature, upsertUser } from '../services/auth.service.js'
import { authenticate } from '../middleware/authenticate.js'

const challengeQuery = z.object({
  walletAddress: z.string().min(32).max(44),
})

const verifyBody = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().min(1),
  challenge: z.string().min(1),
  walletName: z.string().max(50).optional(),
})

export default async function authRoutes(fastify: FastifyInstance) {
  // GET /auth/challenge — rate limited to 20/min per IP
  fastify.get('/challenge', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const result = challengeQuery.safeParse(request.query)
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid wallet address' })
    }

    const { walletAddress } = result.data
    const challenge = generateChallenge(walletAddress)

    return { challenge }
  })

  // POST /auth/verify — rate limited to 5/min per IP
  fastify.post('/verify', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const result = verifyBody.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.issues })
    }

    const { walletAddress, signature, challenge, walletName } = result.data
    const valid = verifySignature(walletAddress, signature, challenge)

    if (!valid) {
      return reply.status(401).send({ error: 'Invalid signature or expired challenge' })
    }

    const user = await upsertUser(fastify, walletAddress, walletName)
    const token = fastify.signJwt({ userId: user.id, walletAddress: user.walletAddress })

    return {
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        walletName: user.walletName,
        onboardingComplete: user.onboardingComplete,
        settings: user.settings,
      },
    }
  })

  // GET /auth/me
  fastify.get('/me', { preHandler: [authenticate] }, async (request) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.userId },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      walletName: user.walletName,
      onboardingComplete: user.onboardingComplete,
      settings: user.settings,
    }
  })
}
