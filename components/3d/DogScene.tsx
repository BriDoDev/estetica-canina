'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SceneCanvas = dynamic(
  () => import('./SceneCanvas').then((m) => ({ default: m.SceneCanvas })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-slate-100" />,
  },
)

interface DogSceneProps {
  className?: string
}

export function DogScene({ className }: DogSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div ref={containerRef} className={className ?? 'h-[500px] w-full'}>
      <SceneCanvas scrollProgress={scrollProgress} />
    </div>
  )
}
