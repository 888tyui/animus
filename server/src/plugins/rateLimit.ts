import { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
    allowList: [],
    keyGenerator: (request) => {
      // Use wallet address if authenticated, otherwise IP
      return (request as any).user?.walletAddress || request.ip
    },
  })
}

export default fp(rateLimitPlugin, { name: 'rate-limit' })
