'use client'

import { useStage } from './StageProvider'

const STAGE_VARS = ['--color-stage-1', '--color-stage-2', '--color-stage-3', '--color-stage-4']

export function Header() {
  const stage = useStage()
  const stageVar = STAGE_VARS[stage - 1]
  const headerStyle = {
    background: `color-mix(in oklch, var(${stageVar}) 88%, transparent)`,
    backdropFilter: 'blur(14px) saturate(120%)',
    WebkitBackdropFilter: 'blur(14px) saturate(120%)',
    transition: 'background-color 0.5s ease',
  } as React.CSSProperties

  return (
    <header className="sticky top-0 z-50 py-3.5" style={headerStyle}>
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-5">
        <a href="#" className="flex items-center gap-2.5 no-underline text-ink">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-white font-display"
            style={{ background: 'var(--color-brand-deep)', fontWeight: 600, fontSize: 15 }}
          >
            P
          </span>
          <span className="font-display text-[20px] leading-none" style={{ fontWeight: 500 }}>
            Paws &amp; Glow
            <span className="mt-1 block font-sans text-[10px] uppercase tracking-[0.18em] text-ink-2 leading-none font-semibold">
              Estética Canina
            </span>
          </span>
        </a>

        <nav className="hidden gap-7 md:flex">
          <a href="#servicios" className="text-sm font-medium text-ink no-underline hover:text-accent">
            Servicios
          </a>
          <a
            href="#testimonios"
            className="text-sm font-medium text-ink no-underline hover:text-accent"
          >
            Testimonios
          </a>
          <a href="#agenda" className="text-sm font-medium text-ink no-underline hover:text-accent">
            Agenda
          </a>
        </nav>

        <a href="#agenda" className="btn btn--sm btn--accent">
          Reservar
        </a>
      </div>
    </header>
  )
}
