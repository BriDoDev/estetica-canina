import { createClient } from '@/lib/supabase/server'
import { FormBuilderEditor } from './FormBuilderEditor'
import { DEFAULT_FORM_CONFIG } from '@/lib/types/form-config'
import type { FormConfig } from '@/lib/types/form-config'

export const dynamic = 'force-dynamic'

interface LandingService {
  id: string
  icon: string
  name: string
  description: string
  price: string
  badge?: string | null
  active: boolean
  imageUrl?: string | null
}

export default async function FormBuilderPage() {
  let config: FormConfig = DEFAULT_FORM_CONFIG
  let services: LandingService[] = []
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const [configResult, servicesResult] = await Promise.all([
      supabase.from('landing_config').select('value').eq('key', 'appointment_form_config').single(),
      supabase.from('landing_config').select('value').eq('key', 'services').single(),
    ])

    if (configResult.data?.value) {
      config = configResult.data.value as unknown as FormConfig
    }
    if (servicesResult.data?.value && Array.isArray(servicesResult.data.value)) {
      services = servicesResult.data.value as unknown as LandingService[]
    }
  } catch (err) {
    console.error('[FormBuilder]', err)
    fetchError = 'Error al cargar configuración del formulario. Mostrando defaults.'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Form Builder</h1>
        <p className="text-slate-500">
          Configura el formulario de citas: campos, secciones y servicios disponibles
        </p>
      </div>
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <span>⚠️</span> {fetchError}
        </div>
      )}
      <FormBuilderEditor initialConfig={config} initialServices={services} />
    </div>
  )
}
