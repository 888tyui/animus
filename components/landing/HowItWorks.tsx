'use client'

import { useEffect, useRef } from 'react'
import { Github, Cpu, Compass } from 'lucide-react'
import styles from './HowItWorks.module.css'

const steps = [
  {
    number: '01',
    icon: Github,
    title: 'Connect',
    description:
      'Sign in with GitHub OAuth and select any repository from your account. Public or private — one click, instant access.',
    accent: '#00E89C',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Parse',
    description:
      'Animus maps your file tree, resolves import relationships, fetches commit history, and computes complexity metrics.',
    accent: '#FFB444',
  },
  {
    number: '03',
    icon: Compass,
    title: 'Explore',
    description:
      'Your codebase materializes as a living 3D neural network. Orbit, zoom, click nodes, toggle heatmaps, and scrub through time.',
    accent: '#FF5C87',
  },
]

export default function HowItWorks() {
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])
  const lineRef = useRef<HTMLDivElement>(null)

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
      { threshold: 0.2 }
    )

    if (lineRef.current) observer.observe(lineRef.current)
    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>How it Works</span>
          <h2 className={styles.title}>
            Three steps to{' '}
            <span className={styles.titleAccent}>clarity</span>
          </h2>
        </div>

        <div className={styles.stepsWrapper}>
          <div ref={lineRef} className={styles.connectingLine} />

          <div className={styles.steps}>
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    stepsRef.current[i] = el
                  }}
                  className={styles.step}
                  style={
                    {
                      '--accent': step.accent,
                      '--delay': `${i * 0.15}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div className={styles.stepIconWrapper}>
                    <div className={styles.stepIcon}>
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
