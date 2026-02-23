const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

let authToken: string | null = null
let isClearing401 = false

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    try { localStorage.setItem('animus-token', token) } catch {}
  } else {
    try { localStorage.removeItem('animus-token') } catch {}
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken
  try {
    authToken = localStorage.getItem('animus-token')
  } catch {}
  return authToken
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

function handle401() {
  // Prevent recursive 401 clearing
  if (isClearing401) return
  isClearing401 = true
  setAuthToken(null)
  setTimeout(() => { isClearing401 = false }, 1000)
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    handle401()
    throw new Error('Unauthorized')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || `HTTP ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

const REQUEST_TIMEOUT_MS = 30_000

export const api = {
  get: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    return handleResponse<T>(response)
  },

  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    return handleResponse<T>(response)
  },

  patch: async <T>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    return handleResponse<T>(response)
  },

  delete: async (path: string): Promise<void> => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    return handleResponse<void>(response)
  },

  parseGraphSSE: (
    repoUrl: string,
    workspaceId: string | undefined,
    callbacks: {
      onProgress: (data: { stage: string; progress: number; detail: string }) => void
      onComplete: (data: { graph: any }) => void
      onError: (data: { message: string }) => void
    }
  ): (() => void) => {
    const controller = new AbortController()

    fetch(`${API_URL}/graphs/parse`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ repoUrl, workspaceId }),
      signal: controller.signal,
    }).then(async (response) => {
      if (response.status === 401) {
        handle401()
        callbacks.onError({ message: 'Session expired. Please reconnect your wallet.' })
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: 'Request failed' }))
        callbacks.onError({ message: body.error || `HTTP ${response.status}` })
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        callbacks.onError({ message: 'No response body' })
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          let currentEvent = ''
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const parsed = JSON.parse(data)
                if (currentEvent === 'progress') {
                  callbacks.onProgress(parsed)
                } else if (currentEvent === 'complete') {
                  callbacks.onComplete(parsed)
                } else if (currentEvent === 'error') {
                  callbacks.onError(parsed)
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError({ message: err instanceof Error ? err.message : 'Connection failed' })
      }
    })

    return () => controller.abort()
  },
}
