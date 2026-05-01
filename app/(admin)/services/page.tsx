import { createClient } from '@/lib/supabase/server'
import { ServicesManager } from './ServicesManager'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
        <p className="text-slate-500">Gestiona los servicios mostrados en la página principal</p>
      </div>
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <span>⚠️</span> {fetchError}
        </div>
      )}
      <ServicesManager initialServices={services} />
    </div>
  )
}
