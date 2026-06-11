'use client'

import Image from 'next/image'
import { useStage } from './StageProvider'

const STAGES = [
  { src: '/images/stages/dog-1-desastre.png', label: 'Desastre', bg: 'var(--color-stage-1)' },
  { src: '/images/stages/dog-2-bano.png', label: 'El Baño', bg: 'var(--color-stage-2)' },
  { src: '/images/stages/dog-3-cepillado.png', label: 'Cepillado', bg: 'var(--color-stage-3)' },
  { src: '/images/stages/dog-4-radiante.png', label: 'Radiante', bg: 'var(--color-stage-4)' },
] as const

export function FloatingDog() {
  const stage = useStage()
  const idx = stage - 1
  const current = STAGES[idx]

  return (
    <div
      className="floating-dog"
      style={{ ['--dog-bg' as string]: current.bg }}
      aria-hidden="true"
    >
      <div className="floating-dog__circle">
        {STAGES.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt=""
            fill
            sizes="96px"
            priority={i === 0}
            className={`floating-dog__img${idx === i ? ' is-active' : ''}`}
          />
        ))}
      </div>
      <div className="floating-dog__caption">
        <span className="floating-dog__step">Etapa {stage} / 4</span>
        <span className="floating-dog__label">{current.label}</span>
      </div>
      <div className="floating-dog__dots">
        {STAGES.map((_, i) => (
          <span key={i} className={`floating-dog__dot${idx === i ? ' is-active' : ''}`} />
        ))}
      </div>
    </div>
  )
}
