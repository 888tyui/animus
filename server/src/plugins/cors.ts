import { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'
import { config } from '../config.js'

async function corsPlugin(fastify: FastifyInstance) {
  // Support comma-separated origins for multi-domain (e.g. "https://app.example.com,http://localhost:3000")
  const origins = config.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)

  await fastify.register(fastifyCors, {
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight for 24h
  })
}

export default fp(corsPlugin, { name: 'cors' })
