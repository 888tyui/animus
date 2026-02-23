'use client'

import { use } from 'react'
import GraphViewer from '@/components/graph/GraphViewer'

export default function GraphPage({ params }: { params: Promise<{ graphId: string }> }) {
  const { graphId } = use(params)
  return <GraphViewer graphId={graphId} />
}
