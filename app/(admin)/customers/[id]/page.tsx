import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/components/admin/Icon'
import { getStatusMeta } from '@/lib/ds/status'
import { formatCurrency, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const SERVICE_LABELS: Record<string, string> = {
  bath: 'Baño',
  haircut: 'Corte de pelo',
  bath_haircut: 'Baño + Corte',
  nail_trim: 'Corte de uñas',
  ear_cleaning: 'Limpieza de oídos',
  full_grooming: 'Grooming Completo',
}

const COAT_LABELS: Record<string, string> = {
  short: 'Pelo corto',
  medium: 'Pelo mediano',
  long: 'Pelo largo',
  curly: 'Pelo rizado',
  double: 'Doble capa',
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single()
  if (!customer) notFound()

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', id)
    .order('scheduled_at', { ascending: false })

  return (
    <div className="ds-stack-6" style={{ maxWidth: 960 }}>
      <nav className="ds-crumbs">
        <Link href="/customers">Clientes</Link>
        <span className="ds-crumbs__sep">/</span>
        <span className="ds-crumbs__current">{customer.full_name}</span>
      </nav>

      {/* Customer card */}
      <section className="ds-card">
        <div className="flex items-start justify-between gap-4">
          <div className="ds-identity">
            <div className="ds-avatar ds-avatar--xl ds-avatar-pet">
              {initialsFor(customer.full_name)}
            </div>
            <div className="ds-identity__body">
              <div className="ds-t-d3" style={{ marginBottom: 2 }}>
                {customer.full_name}
              </div>
              <div className="ds-t-sm ds-t-muted">
                Cliente desde {formatDate(customer.created_at)}
              </div>
            </div>
          </div>
          {customer.whatsapp_opt_in && (
            <span className="ds-badge ds-badge--success">
              <Icon name="msg" size="sm" />
              WhatsApp activo
            </span>
          )}
        </div>
        <div className="ds-grid-2" style={{ gap: 12, marginTop: 16 }}>
          <div className="ds-row-2 ds-t-body ds-t-muted">
            <Icon name="msg" size="sm" />
            {customer.email}
          </div>
          <div className="ds-row-2 ds-t-body ds-t-muted">
            <Icon name="cog" size="sm" />
            {customer.phone}
          </div>
          {customer.notes && (
            <div
              className="ds-alert ds-alert--warning"
              style={{ gridColumn: '1 / -1', marginTop: 4 }}
            >
              <Icon name="info" className="ds-alert__icon" />
              <div className="ds-alert__body">
                <strong>Notas internas</strong>
                {customer.notes}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pets */}
      <section>
        <div className="ds-card-head" style={{ marginBottom: 12 }}>
          <div>
            <div className="ds-card-head__title">Mascotas ({pets?.length ?? 0})</div>
            <div className="ds-card-head__sub">Pelajes, tallas y notas especiales.</div>
          </div>
        </div>
        {pets && pets.length > 0 ? (
          <div className="ds-grid-2">
            {pets.map((pet) => (
              <article key={pet.id} className="ds-card ds-card--inset">
                <div className="flex items-start gap-3">
                  {pet.photo_url ? (
                    <div
                      style={{
                        position: 'relative',
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        overflow: 'hidden',
                        flex: '0 0 auto',
                      }}
                    >
                      <Image src={pet.photo_url} alt={pet.name} fill sizes="64px" className="object-cover" />
                    </div>
                  ) : (
                    <div
                      className="ds-avatar ds-avatar--xl ds-avatar-pet"
                      style={{ borderRadius: 12 }}
                    >
                      <Icon name="paw" size="lg" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="ds-t-d4">{pet.name}</div>
                    {pet.breed && <div className="ds-t-sm ds-t-muted">{pet.breed}</div>}
                    <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                      {pet.coat_type && (
                        <span className="ds-badge ds-badge--accent">
                          {COAT_LABELS[pet.coat_type] ?? pet.coat_type}
                        </span>
                      )}
                      {pet.age_years != null && (
                        <span className="ds-badge">{pet.age_years} años</span>
                      )}
                      {pet.weight_kg != null && (
                        <span className="ds-badge">{pet.weight_kg} kg</span>
                      )}
                    </div>
                    {pet.special_notes && (
                      <p
                        className="ds-t-xs ds-t-muted truncate"
                        style={{ marginTop: 6 }}
                      >
                        {pet.special_notes}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="ds-empty">
            <div className="ds-empty__icon">
              <Icon name="paw" size="lg" />
            </div>
            <div className="ds-empty__title">Sin mascotas registradas</div>
          </div>
        )}
      </section>

      {/* Appointments */}
      <section>
        <div className="ds-card-head" style={{ marginBottom: 12 }}>
          <div>
            <div className="ds-card-head__title">Citas ({appointments?.length ?? 0})</div>
            <div className="ds-card-head__sub">Historial de servicios contratados.</div>
          </div>
        </div>
        {appointments && appointments.length > 0 ? (
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const meta = getStatusMeta(appt.status)
                  const analysis = appt.ai_analysis as Record<string, unknown> | null
                  return (
                    <tr key={appt.id}>
                      <td>
                        <div className="ds-t-body" style={{ fontWeight: 600 }}>
                          {SERVICE_LABELS[appt.service_type] ?? appt.service_type}
                        </div>
                        {typeof analysis?.summary === 'string' && (
                          <div
                            className="ds-t-xs"
                            style={{ color: 'var(--accent)', marginTop: 2 }}
                          >
                            <Icon name="sparkle" size="sm" /> {analysis.summary as string}
                          </div>
                        )}
                      </td>
                      <td className="ds-t-mono">
                        {new Intl.DateTimeFormat('es-MX', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(appt.scheduled_at))}
                      </td>
                      <td className="ds-num">
                        {appt.price != null ? formatCurrency(appt.price) : <span className="ds-t-muted">—</span>}
                      </td>
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
            <div className="ds-empty__title">Sin citas registradas</div>
          </div>
        )}
      </section>
    </div>
  )
}
