import { createClient } from '@/lib/supabase/server'
import { AppointmentsTracker } from '@/components/admin/AppointmentsTracker'

export const dynamic = 'force-dynamic'

interface AppointmentRow {
  id: string
  service_type: string
  status: string
  scheduled_at: string
  actual_price: number | null
  completed_at: string | null
  tracking_notes: string | null
  pet: { name: string; breed: string | null } | null
  customer: { full_name: string; phone: string } | null
}

export default async function AppointmentsPage() {
  let appointments: AppointmentRow[] = []
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('appointments')
      .select('*, pet:pets(name, breed), customer:customers(full_name, phone)')
      .order('scheduled_at', { ascending: true })
    appointments = (data ?? []) as unknown as AppointmentRow[]
  } catch (err) {
    console.error('[Appointments]', err)
    fetchError = 'Error de conexión al cargar las citas. Verifica que Supabase esté accesible.'
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Citas</h1>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {fetchError}
        </div>
      </div>
    )
  }

  return <AppointmentsTracker initialAppointments={appointments} />
}
