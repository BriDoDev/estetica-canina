import { createClient } from '@/lib/supabase/server'
import { Icon } from '@/components/admin/Icon'
import { getStatusMeta } from '@/lib/ds/status'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface RecentAppointment {
  id: string
  status: string
  scheduled_at: string
  pet: { name: string; breed: string | null } | null
  customer: { full_name: string } | null
}

const PET_AVATAR_BGS = [
  'ds-avatar ds-avatar--md ds-avatar-pet',
  'ds-avatar ds-avatar--md ds-avatar-pet--brown',
  'ds-avatar ds-avatar--md ds-avatar-pet--gray',
  'ds-avatar ds-avatar--md ds-avatar-pet--cream',
]

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
    recentAppointments =
      recentRes.status === 'fulfilled'
        ? (recentRes.value.data as unknown as RecentAppointment[])
        : null

    const hasErrors = results.some((r) => r.status === 'rejected')
    if (hasErrors)
      fetchError = 'Algunos datos no pudieron cargarse. Verifica la conexión a Supabase.'
  } catch (err) {
    console.error('[Dashboard]', err)
    fetchError = 'Error de conexión al cargar el dashboard. Verifica que Supabase esté accesible.'
  }

  const stats: { label: string; value: string | number; icon: 'calendar' | 'users' | 'paw' | 'chart' }[] = [
    { label: 'Citas totales', value: appointmentsCount ?? 0, icon: 'calendar' },
    { label: 'Clientes', value: customersCount ?? 0, icon: 'users' },
    { label: 'Mascotas', value: petsCount ?? 0, icon: 'paw' },
    { label: 'Ingresos est.', value: formatCurrency(0), icon: 'chart' },
  ]

  return (
    <div className="ds-stack-6">
      <header className="flex items-start justify-between gap-4">
        <div className="ds-stack-2">
          <h1 className="ds-t-d1">Dashboard</h1>
          <p className="ds-t-body ds-t-muted">Resumen general de Paws &amp; Glow.</p>
        </div>
      </header>

      {fetchError && (
        <div className="ds-alert ds-alert--warning">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>No pudimos cargar todos los datos</strong>
            {fetchError}
          </div>
        </div>
      )}

      <section className="ds-grid-4">
        {stats.map((stat) => (
          <div className="ds-stat" key={stat.label}>
            <div className="ds-stat__label">
              <Icon name={stat.icon} size="sm" />
              {stat.label}
            </div>
            <div className="ds-stat__value">{stat.value}</div>
          </div>
        ))}
      </section>

      <section>
        <div className="ds-card-head" style={{ marginBottom: 12 }}>
          <div>
            <div className="ds-card-head__title">Citas recientes</div>
            <div className="ds-card-head__sub">Últimas 5 citas registradas en el salón.</div>
          </div>
        </div>

        {recentAppointments && recentAppointments.length > 0 ? (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Cliente · Mascota</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt, i) => {
                  const meta = getStatusMeta(apt.status)
                  const petName = apt.pet?.name ?? '—'
                  const initial = petName.charAt(0).toUpperCase() || '?'
                  return (
                    <tr key={apt.id}>
                      <td>
                        <div className="ds-identity">
                          <div className={PET_AVATAR_BGS[i % PET_AVATAR_BGS.length]}>{initial}</div>
                          <div className="ds-identity__body">
                            <div className="ds-identity__name">
                              {apt.customer?.full_name ?? 'Sin nombre'}
                            </div>
                            <div className="ds-identity__sub">
                              {petName}
                              {apt.pet?.breed ? ` · ${apt.pet.breed}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="ds-t-mono">{formatDate(apt.scheduled_at)}</td>
                      <td>
                        <span className={meta.dsClass}>{meta.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-empty">
            <div className="ds-empty__icon">
              <Icon name="calendar" size="lg" />
            </div>
            <div className="ds-empty__title">Sin citas aún</div>
            <div className="ds-empty__desc">
              Cuando se registren citas en el sistema aparecerán aquí.
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
