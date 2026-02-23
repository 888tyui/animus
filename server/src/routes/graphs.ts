import { type FastifyInstance } from 'fastify'
import { authenticate } from '../middleware/authenticate.js'
import { uuidParam, parseGraphBody, updateGraphBody, type GraphSummaryDTO, type GraphFullDTO } from '../types/index.js'
import { parseAndSaveGraph } from '../services/github.service.js'

export default async function graphRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate)

  // POST /graphs/parse — SSE streaming endpoint (stricter rate limit: 5 per minute)
  fastify.post('/parse', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (request, reply) => {
    const result = parseGraphBody.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: result.error.issues })
    }

    const { repoUrl, workspaceId } = result.data

    // Validate workspaceId belongs to user if provided
    if (workspaceId) {
      const ws = await fastify.prisma.workspace.findFirst({
        where: { id: workspaceId, userId: request.user.userId },
      })
      if (!ws) {
        return reply.status(400).send({ error: 'Workspace not found' })
      }
    }

    // Set up SSE
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    const sendEvent = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    try {
      const graph = await parseAndSaveGraph(
        fastify,
        request.user.userId,
        repoUrl,
        workspaceId || null,
        (stage, progress, detail) => {
          sendEvent('progress', { stage, progress, detail })
        }
      )

      const dto: GraphFullDTO = {
        id: graph.id,
        name: graph.name,
        repoOwner: graph.repoOwner,
        repoName: graph.repoName,
        repoUrl: graph.repoUrl,
        workspaceId: graph.workspaceId,
        fileCount: graph.fileCount,
        edgeCount: graph.edgeCount,
        healthScore: graph.healthScore,
        createdAt: graph.createdAt.toISOString(),
        lastViewedAt: graph.lastViewedAt.toISOString(),
        nodes: graph.nodes as unknown[],
        edges: graph.edges as unknown[],
      }

      sendEvent('complete', { graph: dto })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      sendEvent('error', { message })
    }

    reply.raw.end()
  })

  // GET /graphs
  fastify.get('/', async (request) => {
    const graphs = await fastify.prisma.graph.findMany({
      where: { userId: request.user.userId },
      orderBy: { lastViewedAt: 'desc' },
      select: {
        id: true,
        name: true,
        repoOwner: true,
        repoName: true,
        repoUrl: true,
        workspaceId: true,
        fileCount: true,
        edgeCount: true,
        healthScore: true,
        createdAt: true,
        lastViewedAt: true,
      },
    })

    return graphs.map((g): GraphSummaryDTO => ({
      ...g,
      workspaceId: g.workspaceId,
      createdAt: g.createdAt.toISOString(),
      lastViewedAt: g.lastViewedAt.toISOString(),
    }))
  })

  // GET /graphs/:id — single query: update lastViewedAt and return in one call
  fastify.get('/:id', async (request, reply) => {
    const params = uuidParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid graph ID' })
    }

    // Verify ownership first (cheap query — no JSON columns loaded)
    const exists = await fastify.prisma.graph.findFirst({
      where: { id: params.data.id, userId: request.user.userId },
      select: { id: true },
    })

    if (!exists) {
      return reply.status(404).send({ error: 'Graph not found' })
    }

    // Update lastViewedAt and return full graph in one query
    const graph = await fastify.prisma.graph.update({
      where: { id: params.data.id },
      data: { lastViewedAt: new Date() },
    })

    const dto: GraphFullDTO = {
      id: graph.id,
      name: graph.name,
      repoOwner: graph.repoOwner,
      repoName: graph.repoName,
      repoUrl: graph.repoUrl,
      workspaceId: graph.workspaceId,
      fileCount: graph.fileCount,
      edgeCount: graph.edgeCount,
      healthScore: graph.healthScore,
      createdAt: graph.createdAt.toISOString(),
      lastViewedAt: graph.lastViewedAt.toISOString(),
      nodes: graph.nodes as unknown[],
      edges: graph.edges as unknown[],
    }

    return dto
  })

  // PATCH /graphs/:id
  fastify.patch('/:id', async (request, reply) => {
    const params = uuidParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid graph ID' })
    }

    const body = updateGraphBody.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request body', details: body.error.issues })
    }

    const graph = await fastify.prisma.graph.findFirst({
      where: { id: params.data.id, userId: request.user.userId },
    })
    if (!graph) {
      return reply.status(404).send({ error: 'Graph not found' })
    }

    // Validate workspaceId if provided
    if (body.data.workspaceId) {
      const ws = await fastify.prisma.workspace.findFirst({
        where: { id: body.data.workspaceId, userId: request.user.userId },
      })
      if (!ws) {
        return reply.status(400).send({ error: 'Workspace not found' })
      }
    }

    const updated = await fastify.prisma.graph.update({
      where: { id: params.data.id },
      data: {
        ...body.data,
        lastViewedAt: new Date(),
      },
    })

    return {
      id: updated.id,
      name: updated.name,
      repoOwner: updated.repoOwner,
      repoName: updated.repoName,
      repoUrl: updated.repoUrl,
      workspaceId: updated.workspaceId,
      fileCount: updated.fileCount,
      edgeCount: updated.edgeCount,
      healthScore: updated.healthScore,
      createdAt: updated.createdAt.toISOString(),
      lastViewedAt: updated.lastViewedAt.toISOString(),
    }
  })

  // DELETE /graphs/:id
  fastify.delete('/:id', async (request, reply) => {
    const params = uuidParam.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid graph ID' })
    }

    const graph = await fastify.prisma.graph.findFirst({
      where: { id: params.data.id, userId: request.user.userId },
    })
    if (!graph) {
      return reply.status(404).send({ error: 'Graph not found' })
    }

    await fastify.prisma.graph.delete({
      where: { id: params.data.id },
    })

    return reply.status(204).send()
  })
}
