'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Github,
  Twitter,
  ArrowRight,
  ChevronRight,
  Rocket,
  BookOpen,
  Keyboard,
  Cpu,
  Layers,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Flame,
  Eye,
  FolderTree,
  GitFork,
  FileText,
  Activity,
  Box,
  Network,
  Palette,
  Database,
  Globe,
  Copy,
  Check,
  Search,
  Command,
  ArrowUp,
  Monitor,
  Smartphone,
} from 'lucide-react'
import styles from './DocsPage.module.css'

/* ═══════════════════════════════════════════
   Section Data
   ═══════════════════════════════════════════ */

const NAV_SECTIONS = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'usage', label: 'Usage Guide', icon: BookOpen },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'technology', label: 'Technology', icon: Cpu },
  { id: 'architecture', label: 'Architecture', icon: Layers },
]

const GETTING_STARTED_STEPS = [
  {
    number: '01',
    title: 'Sign In & Access',
    description: 'Connect your GitHub account and head to the dashboard. Click "Launch App" from the homepage, or navigate directly to /dashboard.',
    accent: '#00E89C',
  },
  {
    number: '02',
    title: 'Import a Repository',
    description: 'Click "New Graph" and paste any GitHub repository URL — public or private. Animus fetches the file tree, resolves dependencies, and builds a complete graph automatically.',
    accent: '#FFB444',
  },
  {
    number: '03',
    title: 'Explore in 3D',
    description: 'Your codebase materializes as an interactive 3D neural network. Orbit, zoom, and click any node to inspect file details, dependency chains, and complexity metrics.',
    accent: '#FF5C87',
  },
  {
    number: '04',
    title: 'Organize & Manage',
    description: 'Group related graphs into color-coded workspaces. Rename, reorganize, and switch between grid and list views to manage your visualization library.',
    accent: '#9171F8',
  },
]

const SHORTCUTS: { keys: string[]; description: string; category: string }[] = [
  { keys: ['Click + Drag'], description: 'Orbit the camera around the graph', category: 'Navigation' },
  { keys: ['Scroll'], description: 'Zoom in and out', category: 'Navigation' },
  { keys: ['Click'], description: 'Select a node to open the inspection panel', category: 'Navigation' },
  { keys: ['Click', 'Empty'], description: 'Deselect the current node and close the panel', category: 'Navigation' },
  { keys: ['+'], description: 'Zoom in using the control panel', category: 'Controls' },
  { keys: ['-'], description: 'Zoom out using the control panel', category: 'Controls' },
  { keys: ['Fit'], description: 'Fit all visible nodes to the viewport', category: 'Controls' },
  { keys: ['F11'], description: 'Toggle fullscreen mode', category: 'Controls' },
  { keys: ['Esc'], description: 'Close open modals and panels', category: 'General' },
  { keys: ['Tab'], description: 'Navigate between interactive elements', category: 'General' },
]

const TECH_STACK: { name: string; description: string; icon: typeof Rocket; color: string }[] = [
  { name: 'Next.js 16', description: 'Server-side rendering with App Router and Turbopack for fast page loads and optimized production builds', icon: Globe, color: '#00E89C' },
  { name: 'React 19', description: 'Concurrent rendering, Server Components, and the latest hooks API for fluid, responsive interfaces', icon: Box, color: '#61DAFB' },
  { name: 'Three.js / R3F', description: 'Hardware-accelerated 3D rendering through React Three Fiber and Drei at a consistent 60fps', icon: Layers, color: '#FFB444' },
  { name: 'TypeScript', description: 'Full type safety from the API layer to UI components — fewer bugs, better developer experience', icon: FileText, color: '#3178C6' },
  { name: 'Zustand', description: 'Lightweight state management with built-in persistence — your graphs and settings are saved across sessions', icon: Database, color: '#9171F8' },
  { name: 'CSS Modules', description: 'Scoped styling with zero runtime overhead and a consistent design token system throughout', icon: Palette, color: '#FF5C87' },
]

const ARCHITECTURE_LAYERS = [
  {
    label: 'Presentation',
    sublabel: 'React Components + CSS Modules',
    items: ['Landing Page', 'Dashboard Shell', 'Graph Viewer', 'Modals & Overlays'],
    color: '#00E89C',
  },
  {
    label: 'State',
    sublabel: 'Zustand Store + Slices',
    items: ['UI Slice', 'Graph Slice', 'Workspace Slice', 'Wallet Slice'],
    color: '#FFB444',
  },
  {
    label: 'Data',
    sublabel: 'GitHub API + Transformers',
    items: ['Repo Fetcher', 'File Classifier', 'Metric Computation', 'Layout Engine'],
    color: '#FF5C87',
  },
  {
    label: '3D Engine',
    sublabel: 'Three.js + Post-Processing',
    items: ['InstancedMesh Nodes', 'LineSegments Edges', 'Bloom + Vignette', 'Camera Controller'],
    color: '#9171F8',
  },
]

/* ═══════════════════════════════════════════
   Copy Button Hook
   ═══════════════════════════════════════════ */

function useCopyCode() {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  return { copied, copy }
}

/* ═══════════════════════════════════════════
   Code Block Component
   ═══════════════════════════════════════════ */

function CodeBlock({ code, language, id }: { code: string; language: string; id: string }) {
  const { copied, copy } = useCopyCode()

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{language}</span>
        <button
          className={styles.copyBtn}
          onClick={() => copy(code, id)}
          aria-label="Copy code"
        >
          {copied === id ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied === id ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Interactive Feature Card
   ═══════════════════════════════════════════ */

function FeatureDemo({
  title,
  description,
  icon: Icon,
  accent,
  children,
}: {
  title: string
  description: string
  icon: typeof Rocket
  accent: string
  children?: React.ReactNode
}) {
  return (
    <div className={styles.featureDemo} style={{ '--accent': accent } as React.CSSProperties}>
      <div className={styles.featureDemoGlow} />
      <div className={styles.featureDemoIcon}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h4 className={styles.featureDemoTitle}>{title}</h4>
      <p className={styles.featureDemoDesc}>{description}</p>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main DocsPage Component
   ═══════════════════════════════════════════ */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [highlightedShortcut, setHighlightedShortcut] = useState<number | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const observerRef = useRef<IntersectionObserver | null>(null)
  const revealRefs = useRef<(HTMLElement | null)[]>([])

  // Scroll spy
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: [0.15, 0.5], rootMargin: '-80px 0px -40% 0px' }
    )

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  // Scroll-driven reveal animations
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed)
            revealObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    revealRefs.current.forEach((el) => {
      if (el) revealObserver.observe(el)
    })

    return () => revealObserver.disconnect()
  }, [])

  const addRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileNavOpen(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Top Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.logo}>
            <Image src="/mascot.png" alt="Animus" width={28} height={28} className={styles.logoMascot} />
            <span className={styles.logoText}>animus</span>
            <span className={styles.docsLabel}>docs</span>
          </Link>

          <div className={styles.topBarLinks}>
            <Link href="/" className={styles.topBarLink}>Home</Link>
            <Link href="/dashboard" className={styles.topBarLink}>Dashboard</Link>
            <a href="https://github.com/animus-viz" target="_blank" rel="noopener noreferrer" className={styles.topBarIconBtn} aria-label="GitHub">
              <Github size={16} />
            </a>
            <a href="https://x.com/animus_viz" target="_blank" rel="noopener noreferrer" className={styles.topBarIconBtn} aria-label="Twitter">
              <Twitter size={16} />
            </a>
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation"
          >
            <BookOpen size={18} />
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* ── Side Navigation ── */}
        <nav className={`${styles.sideNav} ${mobileNavOpen ? styles.sideNavOpen : ''}`}>
          <div className={styles.sideNavHeader}>
            <Search size={14} />
            <span>Navigation</span>
          </div>
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                <Icon size={15} />
                <span>{section.label}</span>
                {isActive && <div className={styles.navIndicator} />}
              </button>
            )
          })}
          <div className={styles.sideNavDivider} />
          <Link href="/dashboard" className={styles.navLaunch}>
            <Rocket size={14} />
            <span>Launch App</span>
            <ArrowRight size={13} />
          </Link>
        </nav>

        {/* Mobile nav backdrop */}
        {mobileNavOpen && (
          <div className={styles.mobileBackdrop} onClick={() => setMobileNavOpen(false)} />
        )}

        {/* ── Main Content ── */}
        <main className={styles.content}>
          {/* Hero Header */}
          <div className={styles.docsHero}>
            <div className={styles.docsHeroGlow} />
            <div className={styles.docsHeroBadge}>
              <span className={styles.badgeDot} />
              <span>Documentation</span>
            </div>
            <h1 className={styles.docsHeroTitle}>
              Learn <span className={styles.docsHeroAccent}>Animus</span>
            </h1>
            <p className={styles.docsHeroDesc}>
              Transform any GitHub repository into an interactive 3D visualization.
              Explore file structures, analyze dependencies, and uncover complexity
              patterns — directly in your browser.
            </p>
            <div className={styles.docsHeroCards}>
              <button className={styles.quickCard} onClick={() => scrollToSection('getting-started')}>
                <Rocket size={18} />
                <span>Quick Start</span>
                <ChevronRight size={14} />
              </button>
              <button className={styles.quickCard} onClick={() => scrollToSection('shortcuts')}>
                <Keyboard size={18} />
                <span>Shortcuts</span>
                <ChevronRight size={14} />
              </button>
              <button className={styles.quickCard} onClick={() => scrollToSection('technology')}>
                <Cpu size={18} />
                <span>Tech Stack</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* ════════════════════════════════
             SECTION: Getting Started
             ════════════════════════════════ */}
          <section
            id="getting-started"
            ref={(el) => { sectionRefs.current['getting-started'] = el }}
            className={styles.section}
          >
            <div ref={addRevealRef} className={styles.reveal}>
              <span className={styles.sectionLabel}>Getting Started</span>
              <h2 className={styles.sectionTitle}>
                Up and running in <span className={styles.accent}>4 steps</span>
              </h2>
              <p className={styles.sectionDesc}>
                No downloads or installations. Animus runs entirely in your browser — connect your account and go.
              </p>
            </div>

            <div className={styles.stepsTimeline}>
              {GETTING_STARTED_STEPS.map((step, i) => (
                <div
                  key={step.number}
                  ref={addRevealRef}
                  className={`${styles.reveal} ${styles.stepCard}`}
                  style={{ '--accent': step.accent, '--delay': `${i * 0.08}s` } as React.CSSProperties}
                >
                  <div className={styles.stepConnector}>
                    <div className={styles.stepDot} />
                    {i < GETTING_STARTED_STEPS.length - 1 && <div className={styles.stepLine} />}
                  </div>
                  <div className={styles.stepContent}>
                    <span className={styles.stepNumber}>{step.number}</span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div ref={addRevealRef} className={styles.reveal}>
              <CodeBlock
                id="import-url"
                language="Supported Repository URL Formats"
                code={`https://github.com/{owner}/{repo}

Examples:
  https://github.com/vercel/next.js
  https://github.com/facebook/react
  https://github.com/denoland/deno
  https://github.com/sindresorhus/ky`}
              />
            </div>
          </section>

          {/* ════════════════════════════════
             SECTION: Usage Guide
             ════════════════════════════════ */}
          <section
            id="usage"
            ref={(el) => { sectionRefs.current['usage'] = el }}
            className={styles.section}
          >
            <div ref={addRevealRef} className={styles.reveal}>
              <span className={styles.sectionLabel}>Usage Guide</span>
              <h2 className={styles.sectionTitle}>
                Mastering the <span className={styles.accent}>Graph Viewer</span>
              </h2>
              <p className={styles.sectionDesc}>
                The graph viewer is the core experience of Animus. Here&apos;s everything you can do with it.
              </p>
            </div>

            <div className={styles.featureGrid}>
              <div ref={addRevealRef} className={styles.reveal}>
                <FeatureDemo
                  title="3D Navigation"
                  description="Click and drag to orbit freely around your codebase. Scroll to zoom in and out. The camera uses smooth damping for fluid, cinematic navigation."
                  icon={MousePointer2}
                  accent="#00E89C"
                >
                  <div className={styles.miniDemo}>
                    <div className={styles.miniDemoOrbit}>
                      <div className={styles.orbitRing} />
                      <div className={styles.orbitDot} />
                      <div className={styles.orbitCenter} />
                    </div>
                  </div>
                </FeatureDemo>
              </div>

              <div ref={addRevealRef} className={styles.reveal}>
                <FeatureDemo
                  title="Node Inspection"
                  description="Click any node to open its detail panel — file name, path, extension, line count, dependency count, and a computed complexity score."
                  icon={Eye}
                  accent="#FFB444"
                >
                  <div className={styles.miniInspect}>
                    <div className={styles.inspectItem}>
                      <FileText size={12} />
                      <span>Button.tsx</span>
                      <span className={styles.inspectValue}>142 lines</span>
                    </div>
                    <div className={styles.inspectItem}>
                      <GitFork size={12} />
                      <span>Dependencies</span>
                      <span className={styles.inspectValue}>8</span>
                    </div>
                    <div className={styles.inspectItem}>
                      <Activity size={12} />
                      <span>Complexity</span>
                      <span className={styles.inspectValueGreen}>32/100</span>
                    </div>
                  </div>
                </FeatureDemo>
              </div>

              <div ref={addRevealRef} className={styles.reveal}>
                <FeatureDemo
                  title="Heatmap Mode"
                  description="Activate heatmap mode to visualize complexity across your entire codebase at a glance. Red indicates high complexity, yellow is moderate, and green means clean, maintainable code."
                  icon={Flame}
                  accent="#FF5C87"
                >
                  <div className={styles.heatmapDemo}>
                    <div className={styles.heatDot} style={{ '--hc': '#FF4D4D', '--hs': '12px' } as React.CSSProperties} />
                    <div className={styles.heatLabel}>High</div>
                    <div className={styles.heatDot} style={{ '--hc': '#FFB444', '--hs': '10px' } as React.CSSProperties} />
                    <div className={styles.heatLabel}>Medium</div>
                    <div className={styles.heatDot} style={{ '--hc': '#00E89C', '--hs': '10px' } as React.CSSProperties} />
                    <div className={styles.heatLabel}>Low</div>
                  </div>
                </FeatureDemo>
              </div>

              <div ref={addRevealRef} className={styles.reveal}>
                <FeatureDemo
                  title="Workspace Management"
                  description="Organize imported graphs into color-coded workspaces. Create, rename, and move graphs between workspaces. Switch between grid and list views to suit your workflow."
                  icon={FolderTree}
                  accent="#9171F8"
                >
                  <div className={styles.workspaceDemo}>
                    <div className={styles.wsItem}>
                      <span className={styles.wsDot} style={{ background: '#00E89C' }} />
                      <span>Frontend</span>
                    </div>
                    <div className={styles.wsItem}>
                      <span className={styles.wsDot} style={{ background: '#FF5C87' }} />
                      <span>Backend</span>
                    </div>
                    <div className={styles.wsItem}>
                      <span className={styles.wsDot} style={{ background: '#9171F8' }} />
                      <span>Libraries</span>
                    </div>
                  </div>
                </FeatureDemo>
              </div>
            </div>

            {/* Controls Reference */}
            <div ref={addRevealRef} className={`${styles.reveal} ${styles.controlsRef}`}>
              <h3 className={styles.subsectionTitle}>Graph Controls</h3>
              <p className={styles.subsectionDesc}>
                Use the control panel at the bottom-right of the graph viewer for quick camera and view operations.
              </p>
              <div className={styles.controlsGrid}>
                <div className={styles.controlItem}>
                  <div className={styles.controlIcon}><ZoomIn size={18} /></div>
                  <div>
                    <div className={styles.controlName}>Zoom In</div>
                    <div className={styles.controlDesc}>Moves the camera closer to the graph center</div>
                  </div>
                </div>
                <div className={styles.controlItem}>
                  <div className={styles.controlIcon}><ZoomOut size={18} /></div>
                  <div>
                    <div className={styles.controlName}>Zoom Out</div>
                    <div className={styles.controlDesc}>Moves the camera further from the graph center</div>
                  </div>
                </div>
                <div className={styles.controlItem}>
                  <div className={styles.controlIcon}><Maximize2 size={18} /></div>
                  <div>
                    <div className={styles.controlName}>Fit to View</div>
                    <div className={styles.controlDesc}>Automatically repositions the camera to frame all visible nodes</div>
                  </div>
                </div>
                <div className={styles.controlItem}>
                  <div className={styles.controlIcon}><RotateCcw size={18} /></div>
                  <div>
                    <div className={styles.controlName}>Reset</div>
                    <div className={styles.controlDesc}>Clears the current selection and resets all view modes</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════
             SECTION: Keyboard Shortcuts
             ════════════════════════════════ */}
          <section
            id="shortcuts"
            ref={(el) => { sectionRefs.current['shortcuts'] = el }}
            className={styles.section}
          >
            <div ref={addRevealRef} className={styles.reveal}>
              <span className={styles.sectionLabel}>Keyboard Shortcuts</span>
              <h2 className={styles.sectionTitle}>
                Navigate with <span className={styles.accent}>precision</span>
              </h2>
              <p className={styles.sectionDesc}>
                All mouse and keyboard controls for navigating the 3D graph viewer and dashboard interface.
              </p>
            </div>

            <div ref={addRevealRef} className={styles.reveal}>
              <div className={styles.shortcutsTable}>
                {['Navigation', 'Controls', 'General'].map((cat) => (
                  <div key={cat} className={styles.shortcutCategory}>
                    <h4 className={styles.shortcutCatTitle}>{cat}</h4>
                    {SHORTCUTS.filter((s) => s.category === cat).map((shortcut, i) => {
                      const globalIdx = SHORTCUTS.findIndex(
                        (s) => s === shortcut
                      )
                      return (
                        <div
                          key={i}
                          className={`${styles.shortcutRow} ${highlightedShortcut === globalIdx ? styles.shortcutHighlight : ''}`}
                          onMouseEnter={() => setHighlightedShortcut(globalIdx)}
                          onMouseLeave={() => setHighlightedShortcut(null)}
                        >
                          <div className={styles.shortcutKeys}>
                            {shortcut.keys.map((key, ki) => (
                              <kbd key={ki} className={styles.kbd}>{key}</kbd>
                            ))}
                          </div>
                          <span className={styles.shortcutDesc}>
                            {shortcut.description}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════
             SECTION: Technology
             ════════════════════════════════ */}
          <section
            id="technology"
            ref={(el) => { sectionRefs.current['technology'] = el }}
            className={styles.section}
          >
            <div ref={addRevealRef} className={styles.reveal}>
              <span className={styles.sectionLabel}>Technology</span>
              <h2 className={styles.sectionTitle}>
                Built with <span className={styles.accent}>modern tools</span>
              </h2>
              <p className={styles.sectionDesc}>
                Built on a modern web stack optimized for real-time 3D rendering and responsive interactions.
              </p>
            </div>

            <div className={styles.techGrid}>
              {TECH_STACK.map((tech, i) => {
                const Icon = tech.icon
                return (
                  <div
                    key={tech.name}
                    ref={addRevealRef}
                    className={`${styles.reveal} ${styles.techCard}`}
                    style={{ '--accent': tech.color, '--delay': `${i * 0.06}s` } as React.CSSProperties}
                  >
                    <div className={styles.techCardGlow} />
                    <div className={styles.techIcon}>
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <h4 className={styles.techName}>{tech.name}</h4>
                    <p className={styles.techDesc}>{tech.description}</p>
                  </div>
                )
              })}
            </div>

            {/* How the graph is built */}
            <div ref={addRevealRef} className={`${styles.reveal} ${styles.pipelineSection}`}>
              <h3 className={styles.subsectionTitle}>Graph Pipeline</h3>
              <p className={styles.subsectionDesc}>
                Every repository import goes through a 4-stage pipeline that transforms raw file data into an interactive 3D visualization.
              </p>
              <div className={styles.pipeline}>
                <div className={styles.pipelineStep}>
                  <div className={styles.pipelineIcon} style={{ '--accent': '#00E89C' } as React.CSSProperties}>
                    <Github size={18} />
                  </div>
                  <span className={styles.pipelineLabel}>Fetch</span>
                  <span className={styles.pipelineSub}>Retrieves file tree via GitHub API</span>
                </div>
                <div className={styles.pipelineArrow}><ChevronRight size={16} /></div>
                <div className={styles.pipelineStep}>
                  <div className={styles.pipelineIcon} style={{ '--accent': '#FFB444' } as React.CSSProperties}>
                    <FolderTree size={18} />
                  </div>
                  <span className={styles.pipelineLabel}>Classify</span>
                  <span className={styles.pipelineSub}>Categorizes files by type and role</span>
                </div>
                <div className={styles.pipelineArrow}><ChevronRight size={16} /></div>
                <div className={styles.pipelineStep}>
                  <div className={styles.pipelineIcon} style={{ '--accent': '#FF5C87' } as React.CSSProperties}>
                    <Network size={18} />
                  </div>
                  <span className={styles.pipelineLabel}>Compute</span>
                  <span className={styles.pipelineSub}>Resolves imports and computes metrics</span>
                </div>
                <div className={styles.pipelineArrow}><ChevronRight size={16} /></div>
                <div className={styles.pipelineStep}>
                  <div className={styles.pipelineIcon} style={{ '--accent': '#9171F8' } as React.CSSProperties}>
                    <Box size={18} />
                  </div>
                  <span className={styles.pipelineLabel}>Layout</span>
                  <span className={styles.pipelineSub}>Positions nodes in 3D space via golden-angle spiral</span>
                </div>
              </div>
            </div>

            <div ref={addRevealRef} className={styles.reveal}>
              <CodeBlock
                id="layout-algo"
                language="Layout Algorithm (Golden-Angle Spiral)"
                code={`// Cluster centers use a golden-angle spiral in XZ plane
const goldenAngle = 2.4  // ~137.5 degrees
const theta = clusterIndex * goldenAngle
const radius = 4 + Math.sqrt(totalClusters) * 2.2

// Each node is placed on a Fibonacci sphere
// around its cluster center
const phi = Math.acos(1 - (2 * (i + 0.5)) / groupSize)
const theta = Math.PI * (1 + Math.sqrt(5)) * i

// Result: evenly distributed nodes with
// natural cluster separation`}
              />
            </div>
          </section>

          {/* ════════════════════════════════
             SECTION: Architecture
             ════════════════════════════════ */}
          <section
            id="architecture"
            ref={(el) => { sectionRefs.current['architecture'] = el }}
            className={styles.section}
          >
            <div ref={addRevealRef} className={styles.reveal}>
              <span className={styles.sectionLabel}>Architecture</span>
              <h2 className={styles.sectionTitle}>
                Four-layer <span className={styles.accent}>system design</span>
              </h2>
              <p className={styles.sectionDesc}>
                A clean separation of concerns across four layers ensures each part of the system can evolve independently.
              </p>
            </div>

            <div className={styles.archDiagram}>
              {ARCHITECTURE_LAYERS.map((layer, i) => (
                <div
                  key={layer.label}
                  ref={addRevealRef}
                  className={`${styles.reveal} ${styles.archLayer}`}
                  style={{ '--accent': layer.color, '--delay': `${i * 0.1}s` } as React.CSSProperties}
                >
                  <div className={styles.archLayerHeader}>
                    <span className={styles.archLayerLabel}>{layer.label}</span>
                    <span className={styles.archLayerSub}>{layer.sublabel}</span>
                  </div>
                  <div className={styles.archLayerItems}>
                    {layer.items.map((item) => (
                      <span key={item} className={styles.archItem}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* File structure */}
            <div ref={addRevealRef} className={styles.reveal}>
              <CodeBlock
                id="file-tree"
                language="Project Structure"
                code={`animus/
  app/
    layout.tsx          # Root layout + fonts
    page.tsx            # Landing page
    dashboard/
      layout.tsx        # Dashboard shell
      page.tsx          # Graph list
      graph/[graphId]/  # 3D graph viewer
    docs/
      page.tsx          # This documentation
  components/
    landing/            # Hero, Features, HowItWorks
    dashboard/          # Sidebar, TopBar, GraphCard
    graph/              # GraphScene, Nodes, Edges, Controls
    ui/                 # Button, Modal, Spinner
    docs/               # Documentation components
  lib/
    store/              # Zustand slices
    github/             # API fetcher, classifier, metrics
    graph/              # Layout engine, transformer
    types/              # TypeScript interfaces
    constants.ts        # File types, colors, config`}
              />
            </div>
          </section>

          {/* ── Bottom CTA ── */}
          <div className={styles.bottomCta}>
            <div className={styles.bottomCtaGlow} />
            <h3 className={styles.bottomCtaTitle}>
              Ready to explore your code?
            </h3>
            <p className={styles.bottomCtaDesc}>
              Paste any GitHub repository URL and watch your codebase come alive as an interactive 3D neural network.
            </p>
            <Link href="/dashboard" className={styles.bottomCtaBtn}>
              <Rocket size={16} />
              <span>Launch Animus</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* ── Footer ── */}
          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <span className={styles.footerCopy}>&copy; {new Date().getFullYear()} Animus. All rights reserved.</span>
              <div className={styles.footerLinks}>
                <Link href="/">Home</Link>
                <Link href="/dashboard">Dashboard</Link>
                <a href="https://github.com/animus-viz" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* ── Back to Top ── */}
      <BackToTop />
    </div>
  )
}

/* ═══════════════════════════════════════════
   Back to Top Button
   ═══════════════════════════════════════════ */

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  if (!visible) return null

  return (
    <button
      className={styles.backToTop}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <ArrowUp size={16} />
    </button>
  )
}
