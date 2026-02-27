'use client'

import Image from 'next/image'
import { Github, Twitter, Zap, ArrowRight } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* CTA Section */}
      <div className={styles.cta}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>
          Ready to see your codebase{' '}
          <span className={styles.ctaAccent}>come alive</span>?
        </h2>
        <p className={styles.ctaDesc}>
          Connect your GitHub repository and explore your code like never
          before. Free to get started.
        </p>
        <div className={styles.ctaButtons}>
          <a href="/dashboard" className={styles.ctaPrimary}>
            <Github size={18} />
            <span>Connect GitHub</span>
            <ArrowRight size={16} />
          </a>
          <a
            href="https://github.com/animus-viz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
          >
            <span>View Source</span>
          </a>
        </div>
      </div>

      {/* Footer Bar */}
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.barLeft}>
            <a href="/" className={styles.footerLogo}>
              <Image src="/mascot.png" alt="Animus" width={24} height={24} className={styles.logoMascot} />
              <span className={styles.logoText}>animus</span>
            </a>
            <span className={styles.copyright}>
              &copy; {new Date().getFullYear()} Animus. All rights reserved.
            </span>
          </div>

          <div className={styles.barRight}>
            <a href="#features" className={styles.footerLink}>
              Features
            </a>
            <a href="#how-it-works" className={styles.footerLink}>
              How it Works
            </a>
            <a href="#demo" className={styles.footerLink}>
              Demo
            </a>
            <a href="/docs" className={styles.footerLink}>
              Docs
            </a>
            <div className={styles.divider} />
            <a
              href="https://x.com/animus_systems"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://github.com/animus-viz"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
