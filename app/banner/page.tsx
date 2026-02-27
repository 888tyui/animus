import Image from 'next/image'
import styles from './page.module.css'

/* ═══════════════════════════════════════════
   Constellation Nodes — decorative neural dots
   ═══════════════════════════════════════════ */

const NODES = [
  // Right-side cluster (behind code window)
  { x: 920, y: 80, size: 5, color: '#00E89C' },
  { x: 1060, y: 120, size: 4, color: '#9171F8' },
  { x: 1180, y: 60, size: 3, color: '#FFB444' },
  { x: 1320, y: 140, size: 4, color: '#00E89C' },
  { x: 1400, y: 70, size: 3, color: '#FF5C87' },
  { x: 980, y: 200, size: 3, color: '#FFB444' },
  { x: 1140, y: 260, size: 5, color: '#FF5C87' },
  { x: 1280, y: 300, size: 3, color: '#9171F8' },
  { x: 1420, y: 240, size: 4, color: '#00E89C' },
  { x: 1050, y: 380, size: 3, color: '#9171F8' },
  { x: 1200, y: 420, size: 4, color: '#FFB444' },
  { x: 1350, y: 380, size: 3, color: '#00E89C' },
  { x: 1450, y: 430, size: 3, color: '#FF5C87' },
  // Scattered accents
  { x: 750, y: 50, size: 2, color: '#9171F8' },
  { x: 820, y: 440, size: 2, color: '#FFB444' },
  { x: 680, y: 160, size: 2, color: '#00E89C' },
  { x: 1460, y: 160, size: 2, color: '#9171F8' },
]

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 4], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [1, 6], [2, 7], [3, 8],
  [6, 9], [9, 10], [10, 11], [11, 12],
  [7, 10], [8, 11],
  [13, 0], [14, 9], [15, 5],
]

/* ═══════════════════════════════════════════
   Banner Page
   ═══════════════════════════════════════════ */

export default function BannerPage() {
  return (
    <div className={styles.page}>
      <p className={styles.hint}>
        1500 &times; 500 &mdash; Right-click the banner and save as image, or screenshot with <kbd>F12</kbd> DevTools
      </p>

      <div className={styles.frame}>
        <div className={styles.banner}>
          {/* Ambient glows */}
          <div className={styles.orbA} />
          <div className={styles.orbB} />
          <div className={styles.orbC} />

          {/* Grid pattern */}
          <div className={styles.grid} />

          {/* Neural constellation */}
          <div className={styles.constellation}>
            <svg className={styles.edgeSvg}>
              {EDGES.map(([a, b], i) => (
                <line
                  key={i}
                  x1={NODES[a].x}
                  y1={NODES[a].y}
                  x2={NODES[b].x}
                  y2={NODES[b].y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                />
              ))}
            </svg>
            {NODES.map((node, i) => (
              <div key={i}>
                <div
                  className={styles.node}
                  style={{
                    left: node.x - node.size / 2,
                    top: node.y - node.size / 2,
                    width: node.size,
                    height: node.size,
                    background: node.color,
                    boxShadow: `0 0 ${node.size * 2}px ${node.color}`,
                  }}
                />
                <div
                  className={styles.nodeGlow}
                  style={{
                    left: node.x - node.size * 3,
                    top: node.y - node.size * 3,
                    width: node.size * 6,
                    height: node.size * 6,
                    background: node.color,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Left: Branding */}
            <div className={styles.branding}>
              <div className={styles.logoRow}>
                <Image
                  src="/mascot.png"
                  alt="Animus"
                  width={72}
                  height={72}
                  className={styles.mascot}
                  priority
                />
                <span className={styles.logoText}>animus</span>
              </div>

              <p className={styles.tagline}>
                See the{' '}
                <span className={styles.taglineAccent}>soul</span> of your code.
                <br />
                Transform repositories into living 3D neural networks.
              </p>

              <div className={styles.pills}>
                <span className={styles.pill}>
                  <span className={styles.pillDot} style={{ background: '#00E89C' }} />
                  3D Visualization
                </span>
                <span className={styles.pill}>
                  <span className={styles.pillDot} style={{ background: '#9171F8' }} />
                  Dependency Analysis
                </span>
                <span className={styles.pill}>
                  <span className={styles.pillDot} style={{ background: '#FFB444' }} />
                  GitHub Integration
                </span>
              </div>
            </div>

            {/* Right: Code Window */}
            <div className={styles.visual}>
              <div className={styles.codeWindow}>
                <div className={styles.codeWindowBar}>
                  <span className={styles.codeWindowDot} style={{ background: '#FF5C87' }} />
                  <span className={styles.codeWindowDot} style={{ background: '#FFB444' }} />
                  <span className={styles.codeWindowDot} style={{ background: '#00E89C' }} />
                  <span className={styles.codeWindowTitle}>graph.transform.ts</span>
                </div>
                <div className={styles.codeBody}>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>1</span>
                    <span className={styles.codeComment}>{'// Transform repository into neural graph'}</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>2</span>
                    <span className={styles.codeKeyword}>{'export '}</span>
                    <span className={styles.codeKeyword}>{'function '}</span>
                    <span className={styles.codeFunc}>{'buildGraph'}</span>
                    <span className={styles.codeBracket}>{'('}</span>
                    <span className={styles.codeProp}>{'repo'}</span>
                    <span className={styles.codePlain}>{': '}</span>
                    <span className={styles.codeType}>{'Repository'}</span>
                    <span className={styles.codeBracket}>{')'}</span>
                    <span className={styles.codePlain}>{' {'}</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>3</span>
                    <span className={styles.codePlain}>{'  '}</span>
                    <span className={styles.codeKeyword}>{'const '}</span>
                    <span className={styles.codePlain}>{'nodes = '}</span>
                    <span className={styles.codeProp}>{'repo'}</span>
                    <span className={styles.codePlain}>{'.'}</span>
                    <span className={styles.codeFunc}>{'files'}</span>
                    <span className={styles.codePlain}>{'.'}</span>
                    <span className={styles.codeFunc}>{'map'}</span>
                    <span className={styles.codeBracket}>{'('}</span>
                    <span className={styles.codeFunc}>{'toNeuron'}</span>
                    <span className={styles.codeBracket}>{')'}</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>4</span>
                    <span className={styles.codePlain}>{'  '}</span>
                    <span className={styles.codeKeyword}>{'const '}</span>
                    <span className={styles.codePlain}>{'edges = '}</span>
                    <span className={styles.codeFunc}>{'resolveImports'}</span>
                    <span className={styles.codeBracket}>{'('}</span>
                    <span className={styles.codePlain}>{'nodes'}</span>
                    <span className={styles.codeBracket}>{')'}</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>5</span>
                    <span className={styles.codePlain} />
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>6</span>
                    <span className={styles.codePlain}>{'  '}</span>
                    <span className={styles.codeKeyword}>{'return '}</span>
                    <span className={styles.codeBracket}>{'{ '}</span>
                    <span className={styles.codePlain}>{'nodes, edges, '}</span>
                    <span className={styles.codeProp}>{'layout'}</span>
                    <span className={styles.codePlain}>{': '}</span>
                    <span className={styles.codeString}>{`'spiral'`}</span>
                    <span className={styles.codeBracket}>{' }'}</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeLineNum}>7</span>
                    <span className={styles.codePlain}>{'}'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className={styles.floatingBadge}>
            <span className={styles.floatingBadgeDot} />
            <span className={styles.floatingBadgeText}>animus.dev</span>
          </div>

          {/* Vignette */}
          <div className={styles.vignette} />

          {/* Noise grain */}
          <svg className={styles.grain} width="100%" height="100%">
            <filter id="banner-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#banner-grain)" />
          </svg>
        </div>
      </div>
    </div>
  )
}
