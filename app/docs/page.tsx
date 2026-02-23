import type { Metadata } from 'next'
import DocsPage from '@/components/docs/DocsPage'

export const metadata: Metadata = {
  title: 'Docs — Animus',
  description:
    'Complete guide to Animus — transform any GitHub repository into an interactive 3D neural network. Quick start, usage guide, keyboard shortcuts, and technical deep-dive.',
}

export default function Page() {
  return <DocsPage />
}
