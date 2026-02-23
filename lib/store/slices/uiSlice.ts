import type { StateCreator } from 'zustand'
import type { AnimusStore } from '@/lib/store'

export type SortMode = 'recent' | 'name' | 'health' | 'files'
export type ViewMode = 'grid' | 'list'

export interface UISlice {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  newGraphModalOpen: boolean
  newWorkspaceModalOpen: boolean
  deleteConfirmTarget: { type: 'graph' | 'workspace'; id: string; name: string } | null
  moveToWorkspaceTarget: { graphId: string; graphName: string } | null
  onboardingComplete: boolean
  onboardingStep: number
  searchQuery: string
  sortMode: SortMode
  viewMode: ViewMode
  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
  openNewGraphModal: () => void
  closeNewGraphModal: () => void
  openNewWorkspaceModal: () => void
  closeNewWorkspaceModal: () => void
  setDeleteConfirmTarget: (target: UISlice['deleteConfirmTarget']) => void
  setMoveToWorkspaceTarget: (target: UISlice['moveToWorkspaceTarget']) => void
  completeOnboarding: () => void
  setOnboardingStep: (step: number) => void
  setSearchQuery: (query: string) => void
  setSortMode: (mode: SortMode) => void
  setViewMode: (mode: ViewMode) => void
}

export const createUISlice: StateCreator<AnimusStore, [], [], UISlice> = (set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  newGraphModalOpen: false,
  newWorkspaceModalOpen: false,
  deleteConfirmTarget: null,
  moveToWorkspaceTarget: null,
  onboardingComplete: false,
  onboardingStep: 0,
  searchQuery: '',
  sortMode: 'recent',
  viewMode: 'grid',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
  openNewGraphModal: () => set({ newGraphModalOpen: true }),
  closeNewGraphModal: () => set({ newGraphModalOpen: false }),
  openNewWorkspaceModal: () => set({ newWorkspaceModalOpen: true }),
  closeNewWorkspaceModal: () => set({ newWorkspaceModalOpen: false }),
  setDeleteConfirmTarget: (target) => set({ deleteConfirmTarget: target }),
  setMoveToWorkspaceTarget: (target) => set({ moveToWorkspaceTarget: target }),
  completeOnboarding: () => set({ onboardingComplete: true, onboardingStep: 0 }),
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setViewMode: (mode) => set({ viewMode: mode }),
})
