import { type FastifyRequest, type FastifyReply } from 'fastify'
import type { JwtPayload } from '../plugins/jwt.js'

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = request.server.verifyJwt(token)
    request.user = payload
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}
