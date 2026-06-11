'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type Stage = 1 | 2 | 3 | 4

interface StageContextValue {
  stage: Stage
  register: (n: Stage, el: HTMLElement) => () => void
}

const StageContext = createContext<StageContextValue | null>(null)

export function StageProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>(1)
  const ratiosRef = useRef<Map<Stage, number>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementsRef = useRef<Map<HTMLElement, Stage>>(new Map())

  const ensureObserver = useCallback(() => {
    if (observerRef.current) return observerRef.current
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = elementsRef.current.get(entry.target as HTMLElement)
          if (!n) continue
          ratiosRef.current.set(n, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let best: Stage = 1
        let bestRatio = -1
        for (const [n, r] of ratiosRef.current.entries()) {
          if (r > bestRatio) {
            bestRatio = r
            best = n
          }
        }
        if (bestRatio > 0) {
          setStage((prev) => (prev === best ? prev : best))
        }
      },
      { threshold: [0.15, 0.35, 0.55, 0.75] },
    )
    return observerRef.current
  }, [])

  const register = useCallback(
    (n: Stage, el: HTMLElement) => {
      const obs = ensureObserver()
      elementsRef.current.set(el, n)
      ratiosRef.current.set(n, 0)
      obs.observe(el)
      return () => {
        obs.unobserve(el)
        elementsRef.current.delete(el)
      }
    },
    [ensureObserver],
  )

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [])

  const value = useMemo<StageContextValue>(() => ({ stage, register }), [stage, register])

  return <StageContext.Provider value={value}>{children}</StageContext.Provider>
}

export function useStage(): Stage {
  const ctx = useContext(StageContext)
  return ctx?.stage ?? 1
}

export function useStageSection(n: Stage) {
  const ctx = useContext(StageContext)
  const ref = useRef<HTMLElement | null>(null)

  const setRef = useCallback(
    (el: HTMLElement | null) => {
      if (ref.current && ctx) {
        const unreg = (ref.current as HTMLElement & { __stageUnreg?: () => void }).__stageUnreg
        unreg?.()
      }
      ref.current = el
      if (el && ctx) {
        const unreg = ctx.register(n, el)
        ;(el as HTMLElement & { __stageUnreg?: () => void }).__stageUnreg = unreg
      }
    },
    [ctx, n],
  )

  useEffect(() => {
    return () => {
      if (ref.current) {
        const unreg = (ref.current as HTMLElement & { __stageUnreg?: () => void }).__stageUnreg
        unreg?.()
      }
    }
  }, [])

  return setRef
}
