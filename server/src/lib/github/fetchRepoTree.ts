import { GITHUB_API_BASE, EXCLUDED_PATHS } from '../constants.js'
import { config } from '../../config.js'
import type { GitHubTreeEntry } from '../../types/index.js'

export interface FetchResult {
  entries: GitHubTreeEntry[]
  repoName: string
  defaultBranch: string
  starCount: number
  language: string | null
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  onProgress?: (stage: string, detail: string) => void
): Promise<FetchResult> {
  onProgress?.('fetching', 'Loading repository metadata...')

  const repoUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const repoResponse = await fetchWithErrorHandling(repoUrl, owner, repo)
  const repoData = await repoResponse.json()

  const defaultBranch: string = repoData.default_branch
  const repoName: string = repoData.name
  const starCount: number = repoData.stargazers_count ?? 0
  const language: string | null = repoData.language ?? null

  onProgress?.('fetching', `Found repository "${repoName}" (${defaultBranch} branch)`)

  onProgress?.('fetching', 'Loading file tree...')

  const treeUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`
  const treeResponse = await fetchWithErrorHandling(treeUrl, owner, repo)
  const treeData = await treeResponse.json()

  if (!treeData.tree || !Array.isArray(treeData.tree)) {
    throw new Error('Unexpected response format from GitHub tree API.')
  }

  const rawEntries: GitHubTreeEntry[] = treeData.tree

  if (treeData.truncated) {
    onProgress?.('fetching', 'Warning: repository is very large, tree was truncated by GitHub.')
  }

  onProgress?.('parsing', 'Filtering file entries...')

  const entries = rawEntries.filter((entry) => {
    if (entry.type !== 'blob') return false
    return !isExcludedPath(entry.path)
  })

  onProgress?.('parsing', `Found ${entries.length} files (filtered from ${rawEntries.length} entries)`)

  return { entries, repoName, defaultBranch, starCount, language }
}

function isExcludedPath(filePath: string): boolean {
  return EXCLUDED_PATHS.some((excluded) => {
    if (excluded.endsWith('/')) {
      return filePath.startsWith(excluded) || filePath.includes('/' + excluded)
    }
    const fileName = filePath.split('/').pop() || ''
    return fileName === excluded || filePath === excluded
  })
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (config.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${config.GITHUB_TOKEN}`
  }
  return headers
}

async function fetchWithErrorHandling(
  url: string,
  owner: string,
  repo: string
): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, { headers: getAuthHeaders() })
  } catch {
    throw new Error('Network error while contacting GitHub.')
  }

  if (response.ok) return response

  switch (response.status) {
    case 404:
      throw new Error(`Repository "${owner}/${repo}" not found. Make sure the repository exists and is public.`)
    case 403: {
      const rateLimitReset = response.headers.get('X-RateLimit-Reset')
      let resetMessage = ''
      if (rateLimitReset) {
        const resetDate = new Date(Number(rateLimitReset) * 1000)
        const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 60000)
        resetMessage = ` Rate limit resets in ~${minutesUntilReset} minute(s).`
      }
      throw new Error(`GitHub API rate limit exceeded.${resetMessage}`)
    }
    case 500:
    case 502:
    case 503:
      throw new Error('GitHub is experiencing issues. Please try again in a few minutes.')
    default:
      throw new Error(`GitHub API returned an error (HTTP ${response.status}).`)
  }
}
