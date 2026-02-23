'use client'

import { useEffect, useRef } from 'react'
import { Orbit, Layers, Activity, Wallet, FolderKanban } from 'lucide-react'
import styles from './Features.module.css'

const features = [
  {
    icon: Orbit,
    title: '3D Codebase Graph',
    description:
      'Navigate your entire codebase as an interactive force-directed 3D graph. Files are nodes, imports are edges — rendered in WebGL at 60fps with full orbit controls.',
    accent: '#00E89C',
  },
  {
    icon: Layers,
    title: 'Node Inspection',
    description:
      'Click any file node to inspect complexity scores, dependency chains, top contributors, and a mini commit timeline.',
    accent: '#FF5C87',
  },
  {
    icon: Activity,
    title: 'Health Heatmap',
    description:
      'Toggle a heatmap overlay — high coupling glows red, stale code fades grey, healthy modules shine green. A composite health score summarizes it all.',
    accent: '#FFB444',
  },
  {
    icon: Wallet,
    title: 'Solana Wallet Auth',
    description:
      'Sign in with your Phantom or Solflare wallet. No passwords, no emails — just a cryptographic signature. Your data lives on your terms.',
    accent: '#9171F8',
  },
  {
    icon: FolderKanban,
    title: 'Workspace Organization',
    description:
      'Group graphs into color-coded workspaces. Drag repositories between projects, rename on the fly, and keep your codebase library organized.',
    accent: '#FF5C87',
  },
]

export default function Features() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Features</span>
          <h2 className={styles.title}>
            What Animus{' '}
            <span className={styles.titleAccent}>reveals</span>
          </h2>
          <p className={styles.subtitle}>
            Five lenses into the invisible architecture of your codebase
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                ref={(el) => {
                  cardsRef.current[i] = el
                }}
                className={`${styles.card} ${styles[`card${i}`] || ''}`}
                style={
                  {
                    '--accent': feature.accent,
                    '--delay': `${i * 0.1}s`,
                  } as React.CSSProperties
                }
              >
                <div className={styles.cardGlow} />
                <div className={styles.cardIcon}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDesc}>{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
