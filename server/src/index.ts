// Sentry must be imported before all other modules for proper instrumentation
import { Sentry } from './instrument.js'
import Fastify from 'fastify'
import compress from '@fastify/compress'
import { config } from './config.js'
import prismaPlugin from './plugins/prisma.js'
import corsPlugin from './plugins/cors.js'
import rateLimitPlugin from './plugins/rateLimit.js'
import jwtPlugin from './plugins/jwt.js'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import workspaceRoutes from './routes/workspaces.js'
import graphRoutes from './routes/graphs.js'
import solanaRoutes from './routes/solana.js'

const isDev = process.env.NODE_ENV !== 'production'

const fastify = Fastify({
  logger: isDev
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        },
      }
    : { level: 'info' },
  bodyLimit: 2_097_152, // 2 MB — reject oversized payloads
})

// Sentry request/error hooks (no-op when DSN not configured)
if (Sentry.isInitialized()) {
  Sentry.setupFastifyErrorHandler(fastify)
}

// Plugins
await fastify.register(compress, {
  // Skip compression for SSE streams (they need to flush in real-time)
  encodings: ['gzip', 'deflate'],
})
await fastify.register(corsPlugin)
await fastify.register(rateLimitPlugin)
await fastify.register(prismaPlugin)
await fastify.register(jwtPlugin)

// Routes
await fastify.register(healthRoutes)
await fastify.register(authRoutes, { prefix: '/auth' })
await fastify.register(userRoutes, { prefix: '/users' })
await fastify.register(workspaceRoutes, { prefix: '/workspaces' })
await fastify.register(graphRoutes, { prefix: '/graphs' })
await fastify.register(solanaRoutes, { prefix: '/solana' })

// Graceful shutdown with timeout to prevent Railway deploy hangs
const SHUTDOWN_TIMEOUT_MS = 10_000
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
for (const signal of signals) {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down...`)
    const forceExit = setTimeout(() => {
      fastify.log.warn('Shutdown timeout reached, forcing exit')
      process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS)
    try {
      await fastify.close()
    } catch (err) {
      fastify.log.error(err, 'Error during shutdown')
    }
    clearTimeout(forceExit)
    process.exit(0)
  })
}

// Start
try {
  await fastify.listen({ port: config.PORT, host: '0.0.0.0' })
  fastify.log.info(`Animus server running on port ${config.PORT}`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
