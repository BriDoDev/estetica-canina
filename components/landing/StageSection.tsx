'use client'

import type { ReactNode, CSSProperties } from 'react'
import { useStageSection } from './StageProvider'

interface StageSectionProps {
  n: 1 | 2 | 3 | 4
  id?: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function StageSection({ n, id, className, style, children }: StageSectionProps) {
  const ref = useStageSection(n)
  return (
    <section ref={ref} id={id} className={className} style={style} data-stage-section={n}>
      {children}
    </section>
  )
}
