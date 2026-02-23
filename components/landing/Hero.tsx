'use client'

import dynamic from 'next/dynamic'
import { Github, ArrowRight, ChevronDown } from 'lucide-react'
import styles from './Hero.module.css'

const NeuralScene = dynamic(
  () => import('@/components/three/NeuralScene'),
  {
    ssr: false,
    loading: () => <div className={styles.scenePlaceholder} />,
  }
)

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* 3D Neural Network Background */}
      <div className={styles.canvasWrapper}>
        <NeuralScene />
      </div>

      {/* Gradient overlays for depth */}
      <div className={styles.vignetteOverlay} />
      <div className={styles.topFade} />
      <div className={styles.bottomFade} />

      {/* Hero Content */}
      <div className={styles.content}>
        <div className={styles.badge} style={{ animationDelay: '0.3s' }}>
          <span className={styles.badgeDot} />
          <span>3D Codebase Visualization Platform</span>
        </div>

        <h1 className={styles.title} style={{ animationDelay: '0.5s' }}>
          See the soul
          <br />
          <span className={styles.titleAccent}>of your code</span>
        </h1>

        <p className={styles.description} style={{ animationDelay: '0.7s' }}>
          Animus transforms your codebase into a living 3D neural network.
          Files become neurons, imports become synapses, and activity becomes
          a heartbeat — revealing patterns invisible in flat code.
        </p>

        <div className={styles.buttons} style={{ animationDelay: '0.9s' }}>
          <a href="/dashboard" className={styles.btnPrimary}>
            <Github size={18} />
            <span>Connect GitHub</span>
            <ArrowRight size={16} className={styles.btnArrow} />
          </a>
          <a href="#demo" className={styles.btnSecondary}>
            <span>Explore Demo</span>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={styles.scrollIndicator} style={{ animationDelay: '1.2s' }}>
        <span className={styles.scrollText}>Scroll to explore</span>
        <div className={styles.scrollLine}>
          <ChevronDown size={14} className={styles.scrollChevron} />
        </div>
      </div>
    </section>
  )
}
