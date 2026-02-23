'use client'

import SolanaWalletProvider from '@/components/providers/SolanaWalletProvider'
import StoreProvider from '@/components/providers/StoreProvider'
import AuthProvider from '@/components/providers/AuthProvider'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SolanaWalletProvider>
      <StoreProvider>
        <AuthProvider>
          <DashboardShell>{children}</DashboardShell>
        </AuthProvider>
      </StoreProvider>
    </SolanaWalletProvider>
  )
}
