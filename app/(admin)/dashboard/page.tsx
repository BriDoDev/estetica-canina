import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, PawPrint, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RecentAppointment {
  id: string
  status: string
  scheduled_at: string
  pet: { name: string; breed: string | null } | null
  customer: { full_name: string } | null
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

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: appointmentsCount },
    { count: customersCount },
    { count: petsCount },
    { data: recentAppointments },
  ] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('pets').select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*, pet:pets(name, breed), customer:customers(full_name)')
      .order('scheduled_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Resumen general de Paws & Glow</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Citas totales', value: appointmentsCount ?? 0, icon: Calendar, color: 'text-indigo-600' },
          { label: 'Clientes', value: customersCount ?? 0, icon: Users, color: 'text-blue-600' },
          { label: 'Mascotas', value: petsCount ?? 0, icon: PawPrint, color: 'text-violet-600' },
          { label: 'Ingresos est.', value: formatCurrency(0), icon: TrendingUp, color: 'text-green-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments && recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {(recentAppointments as unknown as RecentAppointment[]).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm text-slate-800">
                      {apt.customer?.full_name} — {apt.pet?.name}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(apt.scheduled_at)}</p>
                  </div>
                  <Badge className={`${statusColors[apt.status]} border-none text-xs`}>
                    {statusLabels[apt.status]}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">No hay citas aún</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
