import { type FastifyInstance } from 'fastify'

const startedAt = Date.now()

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, reply) => {
    let dbOk = false
    try {
      await fastify.prisma.$queryRaw`SELECT 1`
      dbOk = true
    } catch {
      // DB unreachable
    }

    const status = dbOk ? 'healthy' : 'degraded'
    const code = dbOk ? 200 : 503

    return reply.status(code).send({
      status,
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      database: dbOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    })
  })
}
