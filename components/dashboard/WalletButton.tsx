'use client'

import { type FC, useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet, LogOut, ChevronDown, Shield } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import { useAnimusStore } from '@/lib/store'
import styles from './WalletButton.module.css'

const WalletButton: FC = () => {
  const { publicKey, wallet, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const isAuthenticated = useAnimusStore((s) => s.isAuthenticated)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  if (!connected || !publicKey) {
    return (
      <button className={styles.walletBtn} onClick={() => setVisible(true)}>
        <Wallet size={15} />
        <span>Connect Wallet</span>
      </button>
    )
  }

  const address = publicKey.toBase58()

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={`${styles.walletBtn} ${styles.connected}`}
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <span className={styles.connectedDot} />
        <Wallet size={15} />
        <span>{truncateAddress(address)}</span>
        <ChevronDown size={12} className={styles.chevron} />
      </button>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownInfo}>
            <span className={styles.dropdownLabel}>Connected with</span>
            <span className={styles.dropdownWallet}>{wallet?.adapter.name}</span>
          </div>
          {isAuthenticated && (
            <div className={styles.dropdownInfo}>
              <Shield size={12} />
              <span className={styles.dropdownLabel}>Authenticated</span>
            </div>
          )}
          <div className={styles.dropdownDivider} />
          <button
            className={styles.dropdownItem}
            onClick={() => {
              disconnect()
              setDropdownOpen(false)
            }}
          >
            <LogOut size={14} />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletButton
