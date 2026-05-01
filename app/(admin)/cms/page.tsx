import { createClient } from '@/lib/supabase/server'
import { CmsEditor } from './CmsEditor'
import Link from 'next/link'
import { ArrowRight, Scissors, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface LandingConfig {
  hero?: {
    title?: string
    subtitle?: string
    ctaPrimary?: string
    ctaSecondary?: string
  }
  contact?: {
    phone?: string
    email?: string
    address?: string
  }
  hours?: {
    weekdays?: string
    saturday?: string
    sunday?: string
  }
}

export default async function CmsPage() {
  const configMap: Record<string, unknown> = {}
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data: configs } = await supabase
      .from('landing_config')
      .select('*')
      .in('key', ['hero', 'contact', 'hours'])

    for (const c of configs ?? []) {
      configMap[c.key] = c.value
    }
  } catch (err) {
    console.error('[CMS]', err)
    fetchError = 'Error al cargar configuración. Mostrando defaults.'
  }

  const hero = (configMap['hero'] as LandingConfig['hero']) ?? {
    title: 'Tu mascota merece brillar ✨',
    subtitle: 'Estética canina de alto nivel con diagnóstico por inteligencia artificial.',
    ctaPrimary: 'Agendar cita',
    ctaSecondary: 'Ver servicios',
  }

  const contact = (configMap['contact'] as LandingConfig['contact']) ?? {
    phone: '+52 55 1234 5678',
    email: 'hola@pawsandglow.mx',
    address: '',
  }

  const hours = (configMap['hours'] as LandingConfig['hours']) ?? {
    weekdays: 'Lun–Vie: 9:00–19:00',
    saturday: 'Sáb: 9:00–17:00',
    sunday: 'Dom: Cerrado',
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CMS Landing</h1>
        <p className="text-slate-500">
          Edita el contenido de la página principal directamente desde aquí
        </p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <span>⚠️</span> {fetchError}
        </div>
      )}

      <CmsEditor hero={hero} contact={contact} hours={hours} />

      {/* Shortcuts to Services and Reviews */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/services"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <Scissors className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Servicios</p>
              <p className="text-xs text-slate-400">Gestionar servicios del landing</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
        </Link>

        <Link
          href="/reviews"
          className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Reseñas</p>
              <p className="text-xs text-slate-400">Gestionar reseñas del landing</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
        </Link>
      </div>
    </div>
  )
}
