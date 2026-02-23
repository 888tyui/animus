'use client'

import { type FC, useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Github, Check, X, AlertCircle } from 'lucide-react'
import { useAnimusStore } from '@/lib/store'
import { toast } from '@/lib/store/toastStore'
import { parseRepoUrl, type ParsedRepo } from '@/lib/github/parseRepoUrl'
import { fetchRepoTree } from '@/lib/github/fetchRepoTree'
import { transformRepoToGraph } from '@/lib/graph/graphTransformer'
import { api, getAuthToken } from '@/lib/api/client'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import styles from './NewGraphModal.module.css'

const NewGraphModal: FC = () => {
  const router = useRouter()

  const isOpen = useAnimusStore((s) => s.newGraphModalOpen)
  const closeModal = useAnimusStore((s) => s.closeNewGraphModal)
  const workspaces = useAnimusStore((s) => s.workspaces)
  const addGraph = useAnimusStore((s) => s.addGraph)
  const setParsingState = useAnimusStore((s) => s.setParsingState)

  const [url, setUrl] = useState('')
  const [workspaceId, setWorkspaceId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  // Cleanup SSE on unmount — also clear parsing state in case abort doesn't trigger onError
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current()
        abortRef.current = null
        // Ensure parsing overlay is dismissed if SSE was in flight
        useAnimusStore.getState().setParsingState({
          isActive: false, repoUrl: '', progress: 0, stage: null,
        })
      }
    }
  }, [])

  const parsed = useMemo<ParsedRepo | null>(() => {
    if (!url.trim()) return null
    try {
      return parseRepoUrl(url.trim())
    } catch {
      return null
    }
  }, [url])

  const isValid = parsed !== null
  const showValidation = url.trim().length > 0

  const handleClose = useCallback(() => {
    setUrl('')
    setWorkspaceId('')
    setError(null)
    // Do NOT reset isSubmitting here — the async flow manages it.
    // This prevents re-submission during SSE processing.
    closeModal()
  }, [closeModal])

  // Separate reset for when the modal re-opens after an error
  const resetSubmitting = useCallback(() => {
    setIsSubmitting(false)
  }, [])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!parsed || isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    const { owner, repo } = parsed
    const repoUrl = url.trim()
    const selectedWorkspaceId = workspaceId

    handleClose()

    setParsingState({
      isActive: true,
      repoUrl,
      progress: 0,
      stage: 'fetching',
    })

    const isAuthenticated = !!getAuthToken()

    try {
      if (isAuthenticated) {
        await new Promise<void>((resolve, reject) => {
          const abort = api.parseGraphSSE(
            repoUrl,
            selectedWorkspaceId || undefined,
            {
              onProgress: (data) => {
                const stage = data.stage as 'fetching' | 'parsing' | 'computing' | 'layouting' | 'done'
                setParsingState({ stage, progress: data.progress })
              },
              onComplete: (data) => {
                abortRef.current = null
                const serverGraph = data.graph
                const graph = {
                  id: serverGraph.id,
                  name: serverGraph.name,
                  repoOwner: serverGraph.repoOwner,
                  repoName: serverGraph.repoName,
                  repoUrl: serverGraph.repoUrl,
                  workspaceId: serverGraph.workspaceId || '',
                  nodes: serverGraph.nodes,
                  edges: serverGraph.edges,
                  fileCount: serverGraph.fileCount,
                  edgeCount: serverGraph.edgeCount,
                  healthScore: serverGraph.healthScore,
                  createdAt: new Date(serverGraph.createdAt).getTime(),
                  lastViewedAt: new Date(serverGraph.lastViewedAt).getTime(),
                }

                addGraph(graph)
                setParsingState({ stage: 'done', progress: 100 })

                setTimeout(() => {
                  setParsingState({ isActive: false, repoUrl: '', progress: 0, stage: null })
                  resetSubmitting()
                  router.push(`/dashboard/graph/${graph.id}`)
                }, 800)

                resolve()
              },
              onError: (data) => {
                abortRef.current = null
                reject(new Error(data.message))
              },
            }
          )

          // Store abort so it can be called on cleanup/cancel
          abortRef.current = abort
        })
      } else {
        const result = await fetchRepoTree(owner, repo, (stage, _detail) => {
          if (stage === 'fetching') {
            setParsingState({ stage: 'fetching', progress: 15 })
          } else if (stage === 'parsing') {
            setParsingState({ stage: 'parsing', progress: 35 })
          }
        })

        setParsingState({ stage: 'computing', progress: 50 })

        const graph = transformRepoToGraph(
          result.entries,
          owner,
          repo,
          repoUrl,
          selectedWorkspaceId,
          (stage, progress) => {
            const mappedStage =
              stage === 'parsing'
                ? 'parsing'
                : stage === 'computing'
                  ? 'computing'
                  : stage === 'layouting'
                    ? 'layouting'
                    : stage === 'done'
                      ? 'done'
                      : 'computing'

            setParsingState({
              stage: mappedStage as 'fetching' | 'parsing' | 'computing' | 'layouting' | 'done',
              progress: 50 + (progress / 100) * 50,
            })
          }
        )

        addGraph(graph)
        setParsingState({ stage: 'done', progress: 100 })

        setTimeout(() => {
          setParsingState({ isActive: false, repoUrl: '', progress: 0, stage: null })
          resetSubmitting()
          router.push(`/dashboard/graph/${graph.id}`)
        }, 800)
      }
    } catch (err) {
      setParsingState({ isActive: false, repoUrl: '', progress: 0, stage: null })
      useAnimusStore.getState().openNewGraphModal()
      setUrl(repoUrl)

      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      setError(message)
      toast.error(message)
      resetSubmitting()
    }
  }, [parsed, isSubmitting, url, workspaceId, handleClose, setParsingState, addGraph, router, resetSubmitting])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth={520} ariaLabel="Import Repository">
      <div className={styles.titleRow}>
        <div className={styles.titleIcon}>
          <GitBranch size={18} />
        </div>
        <h2 className={styles.titleText}>Import Repository</h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <Input
            label="GitHub Repository URL"
            icon={<Github size={16} />}
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            error={showValidation && !isValid ? 'Enter a valid GitHub repository URL' : undefined}
          />
          {showValidation && (
            <div className={styles.validationIcon}>
              {isValid ? (
                <Check size={16} className={styles.validIcon} />
              ) : (
                <X size={16} className={styles.invalidIcon} />
              )}
            </div>
          )}
        </div>

        {parsed && (
          <div className={styles.inferredInfo}>
            <div className={styles.inferredItem}>
              <span className={styles.inferredLabel}>Owner</span>
              <span className={styles.inferredValue}>{parsed.owner}</span>
            </div>
            <div className={styles.inferredItem}>
              <span className={styles.inferredLabel}>Repository</span>
              <span className={styles.inferredValue}>{parsed.repo}</span>
            </div>
          </div>
        )}

        <div className={styles.selectWrapper}>
          <label className={styles.selectLabel}>Workspace</label>
          <select
            className={styles.select}
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            <option value="">No workspace</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className={styles.errorBadge}>
            <span className={styles.errorIcon}>
              <AlertCircle size={16} />
            </span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Importing...' : 'Import Graph'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default NewGraphModal
