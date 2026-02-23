'use client'

import { useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { api, setAuthToken, getAuthToken } from '@/lib/api/client'
import { useAnimusStore } from '@/lib/store'
import bs58 from 'bs58'

interface AuthUser {
  id: string
  walletAddress: string
  walletName: string | null
  onboardingComplete: boolean
  settings: unknown
}

interface VerifyResponse {
  token: string
  user: AuthUser
}

export function useAuth() {
  const { publicKey, signMessage, wallet, connected } = useWallet()
  const setAuthState = useAnimusStore((s) => s.setAuthState)
  const setWalletInfo = useAnimusStore((s) => s.setWalletInfo)

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or does not support message signing')
    }

    const walletAddress = publicKey.toBase58()

    // Step 1: Get challenge
    const { challenge } = await api.get<{ challenge: string }>(
      `/auth/challenge?walletAddress=${encodeURIComponent(walletAddress)}`
    )

    // Step 2: Sign challenge — may throw if user rejects
    let signatureBytes: Uint8Array
    try {
      const messageBytes = new TextEncoder().encode(challenge)
      signatureBytes = await signMessage(messageBytes)
    } catch (err) {
      throw new Error('Wallet signature rejected. Please approve the sign request to continue.')
    }

    const signature = bs58.encode(signatureBytes)

    // Step 3: Verify and get JWT
    const result = await api.post<VerifyResponse>('/auth/verify', {
      walletAddress,
      signature,
      challenge,
      walletName: wallet?.adapter.name,
    })

    // Step 4: Store token and update state
    setAuthToken(result.token)
    setAuthState(result.token, true)
    setWalletInfo(walletAddress, wallet?.adapter.name || null)

    return result.user
  }, [publicKey, signMessage, wallet, setAuthState, setWalletInfo])

  const signOut = useCallback(() => {
    setAuthToken(null)
    setAuthState(null, false)
  }, [setAuthState])

  const restoreSession = useCallback(async (): Promise<AuthUser | null> => {
    const token = getAuthToken()
    if (!token) return null

    try {
      const user = await api.get<AuthUser>('/auth/me')
      setAuthState(token, true)
      return user
    } catch {
      setAuthToken(null)
      setAuthState(null, false)
      return null
    }
  }, [setAuthState])

  return {
    signIn,
    signOut,
    restoreSession,
    isConnected: connected,
  }
}
