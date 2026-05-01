import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

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

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
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
    // fall through to defaults
  }
  return DEFAULT_REVIEWS
}

export async function TestimonialsSection() {
  const reviews = await getReviews()

  return (
    <section className="bg-[#fafaf8] py-24">
      <div className="container mx-auto px-4">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold tracking-widest text-amber-600 uppercase">
            ⭐ Opiniones reales
          </p>
          <h2 className="mb-4 text-4xl font-extrabold text-foreground">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Más de 500 mascotas felices nos respaldan.
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="w-[300px] flex-shrink-0 snap-start rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md md:w-auto"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{review.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-bold text-white">
                  {getInitials(review.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  {review.pet && <p className="text-xs text-muted-foreground">{review.pet}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
