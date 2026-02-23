import type { StateCreator } from 'zustand'
import type { AnimusStore } from '@/lib/store'

export interface WalletSlice {
  walletAddress: string | null
  walletName: string | null
  authToken: string | null
  isAuthenticated: boolean
  setWalletInfo: (address: string | null, name: string | null) => void
  setAuthState: (token: string | null, authenticated: boolean) => void
}

export const createWalletSlice: StateCreator<AnimusStore, [], [], WalletSlice> = (set) => ({
  walletAddress: null,
  walletName: null,
  authToken: null,
  isAuthenticated: false,
  setWalletInfo: (address, name) => set({ walletAddress: address, walletName: name }),
  setAuthState: (token, authenticated) => set({ authToken: token, isAuthenticated: authenticated }),
})
