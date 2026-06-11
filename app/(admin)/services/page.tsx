import { createClient } from '@/lib/supabase/server'
import { ServicesManager } from './ServicesManager'
import { Icon } from '@/components/admin/Icon'

export const dynamic = 'force-dynamic'

export interface ServiceItem {
  id: string
  icon: string
  name: string
  description: string
  price: string
  badge?: string | null
  active: boolean
  imageUrl?: string | null
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: '1',
    icon: '🛁',
    name: 'Baño Profundo',
    description: 'Limpieza profunda con productos premium. Incluye secado y cepillado.',
    price: 'Desde $250',
    badge: 'Popular',
    active: true,
  },
  {
    id: '2',
    icon: '✂️',
    name: 'Corte Profesional',
    description: 'Corte personalizado según la raza y preferencias del dueño.',
    price: 'Desde $350',
    badge: null,
    active: true,
  },
  {
    id: '3',
    icon: '✨',
    name: 'Grooming Completo',
    description: 'Baño, corte, uñas, oídos y todo lo que tu mascota necesita.',
    price: 'Desde $550',
    badge: 'Recomendado',
    active: true,
  },
  {
    id: '4',
    icon: '💚',
    name: 'Cuidado Especial',
    description: 'Tratamientos dermatológicos y mascarillas para pelo dañado.',
    price: 'Desde $400',
    badge: 'IA Diagnóstico',
    active: true,
  },
  {
    id: '5',
    icon: '🌀',
    name: 'Deslanado',
    description: 'Remoción profesional del pelo muerto para razas de doble capa.',
    price: 'Desde $450',
    badge: null,
    active: true,
  },
  {
    id: '6',
    icon: '🌟',
    name: 'Spa Canino',
    description: 'Experiencia premium: aromaterapia, masaje relajante y más.',
    price: 'Desde $700',
    badge: 'Premium',
    active: true,
  },
]

export default async function ServicesPage() {
  let services: ServiceItem[] = DEFAULT_SERVICES
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'services')
      .single()

    if (data?.value && Array.isArray(data.value)) {
      services = data.value as unknown as ServiceItem[]
    }
  } catch (err) {
    console.error('[Services]', err)
    fetchError = 'Error al cargar servicios. Mostrando defaults.'
  }

  return (
    <div className="ds-stack-6">
      <header className="ds-stack-2">
        <h1 className="ds-t-d1">Servicios</h1>
        <p className="ds-t-body ds-t-muted">
          Gestiona los servicios mostrados en la página principal.
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
      <ServicesManager initialServices={services} key={JSON.stringify(services)} />
    </div>
  )
}
