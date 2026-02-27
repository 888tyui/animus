'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Github, Twitter, Zap, Menu, X } from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
    >
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <Image
            src="/mascot.png"
            alt="Animus"
            width={32}
            height={32}
            className={styles.logoMascot}
            priority
          />
          <span className={styles.logoText}>animus</span>
        </a>

        {/* Desktop Navigation */}
        <div className={styles.links}>
          <a href="#features" className={styles.link}>
            Features
          </a>
          <a href="#how-it-works" className={styles.link}>
            How it Works
          </a>
          <a href="#demo" className={styles.link}>
            Demo
          </a>
          <a href="/docs" className={styles.link}>
            Docs
          </a>
        </div>

        {/* Right Actions */}
        <div className={styles.actions}>
          <a
            href="https://x.com/animus_systems"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            aria-label="Twitter"
          >
            <Twitter size={16} />
          </a>
          <a
            href="https://github.com/animus-viz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconBtn}
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
          <div className={styles.actionDivider} />
          <a href="/dashboard" className={styles.launchBtn}>
            <span>Launch App</span>
            <Zap size={13} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <a
            href="#features"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            How it Works
          </a>
          <a
            href="#demo"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            Demo
          </a>
          <a
            href="/docs"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            Docs
          </a>
          <div className={styles.mobileSocials}>
            <a
              href="https://x.com/animus_systems"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconBtn}
            >
              <Twitter size={17} />
            </a>
            <a
              href="https://github.com/animus-viz"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconBtn}
            >
              <Github size={17} />
            </a>
          </div>
          <a href="/dashboard" className={styles.launchBtn}>
            <span>Launch App</span>
            <Zap size={14} />
          </a>
        </div>
      )}
    </nav>
  )
}
