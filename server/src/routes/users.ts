import { type FastifyInstance } from 'fastify'
import type { Prisma } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'
import { updateUserBody } from '../types/index.js'

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  // PATCH /users/me
  fastify.patch('/me', async (request, reply) => {
    const result = updateUserBody.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.issues })
    }

    const data = result.data
    const updateData: Prisma.UserUpdateInput = {}
    if (data.walletName !== undefined) updateData.walletName = data.walletName
    if (data.onboardingComplete !== undefined) updateData.onboardingComplete = data.onboardingComplete
    if (data.settings !== undefined) updateData.settings = data.settings as Prisma.InputJsonValue

    const user = await fastify.prisma.user.update({
      where: { id: request.user.userId },
      data: updateData,
    })

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      walletName: user.walletName,
      onboardingComplete: user.onboardingComplete,
      settings: user.settings,
    }
  })
}
