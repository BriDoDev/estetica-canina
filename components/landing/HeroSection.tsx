'use client'

import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { useStageSection } from './StageProvider'
import { StageTag } from './StageTag'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

function renderTitle(title: string) {
  const parts = title.split(/\*([^*]+)\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} style={{ color: 'var(--color-bone)', fontStyle: 'normal' }}>
        {part}
      </em>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export function HeroSection({
  title = 'Tu mejor amigo, en su *mejor versión*.',
  subtitle = 'Estética canina con IA: sube una foto y descubre el corte ideal para la raza, edad y pelaje de tu perro. Reservas en 4 pasos.',
  ctaPrimary = 'Agenda una cita',
  ctaSecondary = 'Ver servicios',
}: HeroSectionProps) {
  const ref = useStageSection(1)

  return (
    <section
      ref={ref}
      id="hero"
      className="bg-stage-1 relative overflow-hidden pt-7 pb-14"
      data-stage-section="1"
    >
      <div className="mx-auto w-full max-w-[500px] px-5">
        <StageTag n={1} label="Etapa 1 · Desastre" light />

        <h1
          className="display mt-4 text-paper-2"
          style={{ fontWeight: 500 }}
        >
          {renderTitle(title)}
        </h1>

        <p
          className="mt-5 max-w-[420px] text-[16.5px] leading-[1.55]"
          style={{ color: 'rgba(255,255,255,0.78)' }}
        >
          {subtitle}
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <a href="#agenda" className="btn btn--accent">
            {ctaPrimary}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </a>
          <a
            href="#servicios"
            className="btn btn--ghost"
            style={{
              color: 'var(--color-paper-2)',
              borderColor: 'rgba(255,255,255,0.6)',
            }}
          >
            {ctaSecondary}
          </a>
        </div>

        <div className="relative mt-9">
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'var(--color-stage-1)',
              aspectRatio: '950 / 580',
            }}
          >
            <Image
              src="/images/stages/dog-1-desastre.png"
              alt="Perro despeinado, antes del grooming"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 500px) 100vw, 500px"
            />
          </div>
          <span
            className="absolute -bottom-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.04em] text-ink"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Antes
          </span>
        </div>

        <div
          className="mt-12 grid grid-cols-3 py-5.5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderBottom: '1px solid rgba(255,255,255,0.22)',
            paddingTop: 22,
            paddingBottom: 22,
          }}
        >
          {[
            { n: '+3,200', l: 'Visitas' },
            { n: '4.9★', l: 'Rating' },
            { n: '8 km', l: 'Cobertura' },
          ].map((s, i) => (
            <div
              key={s.l}
              className="text-paper-2 px-2 text-center"
              style={
                i > 0 ? { borderLeft: '1px solid rgba(255,255,255,0.22)' } : undefined
              }
            >
              <div
                className="font-display"
                style={{ fontSize: 30, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}
              >
                {s.n}
              </div>
              <span
                className="mt-2 block text-[10.5px] uppercase tracking-[0.14em] font-semibold"
                style={{ opacity: 0.7 }}
              >
                {s.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
