import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { StageTag } from './StageTag'
import { StageSection } from './StageSection'

interface ReviewItem {
  name: string
  pet?: string
  comment: string
  rating: number
  active?: boolean
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    name: 'Sofía Ramírez',
    pet: 'Dueña de Coco (Poodle)',
    comment:
      'Increíble servicio. El análisis de IA detectó que Coco necesitaba un tratamiento especial para su pelo rizado. ¡Quedó hermoso!',
    rating: 5,
  },
  {
    name: 'Carlos Mendoza',
    pet: 'Dueño de Thor (Golden Retriever)',
    comment:
      'Agendé la cita en minutos y me avisaron por WhatsApp. El resultado fue espectacular. 100% recomendado.',
    rating: 5,
  },
  {
    name: 'Laura Vega',
    pet: 'Dueña de Luna (Shih Tzu)',
    comment:
      'La experiencia completa es excelente. El equipo es muy profesional y Luna siempre sale feliz y hermosa.',
    rating: 5,
  },
]

const PET_AVATAR_BGS = ['#f4c79a', '#bcd6e6', '#d8e4b8', '#e8a4a4']

function petInitial(review: ReviewItem) {
  const source = (review.pet || review.name).match(/\(([^)]+)\)/)?.[1] ?? review.name
  return source.trim().charAt(0).toUpperCase()
}

async function getReviews(): Promise<ReviewItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'reviews')
      .single()

    if (data?.value && Array.isArray(data.value)) {
      const items = data.value as unknown as ReviewItem[]
      return items.filter((r) => r.active !== false)
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_REVIEWS
}

export async function TestimonialsSection() {
  const reviews = await getReviews()

  return (
    <StageSection n={3} id="testimonios" className="bg-stage-3 relative overflow-hidden py-[72px]">
      <div className="mx-auto w-full max-w-[500px] px-5">
        <div className="mb-8 flex flex-col gap-3.5">
          <StageTag n={3} label="Etapa 3 · Cepillado" />
          <h2 className="h2 text-ink">
            Lo que dicen
            <br />
            nuestros clientes.
          </h2>
          <p className="text-[16px] leading-[1.55] text-ink-2">
            Más de 500 mascotas peinadas, cepilladas y consentidas.
          </p>
        </div>

        <div className="stage-hero">
          <Image
            src="/images/stages/dog-3-cepillado.png"
            alt="Perro cepillado con secadora"
            width={950}
            height={580}
            className="h-auto w-full"
          />
          <span className="stage-hero__caption">Cepillado y secado</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {reviews.map((review, i) => (
            <div
              key={review.name}
              className="bg-paper"
              style={{ borderRadius: 'var(--radius-lg)', padding: '22px 20px' }}
            >
              <span className="text-accent text-[13px] tracking-[1.5px]">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </span>
              <p
                className="font-display text-[18px] leading-[1.35]"
                style={{ marginTop: 8, fontWeight: 400, letterSpacing: '-0.005em' }}
              >
                {review.comment}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="grid h-10 w-10 flex-none place-items-center rounded-full font-display text-[16px] font-medium"
                  style={{ background: PET_AVATAR_BGS[i % PET_AVATAR_BGS.length] }}
                >
                  {petInitial(review)}
                </div>
                <div className="flex-1 leading-[1.25]">
                  <div className="text-[13.5px] font-semibold text-ink">{review.name}</div>
                  {review.pet && (
                    <div className="text-[11.5px] text-ink-3">{review.pet}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StageSection>
  )
}
