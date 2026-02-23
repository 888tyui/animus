/**
 * Parse a GitHub repository URL or shorthand into { owner, repo }.
 *
 * Accepted formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   http://github.com/owner/repo
 *   github.com/owner/repo
 *   owner/repo
 *
 * Trailing slashes, query params, and hash fragments are stripped.
 */

export interface ParsedRepo {
  owner: string
  repo: string
}

export function parseRepoUrl(input: string): ParsedRepo {
  if (!input || typeof input !== 'string') {
    throw new Error('Repository URL is required')
  }

  let cleaned = input.trim()

  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '')

  // Strip query params and hash fragments
  cleaned = cleaned.replace(/[?#].*$/, '')

  // Strip .git suffix
  cleaned = cleaned.replace(/\.git$/, '')

  // Try to extract owner/repo from full URL
  // Matches: https://github.com/owner/repo, http://github.com/owner/repo, github.com/owner/repo
  const urlPattern = /^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/?$/i
  const urlMatch = cleaned.match(urlPattern)

  if (urlMatch) {
    const owner = urlMatch[1]
    const repo = urlMatch[2]
    return validateAndReturn(owner, repo)
  }

  // Try shorthand: owner/repo (exactly two segments, no protocol)
  const shorthandPattern = /^([^/]+)\/([^/]+)$/
  const shorthandMatch = cleaned.match(shorthandPattern)

  if (shorthandMatch) {
    const owner = shorthandMatch[1]
    const repo = shorthandMatch[2]

    // Make sure it does not look like a protocol prefix or other URL
    if (owner.includes(':') || owner.includes('.')) {
      throw new Error(
        `Invalid repository format: "${input}". Expected "owner/repo" or a GitHub URL.`
      )
    }

    return validateAndReturn(owner, repo)
  }

  throw new Error(
    `Could not parse repository URL: "${input}". ` +
    'Accepted formats: "https://github.com/owner/repo", "github.com/owner/repo", or "owner/repo".'
  )
}

function validateAndReturn(owner: string, repo: string): ParsedRepo {
  if (!owner || !repo) {
    throw new Error('Both owner and repository name are required.')
  }

  // GitHub usernames: alphanumeric + hyphens, no consecutive hyphens, max 39 chars
  const validNamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/
  if (!validNamePattern.test(owner)) {
    throw new Error(
      `Invalid GitHub owner: "${owner}". Owner names must be alphanumeric with hyphens/dots/underscores.`
    )
  }
  if (!validNamePattern.test(repo)) {
    throw new Error(
      `Invalid GitHub repository name: "${repo}". Repo names must be alphanumeric with hyphens/dots/underscores.`
    )
  }

  return { owner, repo }
}
