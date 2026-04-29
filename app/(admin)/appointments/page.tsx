import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface AppointmentRow {
  id: string
  service_type: string
  status: string
  scheduled_at: string
  pet: { name: string; breed: string | null } | null
  customer: { full_name: string; phone: string } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-violet-100 text-violet-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const serviceLabels: Record<string, string> = {
  bath: 'Baño',
  haircut: 'Corte',
  bath_haircut: 'Baño + Corte',
  nail_trim: 'Uñas',
  ear_cleaning: 'Oídos',
  full_grooming: 'Grooming Completo',
}

export default async function AppointmentsPage() {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, pet:pets(name, breed), customer:customers(full_name, phone)')
    .order('scheduled_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Citas</h1>
        <p className="text-slate-500">Gestiona todas las citas de Paws & Glow</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las citas ({appointments?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Cliente</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Mascota</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Servicio</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Fecha</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(appointments as unknown as AppointmentRow[]).map((apt) => (
                    <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{apt.customer?.full_name}</p>
                        <p className="text-xs text-slate-400">{apt.customer?.phone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{apt.pet?.name}</p>
                        {apt.pet?.breed && (
                          <p className="text-xs text-slate-400">{apt.pet.breed}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {serviceLabels[apt.service_type] ?? apt.service_type}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatDate(apt.scheduled_at)}</td>
                      <td className="py-3 px-3">
                        <Badge className={`${statusColors[apt.status]} border-none text-xs`}>
                          {statusLabels[apt.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">No hay citas registradas aún</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
