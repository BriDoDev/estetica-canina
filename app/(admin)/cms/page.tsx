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
  const supabase = await createClient()

  const { data: configs } = await supabase
    .from('landing_config')
    .select('*')
    .in('key', ['hero', 'contact', 'hours'])

  const configMap: Record<string, unknown> = {}
  for (const c of configs ?? []) {
    configMap[c.key] = c.value
  }

  const hero = (configMap['hero'] as LandingConfig['hero']) ?? {
    title: 'Tu mascota merece brillar ✨',
    subtitle:
      'Estética canina de alto nivel con diagnóstico por inteligencia artificial.',
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
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CMS Landing</h1>
        <p className="text-slate-500">
          Edita el contenido de la página principal directamente desde aquí
        </p>
      </div>

      <CmsEditor hero={hero} contact={contact} hours={hours} />

      {/* Shortcuts to Services and Reviews */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/services"
          className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Servicios</p>
              <p className="text-xs text-slate-400">Gestionar servicios del landing</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </Link>

        <Link
          href="/reviews"
          className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Reseñas</p>
              <p className="text-xs text-slate-400">Gestionar reseñas del landing</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
