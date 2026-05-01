import { createClient } from '@/lib/supabase/server'
import { ReviewsManager } from './ReviewsManager'

export const dynamic = 'force-dynamic'

export interface ReviewItem {
  id: string
  name: string
  pet?: string
  comment: string
  rating: number
  active: boolean
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Sofía Ramírez',
    pet: 'Dueña de Coco (Poodle)',
    comment:
      'Increíble servicio. El análisis de IA detectó que Coco necesitaba un tratamiento especial para su pelo rizado. ¡Quedó hermoso!',
    rating: 5,
    active: true,
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    pet: 'Dueño de Thor (Golden Retriever)',
    comment:
      'Agendé la cita en minutos y me avisaron por WhatsApp. El resultado fue espectacular. 100% recomendado.',
    rating: 5,
    active: true,
  },
  {
    id: '3',
    name: 'Laura Vega',
    pet: 'Dueña de Luna (Shih Tzu)',
    comment:
      'La experiencia completa es excelente. El equipo es muy profesional y Luna siempre sale feliz y hermosa.',
    rating: 5,
    active: true,
  },
]

export default async function ReviewsPage() {
  let reviews: ReviewItem[] = DEFAULT_REVIEWS
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'reviews')
      .single()

    if (data?.value && Array.isArray(data.value)) {
      reviews = data.value as unknown as ReviewItem[]
    }
  } catch (err) {
    console.error('[Reviews]', err)
    fetchError = 'Error al cargar reseñas. Mostrando defaults.'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reseñas</h1>
        <p className="text-slate-500">Gestiona las reseñas mostradas en la página principal</p>
      </div>
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <span>⚠️</span> {fetchError}
        </div>
      )}
      <ReviewsManager initialReviews={reviews} />
    </div>
  )
}
