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
  const supabase = await createClient()

  const [configResult, servicesResult] = await Promise.all([
    supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'appointment_form_config')
      .single(),
    supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'services')
      .single(),
  ])

  const config: FormConfig =
    configResult.data?.value
      ? (configResult.data.value as unknown as FormConfig)
      : DEFAULT_FORM_CONFIG

  const services: LandingService[] =
    servicesResult.data?.value && Array.isArray(servicesResult.data.value)
      ? (servicesResult.data.value as unknown as LandingService[])
      : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Form Builder</h1>
        <p className="text-slate-500">
          Configura el formulario de citas: campos, secciones y servicios disponibles
        </p>
      </div>
      <FormBuilderEditor initialConfig={config} initialServices={services} />
    </div>
  )
}
