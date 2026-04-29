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
    <section className="py-24 bg-[#fafaf8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">
            ⭐ Opiniones reales
          </p>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Más de 500 mascotas felices nos respaldan.
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="flex-shrink-0 w-[300px] snap-start md:w-auto bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                &ldquo;{review.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {getInitials(review.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{review.name}</p>
                  {review.pet && (
                    <p className="text-xs text-slate-400">{review.pet}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
