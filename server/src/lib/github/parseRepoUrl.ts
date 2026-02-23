export interface ParsedRepo {
  owner: string
  repo: string
}

export function parseRepoUrl(input: string): ParsedRepo {
  if (!input || typeof input !== 'string') {
    throw new Error('Repository URL is required')
  }

  let cleaned = input.trim()
  cleaned = cleaned.replace(/\/+$/, '')
  cleaned = cleaned.replace(/[?#].*$/, '')
  cleaned = cleaned.replace(/\.git$/, '')

  const urlPattern = /^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)\/?$/i
  const urlMatch = cleaned.match(urlPattern)

  if (urlMatch) {
    return validateAndReturn(urlMatch[1], urlMatch[2])
  }

  const shorthandPattern = /^([^/]+)\/([^/]+)$/
  const shorthandMatch = cleaned.match(shorthandPattern)

  if (shorthandMatch) {
    const owner = shorthandMatch[1]
    const repo = shorthandMatch[2]

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

  const validNamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/
  if (!validNamePattern.test(owner)) {
    throw new Error(`Invalid GitHub owner: "${owner}".`)
  }
  if (!validNamePattern.test(repo)) {
    throw new Error(`Invalid GitHub repository name: "${repo}".`)
  }

  return { owner, repo }
}
