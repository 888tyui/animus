import { type FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'
import { createWorkspaceBody, updateWorkspaceBody, uuidParam, type WorkspaceDTO } from '../types/index.js'

export default async function workspaceRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  // POST /workspaces
  fastify.post('/', async (request, reply) => {
    const result = createWorkspaceBody.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.issues })
    }

    const count = await fastify.prisma.workspace.count({
      where: { userId: request.user.userId },
    })

    if (count >= 20) {
      return reply.status(429).send({ error: 'Maximum of 20 workspaces reached. Delete some before creating new ones.' })
    }

    const ws = await fastify.prisma.workspace.create({
      data: {
        userId: request.user.userId,
        name: result.data.name,
        color: result.data.color || '#00E89C',
        sortOrder: count,
      },
    })

    const dto: WorkspaceDTO = {
      id: ws.id,
      name: ws.name,
      color: ws.color,
      sortOrder: ws.sortOrder,
      createdAt: ws.createdAt.toISOString(),
    }

    return reply.status(201).send(dto)
  })

  // GET /workspaces
  fastify.get('/', async (request) => {
    const workspaces = await fastify.prisma.workspace.findMany({
      where: { userId: request.user.userId },
      orderBy: { sortOrder: 'asc' },
    })

    return workspaces.map((ws): WorkspaceDTO => ({
      id: ws.id,
      name: ws.name,
      color: ws.color,
      sortOrder: ws.sortOrder,
      createdAt: ws.createdAt.toISOString(),
    }))
  })

  // PATCH /workspaces/:id
  fastify.patch('/:id', async (request, reply) => {
    const params = uuidParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid workspace ID' })
    }

    const body = updateWorkspaceBody.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: body.error.issues })
    }

    const ws = await fastify.prisma.workspace.findFirst({
      where: { id: params.data.id, userId: request.user.userId },
    })
    if (!ws) {
      return reply.status(404).send({ error: 'Workspace not found' })
    }

    const updated = await fastify.prisma.workspace.update({
      where: { id: params.data.id },
      data: body.data,
    })

    const dto: WorkspaceDTO = {
      id: updated.id,
      name: updated.name,
      color: updated.color,
      sortOrder: updated.sortOrder,
      createdAt: updated.createdAt.toISOString(),
    }

    return dto
  })

  // DELETE /workspaces/:id
  fastify.delete('/:id', async (request, reply) => {
    const params = uuidParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid workspace ID' })
    }

    const ws = await fastify.prisma.workspace.findFirst({
      where: { id: params.data.id, userId: request.user.userId },
    })
    if (!ws) {
      return reply.status(404).send({ error: 'Workspace not found' })
    }

    // Orphan graphs (set workspaceId to null) — userId filter prevents cross-user mutation
    await fastify.prisma.graph.updateMany({
      where: { workspaceId: params.data.id, userId: request.user.userId },
      data: { workspaceId: null },
    })

    await fastify.prisma.workspace.delete({
      where: { id: params.data.id },
    })

    return reply.status(204).send()
  })
}
