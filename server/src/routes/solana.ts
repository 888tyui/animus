import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../middleware/authenticate.js'
import { getBalance, getTokenAccounts, getRecentTransactions, getNFTs } from '../services/solana.service.js'

const addressParam = z.object({
  address: z.string().min(32).max(44),
})

export default async function solanaRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  // Verify user can only query their own wallet
  function assertOwnWallet(paramAddress: string, userWallet: string) {
    if (paramAddress !== userWallet) {
      throw { statusCode: 403, message: 'You can only query your own wallet address' }
    }
  }

  // GET /solana/balance/:address
  fastify.get('/balance/:address', async (request, reply) => {
    const params = addressParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid Solana address' })
    }

    assertOwnWallet(params.data.address, request.user.walletAddress)

    try {
      const result = await getBalance(params.data.address)
      return result
    } catch (err: any) {
      if (err.statusCode === 403) return reply.status(403).send({ error: err.message })
      const message = err instanceof Error ? err.message : 'Failed to fetch balance'
      return reply.status(502).send({ error: message })
    }
  })

  // GET /solana/tokens/:address
  fastify.get('/tokens/:address', async (request, reply) => {
    const params = addressParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid Solana address' })
    }

    assertOwnWallet(params.data.address, request.user.walletAddress)

    try {
      const tokens = await getTokenAccounts(params.data.address)
      return { tokens }
    } catch (err: any) {
      if (err.statusCode === 403) return reply.status(403).send({ error: err.message })
      const message = err instanceof Error ? err.message : 'Failed to fetch tokens'
      return reply.status(502).send({ error: message })
    }
  })

  // GET /solana/transactions/:address
  fastify.get('/transactions/:address', async (request, reply) => {
    const params = addressParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid Solana address' })
    }

    assertOwnWallet(params.data.address, request.user.walletAddress)

    try {
      const transactions = await getRecentTransactions(params.data.address)
      return { transactions }
    } catch (err: any) {
      if (err.statusCode === 403) return reply.status(403).send({ error: err.message })
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions'
      return reply.status(502).send({ error: message })
    }
  })

  // GET /solana/nfts/:address
  fastify.get('/nfts/:address', async (request, reply) => {
    const params = addressParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid Solana address' })
    }

    assertOwnWallet(params.data.address, request.user.walletAddress)

    try {
      const nfts = await getNFTs(params.data.address)
      return { nfts }
    } catch (err: any) {
      if (err.statusCode === 403) return reply.status(403).send({ error: err.message })
      const message = err instanceof Error ? err.message : 'Failed to fetch NFTs'
      return reply.status(502).send({ error: message })
    }
  })
}
