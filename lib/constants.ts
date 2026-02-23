import type { FileTypeInfo } from '@/lib/types'

export const FILE_TYPES: Record<string, FileTypeInfo> = {
  tsx: { label: 'TypeScript React', color: '#00E89C', hdrColor: [0, 2.0, 1.2], category: 'component' },
  jsx: { label: 'JavaScript React', color: '#00E89C', hdrColor: [0, 2.0, 1.2], category: 'component' },
  ts: { label: 'TypeScript', color: '#0ABF80', hdrColor: [0.04, 1.6, 1.0], category: 'logic' },
  js: { label: 'JavaScript', color: '#0ABF80', hdrColor: [0.04, 1.6, 1.0], category: 'logic' },
  css: { label: 'CSS', color: '#FF5C87', hdrColor: [2.2, 0.5, 0.8], category: 'style' },
  scss: { label: 'SCSS', color: '#FF5C87', hdrColor: [2.2, 0.5, 0.8], category: 'style' },
  less: { label: 'Less', color: '#FF5C87', hdrColor: [2.2, 0.5, 0.8], category: 'style' },
  json: { label: 'JSON', color: '#FFB444', hdrColor: [2.2, 1.5, 0.4], category: 'config' },
  yaml: { label: 'YAML', color: '#FFB444', hdrColor: [2.2, 1.5, 0.4], category: 'config' },
  yml: { label: 'YAML', color: '#FFB444', hdrColor: [2.2, 1.5, 0.4], category: 'config' },
  toml: { label: 'TOML', color: '#FFB444', hdrColor: [2.2, 1.5, 0.4], category: 'config' },
  md: { label: 'Markdown', color: '#9171F8', hdrColor: [1.0, 0.6, 2.0], category: 'docs' },
  mdx: { label: 'MDX', color: '#9171F8', hdrColor: [1.0, 0.6, 2.0], category: 'docs' },
  py: { label: 'Python', color: '#3776AB', hdrColor: [0.4, 0.9, 1.8], category: 'logic' },
  rs: { label: 'Rust', color: '#CE422B', hdrColor: [2.0, 0.5, 0.3], category: 'logic' },
  go: { label: 'Go', color: '#00ADD8', hdrColor: [0, 1.5, 2.0], category: 'logic' },
  java: { label: 'Java', color: '#ED8B00', hdrColor: [2.0, 1.0, 0], category: 'logic' },
  rb: { label: 'Ruby', color: '#CC342D', hdrColor: [2.0, 0.3, 0.3], category: 'logic' },
  php: { label: 'PHP', color: '#777BB4', hdrColor: [1.0, 1.0, 1.8], category: 'logic' },
  swift: { label: 'Swift', color: '#F05138', hdrColor: [2.2, 0.4, 0.3], category: 'logic' },
  kt: { label: 'Kotlin', color: '#7F52FF', hdrColor: [1.0, 0.5, 2.2], category: 'logic' },
  vue: { label: 'Vue', color: '#42B883', hdrColor: [0.4, 1.8, 1.0], category: 'component' },
  svelte: { label: 'Svelte', color: '#FF3E00', hdrColor: [2.2, 0.3, 0], category: 'component' },
  html: { label: 'HTML', color: '#E34F26', hdrColor: [2.0, 0.4, 0.2], category: 'markup' },
  svg: { label: 'SVG', color: '#FFB13B', hdrColor: [2.2, 1.5, 0.3], category: 'asset' },
  sql: { label: 'SQL', color: '#336791', hdrColor: [0.4, 0.6, 1.5], category: 'data' },
  graphql: { label: 'GraphQL', color: '#E10098', hdrColor: [2.0, 0, 1.2], category: 'data' },
  prisma: { label: 'Prisma', color: '#2D3748', hdrColor: [0.4, 0.5, 0.6], category: 'data' },
  sh: { label: 'Shell', color: '#89E051', hdrColor: [1.0, 2.0, 0.5], category: 'script' },
  dockerfile: { label: 'Dockerfile', color: '#2496ED', hdrColor: [0.3, 1.2, 2.0], category: 'config' },
  env: { label: 'Environment', color: '#888888', hdrColor: [0.6, 0.6, 0.6], category: 'config' },
  mjs: { label: 'ES Module', color: '#0ABF80', hdrColor: [0.04, 1.6, 1.0], category: 'logic' },
  cjs: { label: 'CommonJS', color: '#0ABF80', hdrColor: [0.04, 1.6, 1.0], category: 'logic' },
  mts: { label: 'TS Module', color: '#0ABF80', hdrColor: [0.04, 1.6, 1.0], category: 'logic' },
  cts: { label: 'TS CommonJS', color: '#0ABF80', hdrColor: [0.04, 1.6, 1.0], category: 'logic' },
  txt: { label: 'Text', color: '#999999', hdrColor: [0.8, 0.8, 1.0], category: 'docs' },
  xml: { label: 'XML', color: '#FFB444', hdrColor: [2.2, 1.5, 0.4], category: 'config' },
  lock: { label: 'Lock File', color: '#888888', hdrColor: [0.6, 0.6, 0.6], category: 'config' },
  gitignore: { label: 'Gitignore', color: '#888888', hdrColor: [0.6, 0.6, 0.6], category: 'config' },
  editorconfig: { label: 'EditorConfig', color: '#888888', hdrColor: [0.6, 0.6, 0.6], category: 'config' },
  npmignore: { label: 'npmignore', color: '#888888', hdrColor: [0.6, 0.6, 0.6], category: 'config' },
}

export const DEFAULT_FILE_TYPE: FileTypeInfo = {
  label: 'File',
  color: '#7B8794',
  hdrColor: [0.6, 0.8, 1.2],
  category: 'other',
}

export const EXCLUDED_PATHS = [
  'node_modules/', '.git/', 'dist/', 'build/', '.next/',
  'vendor/', '__pycache__/', '.cache/', '.vscode/', '.idea/',
  'coverage/', '.nyc_output/', '.turbo/', '.vercel/',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
]

// Brand colors first, then complementary palette colors
export const WORKSPACE_COLORS = [
  '#00E89C', // electric
  '#FF5C87', // pulse
  '#FFB444', // cyan/amber
  '#9171F8', // violet
  '#00ADD8', '#F05138', '#42B883', '#ED8B00',
]

export const GITHUB_API_BASE = 'https://api.github.com'

export const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to Animus', description: 'Let\'s take a quick tour of how to visualize your codebase' },
  { id: 'wallet', title: 'Connect Wallet', description: 'Connect your Solana wallet to save your graphs across sessions' },
  { id: 'create', title: 'Create Your First Graph', description: 'Paste any public GitHub repository URL to generate a 3D visualization' },
  { id: 'explore', title: 'Explore the Graph', description: 'Orbit, zoom, and click any node to inspect file details' },
  { id: 'heatmap', title: 'Heatmap & Controls', description: 'Toggle the heatmap to see complexity hotspots' },
  { id: 'complete', title: 'You\'re All Set!', description: 'Start by importing your first GitHub repository' },
]
