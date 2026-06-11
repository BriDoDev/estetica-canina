import { createClient } from '@/lib/supabase/server'
import { ReviewsManager } from './ReviewsManager'
import { Icon } from '@/components/admin/Icon'

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
    <div className="ds-stack-6">
      <header className="ds-stack-2">
        <h1 className="ds-t-d1">Reseñas</h1>
        <p className="ds-t-body ds-t-muted">
          Gestiona las reseñas mostradas en la página principal.
        </p>
      </header>
      {fetchError && (
        <div className="ds-alert ds-alert--warning">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>Cargando defaults</strong>
            {fetchError}
          </div>
        </div>
      )}
      <ReviewsManager initialReviews={reviews} key={JSON.stringify(reviews)} />
    </div>
  )
}
