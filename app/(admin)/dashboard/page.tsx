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
  let appointmentsCount: number | null = 0
  let customersCount: number | null = 0
  let petsCount: number | null = 0
  let recentAppointments: RecentAppointment[] | null = null
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const results = await Promise.allSettled([
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('pets').select('*', { count: 'exact', head: true }),
      supabase
        .from('appointments')
        .select('*, pet:pets(name, breed), customer:customers(full_name)')
        .order('scheduled_at', { ascending: false })
        .limit(5),
    ])

    const [aptRes, custRes, petRes, recentRes] = results
    appointmentsCount = aptRes.status === 'fulfilled' ? aptRes.value.count : 0
    customersCount = custRes.status === 'fulfilled' ? custRes.value.count : 0
    petsCount = petRes.status === 'fulfilled' ? petRes.value.count : 0
    recentAppointments = recentRes.status === 'fulfilled' ? recentRes.value.data as unknown as RecentAppointment[] : null

    const hasErrors = results.some(r => r.status === 'rejected')
    if (hasErrors) fetchError = 'Algunos datos no pudieron cargarse. Verifica la conexión a Supabase.'
  } catch (err) {
    console.error('[Dashboard]', err)
    fetchError = 'Error de conexión al cargar el dashboard. Verifica que Supabase esté accesible.'
  }

  return (
    <div className="space-y-8">
      {/* MD3: headlineMedium + bodyLarge */}
      <div>
        <h1 className="text-[28px] leading-9 font-normal tracking-normal text-slate-900">Dashboard</h1>
        <p className="text-sm leading-5 text-slate-500 mt-1">Resumen general de Paws &amp; Glow</p>
      </div>

      {fetchError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {fetchError}
        </div>
      )}

      {/* MD3: Elevated cards — elevation level 1, 16dp gap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Citas totales', value: appointmentsCount ?? 0, icon: Calendar, color: 'text-indigo-600' },
          { label: 'Clientes', value: customersCount ?? 0, icon: Users, color: 'text-blue-600' },
          { label: 'Mascotas', value: petsCount ?? 0, icon: PawPrint, color: 'text-violet-600' },
          { label: 'Ingresos est.', value: formatCurrency(0), icon: TrendingUp, color: 'text-green-600' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-5">
              {/* MD3: bodySmall label + headlineSmall value */}
              <p className="text-xs leading-4 font-medium text-slate-500 tracking-wide">{stat.label}</p>
              <p className="text-[22px] leading-7 font-normal text-slate-900 mt-1.5">{stat.value}</p>
              <div className="mt-3">
                <stat.icon className={`w-6 h-6 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MD3: outlined card for list — 0dp elevation */}
      <Card className="rounded-2xl border border-slate-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base leading-6 font-medium text-slate-900">Citas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments && recentAppointments.length > 0 ? (
            <div className="space-y-1">
              {(recentAppointments as unknown as RecentAppointment[]).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">
                        {apt.pet?.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">
                        {apt.customer?.full_name} — {apt.pet?.name}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(apt.scheduled_at)}</p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[apt.status]} border-none text-xs rounded-lg`}>
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
