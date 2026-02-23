import { type FastifyInstance } from 'fastify'
import { parseRepoUrl } from '../lib/github/parseRepoUrl.js'
import { fetchRepoTree } from '../lib/github/fetchRepoTree.js'
import { transformRepoToGraph } from '../lib/graph/graphTransformer.js'

const MAX_FILES = 10_000
const PARSE_TIMEOUT_MS = 120_000 // 2 minutes

// Track concurrent parses per user
const activeParsesPerUser = new Map<string, number>()
const MAX_CONCURRENT_PARSES = 2

type ProgressCallback = (stage: string, progress: number, detail: string) => void

export async function parseAndSaveGraph(
  fastify: FastifyInstance,
  userId: string,
  repoUrl: string,
  workspaceId: string | null,
  onProgress: ProgressCallback
) {
  // Enforce concurrent parse limit
  const current = activeParsesPerUser.get(userId) || 0
  if (current >= MAX_CONCURRENT_PARSES) {
    throw new Error('Too many concurrent parse requests. Please wait for existing imports to finish.')
  }
  activeParsesPerUser.set(userId, current + 1)

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Parse operation timed out (2 minute limit).')), PARSE_TIMEOUT_MS)
  })

  try {
    return await Promise.race([timeout, doParse(fastify, userId, repoUrl, workspaceId, onProgress)])
  } finally {
    const remaining = (activeParsesPerUser.get(userId) || 1) - 1
    if (remaining <= 0) {
      activeParsesPerUser.delete(userId)
    } else {
      activeParsesPerUser.set(userId, remaining)
    }
  }
}

async function doParse(
  fastify: FastifyInstance,
  userId: string,
  repoUrl: string,
  workspaceId: string | null,
  onProgress: ProgressCallback
) {
  const { owner, repo } = parseRepoUrl(repoUrl)

  onProgress('fetching', 5, `Parsing repository ${owner}/${repo}...`)

  const result = await fetchRepoTree(owner, repo, (stage, detail) => {
    if (stage === 'fetching') {
      onProgress('fetching', 15, detail)
    } else if (stage === 'parsing') {
      onProgress('parsing', 30, detail)
    }
  })

  // Enforce file count limit
  if (result.entries.length > MAX_FILES) {
    throw new Error(
      `Repository has ${result.entries.length} files, exceeding the ${MAX_FILES} file limit. ` +
      'Try a smaller repository or a specific branch.'
    )
  }

  onProgress('computing', 40, `Processing ${result.entries.length} files...`)

  const transformed = transformRepoToGraph(result.entries, (stage, progress) => {
    const mappedProgress = 40 + (progress / 100) * 50
    onProgress(stage, Math.round(mappedProgress), `${stage}...`)
  })

  onProgress('saving', 92, 'Saving to database...')

  // Check user's existing graph count
  const graphCount = await fastify.prisma.graph.count({ where: { userId } })
  if (graphCount >= 50) {
    throw new Error('You have reached the maximum of 50 graphs. Please delete some before importing new ones.')
  }

  const graph = await fastify.prisma.graph.create({
    data: {
      userId,
      workspaceId,
      name: `${owner}/${repo}`,
      repoOwner: owner,
      repoName: result.repoName,
      repoUrl,
      nodes: transformed.nodes as any,
      edges: transformed.edges as any,
      fileCount: transformed.fileCount,
      edgeCount: transformed.edgeCount,
      healthScore: transformed.healthScore,
    },
  })

  onProgress('done', 100, 'Complete!')

  return graph
}
