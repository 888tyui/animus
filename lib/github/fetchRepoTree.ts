import { GITHUB_API_BASE, EXCLUDED_PATHS } from '@/lib/constants'
import type { GitHubTreeEntry } from '@/lib/types'

export interface FetchResult {
  entries: GitHubTreeEntry[]
  repoName: string
  defaultBranch: string
  starCount: number
  language: string | null
}

/**
 * Fetch the complete file tree from a public GitHub repository
 * using the REST API (no authentication required for public repos).
 *
 * Steps:
 * 1. GET /repos/{owner}/{repo} to obtain repo metadata
 * 2. GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1 to get the full file tree
 * 3. Filter out non-blob entries and excluded paths
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  onProgress?: (stage: string, detail: string) => void
): Promise<FetchResult> {
  // Step 1: Fetch repository metadata
  onProgress?.('fetching', 'Loading repository metadata...')

  const repoUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const repoResponse = await fetchWithErrorHandling(repoUrl, owner, repo)
  const repoData = await repoResponse.json()

  const defaultBranch: string = repoData.default_branch
  const repoName: string = repoData.name
  const starCount: number = repoData.stargazers_count ?? 0
  const language: string | null = repoData.language ?? null

  onProgress?.('fetching', `Found repository "${repoName}" (${defaultBranch} branch)`)

  // Step 2: Fetch the full recursive tree
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

  // Step 3: Filter entries
  onProgress?.('parsing', 'Filtering file entries...')

  const entries = rawEntries.filter((entry) => {
    // Only keep blobs (files), not trees (directories)
    if (entry.type !== 'blob') return false

    // Exclude paths matching any excluded pattern
    return !isExcludedPath(entry.path)
  })

  onProgress?.('parsing', `Found ${entries.length} files (filtered from ${rawEntries.length} entries)`)

  return {
    entries,
    repoName,
    defaultBranch,
    starCount,
    language,
  }
}

/**
 * Check whether a file path matches any of the excluded path patterns.
 */
function isExcludedPath(filePath: string): boolean {
  return EXCLUDED_PATHS.some((excluded) => {
    // Directory-style exclusion (ends with /)
    if (excluded.endsWith('/')) {
      return filePath.startsWith(excluded) || filePath.includes('/' + excluded)
    }
    // Exact filename exclusion
    const fileName = filePath.split('/').pop() || ''
    return fileName === excluded || filePath === excluded
  })
}

/**
 * Fetch wrapper that converts common GitHub API errors into descriptive messages.
 */
async function fetchWithErrorHandling(
  url: string,
  owner: string,
  repo: string
): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })
  } catch (err) {
    throw new Error(
      `Network error while contacting GitHub. Please check your internet connection and try again.`
    )
  }

  if (response.ok) return response

  switch (response.status) {
    case 404:
      throw new Error(
        `Repository "${owner}/${repo}" not found. Make sure the repository exists and is public.`
      )
    case 403: {
      const rateLimitReset = response.headers.get('X-RateLimit-Reset')
      let resetMessage = ''
      if (rateLimitReset) {
        const resetDate = new Date(Number(rateLimitReset) * 1000)
        const minutesUntilReset = Math.ceil(
          (resetDate.getTime() - Date.now()) / 60000
        )
        resetMessage = ` Rate limit resets in ~${minutesUntilReset} minute(s).`
      }
      throw new Error(
        `GitHub API rate limit exceeded.${resetMessage} Try again later or use a smaller repository.`
      )
    }
    case 500:
    case 502:
    case 503:
      throw new Error(
        'GitHub is experiencing issues. Please try again in a few minutes.'
      )
    default:
      throw new Error(
        `GitHub API returned an error (HTTP ${response.status}). Please try again.`
      )
  }
}
