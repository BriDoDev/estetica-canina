import { createClient } from '@/lib/supabase/server'
import { AppointmentsTracker } from '@/components/admin/AppointmentsTracker'
import { Icon } from '@/components/admin/Icon'

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
      <div className="ds-stack-6">
        <header className="ds-stack-2">
          <h1 className="ds-t-d1">Citas</h1>
          <p className="ds-t-body ds-t-muted">Gestión y seguimiento post-cita.</p>
        </header>
        <div className="ds-alert ds-alert--warning">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>No pudimos cargar las citas</strong>
            {fetchError}
          </div>
        </div>
      </div>
    )
  }

  return <AppointmentsTracker initialAppointments={appointments} />
}
