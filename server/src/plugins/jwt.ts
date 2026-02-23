import { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface JwtPayload {
  userId: string
  walletAddress: string
}

declare module 'fastify' {
  interface FastifyInstance {
    signJwt: (payload: JwtPayload) => string
    verifyJwt: (token: string) => JwtPayload
  }
}

async function jwtPlugin(fastify: FastifyInstance) {
  fastify.decorate('signJwt', (payload: JwtPayload): string => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' })
  })

  fastify.decorate('verifyJwt', (token: string): JwtPayload => {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload
  })
}

export default fp(jwtPlugin, { name: 'jwt' })
