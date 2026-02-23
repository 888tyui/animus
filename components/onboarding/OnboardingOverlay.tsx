'use client'

import { type FC, useCallback, useRef, useState } from 'react'
import { useAnimusStore } from '@/lib/store'
import { ONBOARDING_STEPS } from '@/lib/constants'
import {
  Zap,
  Wallet,
  GitBranch,
  Orbit,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import styles from './OnboardingOverlay.module.css'

/* ── Neural Network Illustration (Step 0) ── */
const NeuralNetworkIllustration: FC = () => {
  const dots = [
    { x: 15, y: 20 },
    { x: 40, y: 55 },
    { x: 65, y: 15 },
    { x: 75, y: 70 },
    { x: 90, y: 40 },
  ]

  const lines: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
    [2, 4],
    [3, 4],
  ]

  return (
    <div className={styles.neuralNetwork}>
      <svg className={styles.neuralLines} viewBox="0 0 200 140">
        {lines.map(([a, b], i) => (
          <line
            key={i}
            className={styles.neuralLine}
            x1={`${dots[a].x}%`}
            y1={`${dots[a].y}%`}
            x2={`${dots[b].x}%`}
            y2={`${dots[b].y}%`}
          />
        ))}
      </svg>
      {dots.map((_, i) => (
        <div key={i} className={styles.neuralDot} />
      ))}
    </div>
  )
}

/* ── Mini Graph Illustration (Step 3) ── */
const MiniGraphIllustration: FC = () => {
  const dots = [
    { x: 25, y: 20 },
    { x: 45, y: 50 },
    { x: 70, y: 30 },
    { x: 20, y: 65 },
    { x: 65, y: 70 },
    { x: 50, y: 10 },
  ]

  const lines: [number, number][] = [
    [0, 1],
    [0, 3],
    [1, 2],
    [1, 4],
    [2, 5],
    [3, 4],
    [2, 4],
  ]

  return (
    <div className={styles.miniGraph}>
      <svg className={styles.miniGraphLines} viewBox="0 0 200 120">
        {lines.map(([a, b], i) => (
          <line
            key={i}
            className={styles.miniGraphLine}
            x1={`${dots[a].x}%`}
            y1={`${dots[a].y}%`}
            x2={`${dots[b].x}%`}
            y2={`${dots[b].y}%`}
          />
        ))}
      </svg>
      {dots.map((_, i) => (
        <div key={i} className={styles.miniGraphDot} />
      ))}
    </div>
  )
}

/* ── Step Content Renderers ── */

const StepWelcome: FC = () => (
  <>
    <div className={styles.logo}>
      <Zap size={28} className={styles.logoIcon} />
      <span className={styles.logoText}>animus</span>
    </div>
    <h1 className={`${styles.title} ${styles.titleGradient}`}>
      Welcome to Animus
    </h1>
    <p className={styles.subtitle}>
      Let&apos;s take a quick tour of how to visualize your codebase as a living
      neural network
    </p>
    <NeuralNetworkIllustration />
  </>
)

const StepWallet: FC = () => (
  <>
    <div className={`${styles.stepIcon} ${styles.stepIconEmerald}`}>
      <Wallet size={32} />
    </div>
    <h2 className={styles.title}>Connect Your Wallet</h2>
    <p className={styles.subtitle}>
      Link your Solana wallet to save your graphs and access them across
      sessions. Your wallet is your identity — no account needed.
    </p>
    <div className={styles.mockup}>
      <div className={styles.walletMockup}>
        <div className={styles.walletState}>
          <div className={`${styles.walletPill} ${styles.walletDisconnected}`}>
            <Wallet size={14} />
            Connect Wallet
          </div>
          <span className={styles.walletLabel}>Disconnected</span>
        </div>
        <span className={styles.walletArrow}>&rarr;</span>
        <div className={styles.walletState}>
          <div className={`${styles.walletPill} ${styles.walletConnected}`}>
            <Check size={14} />
            7xKp...3mNq
          </div>
          <span className={styles.walletLabel}>Connected</span>
        </div>
      </div>
    </div>
  </>
)

const StepCreate: FC = () => (
  <>
    <div className={`${styles.stepIcon} ${styles.stepIconAmber}`}>
      <GitBranch size={32} />
    </div>
    <h2 className={styles.title}>Import a Repository</h2>
    <p className={styles.subtitle}>
      Paste any public GitHub repository URL to generate a 3D visualization of
      its codebase structure.
    </p>
    <div className={styles.mockup}>
      <div className={styles.urlMockup}>
        <GitBranch size={16} className={styles.urlMockupIcon} />
        <span>https://github.com/vercel/next.js</span>
      </div>
    </div>
  </>
)

const StepExplore: FC = () => (
  <>
    <div className={`${styles.stepIcon} ${styles.stepIconViolet}`}>
      <Orbit size={32} />
    </div>
    <h2 className={styles.title}>Navigate the Neural Network</h2>
    <p className={styles.subtitle}>
      Orbit around the 3D graph, zoom in to clusters, and click any node to
      inspect file details.
    </p>
    <MiniGraphIllustration />
    <div className={styles.controlsRow}>
      <div className={styles.controlItem}>
        <span className={styles.controlKey}>Left Drag</span>
        Orbit
      </div>
      <div className={styles.controlItem}>
        <span className={styles.controlKey}>Scroll</span>
        Zoom
      </div>
      <div className={styles.controlItem}>
        <span className={styles.controlKey}>Click</span>
        Select
      </div>
    </div>
  </>
)

const StepHeatmap: FC = () => (
  <>
    <div className={`${styles.stepIcon} ${styles.stepIconCoral}`}>
      <Thermometer size={32} />
    </div>
    <h2 className={styles.title}>Discover Complexity</h2>
    <p className={styles.subtitle}>
      Toggle the heatmap overlay to see complexity hotspots. Red means high
      complexity, green means healthy.
    </p>
    <div className={styles.heatmapBar}>
      <div className={styles.heatmapGradient} />
      <div className={styles.heatmapLabels}>
        <span>Healthy</span>
        <span>Moderate</span>
        <span>Complex</span>
      </div>
    </div>
  </>
)

const StepComplete: FC = () => (
  <>
    <div className={styles.celebration}>
      <div className={styles.celebrationRing} />
      <div className={styles.celebrationRing} />
      <div className={styles.celebrationRing} />
      <div className={styles.celebrationCheck}>
        <Check size={28} />
      </div>
    </div>
    <h2 className={`${styles.title} ${styles.titleGradient}`}>
      You&apos;re All Set!
    </h2>
    <p className={styles.subtitle}>
      Start by importing your first GitHub repository and watch it transform
      into a living neural network.
    </p>
  </>
)

const STEP_RENDERERS = [
  StepWelcome,
  StepWallet,
  StepCreate,
  StepExplore,
  StepHeatmap,
  StepComplete,
] as const

/* ── Main Overlay Component ── */

const OnboardingOverlay: FC = () => {
  const onboardingComplete = useAnimusStore((s) => s.onboardingComplete)
  const onboardingStep = useAnimusStore((s) => s.onboardingStep)
  const setOnboardingStep = useAnimusStore((s) => s.setOnboardingStep)
  const completeOnboarding = useAnimusStore((s) => s.completeOnboarding)

  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animKey, setAnimKey] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  const totalSteps = ONBOARDING_STEPS.length

  const goNext = useCallback(() => {
    if (onboardingStep < totalSteps - 1) {
      setDirection('forward')
      setAnimKey((k) => k + 1)
      setOnboardingStep(onboardingStep + 1)
    }
  }, [onboardingStep, totalSteps, setOnboardingStep])

  const goBack = useCallback(() => {
    if (onboardingStep > 0) {
      setDirection('backward')
      setAnimKey((k) => k + 1)
      setOnboardingStep(onboardingStep - 1)
    }
  }, [onboardingStep, setOnboardingStep])

  const handleSkip = useCallback(() => {
    completeOnboarding()
  }, [completeOnboarding])

  const handleComplete = useCallback(() => {
    completeOnboarding()
  }, [completeOnboarding])

  if (onboardingComplete) return null

  const StepRenderer = STEP_RENDERERS[onboardingStep]
  const isFirstStep = onboardingStep === 0
  const isLastStep = onboardingStep === totalSteps - 1

  return (
    <div className={styles.overlay} ref={overlayRef}>
      <div className={styles.stepContainer}>
        <div
          key={animKey}
          className={styles.stepContent}
          data-direction={direction}
        >
          <StepRenderer />

          {/* ── Step Buttons ── */}
          <div className={styles.buttonRow}>
            {isFirstStep ? (
              <>
                <button className={styles.primaryButton} onClick={goNext}>
                  <Sparkles size={16} />
                  Start Tour
                </button>
              </>
            ) : isLastStep ? (
              <button
                className={styles.primaryButton}
                onClick={handleComplete}
              >
                <Zap size={16} />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button className={styles.secondaryButton} onClick={goBack}>
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button className={styles.primaryButton} onClick={goNext}>
                  Next
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {isFirstStep && (
            <button className={styles.ghostButton} onClick={handleSkip}>
              Skip Tutorial
            </button>
          )}
        </div>
      </div>

      {/* ── Progress Indicator ── */}
      <div className={styles.progress}>
        <div className={styles.progressDots}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${
                i === onboardingStep
                  ? styles.progressDotActive
                  : i < onboardingStep
                    ? styles.progressDotCompleted
                    : ''
              }`}
            />
          ))}
        </div>
        <span className={styles.stepCounter}>
          Step {onboardingStep + 1} of {totalSteps}
        </span>
      </div>

      {/* ── Skip Button (always visible except last step) ── */}
      {!isLastStep && !isFirstStep && (
        <button className={styles.skipButton} onClick={handleSkip}>
          <X size={12} />
          Skip
        </button>
      )}
    </div>
  )
}

export default OnboardingOverlay
