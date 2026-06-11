'use client'

import { useCallback, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { completeAppointmentAction, updateAppointmentStatusAction } from '@/app/actions/tracking'
import { getStatusMeta } from '@/lib/ds/status'
import { Icon } from '@/components/admin/Icon'

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

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'in_progress', label: 'En proceso' },
  { id: 'completed', label: 'Completadas' },
  { id: 'cancelled', label: 'Canceladas' },
]

const SERVICE_LABELS: Record<string, string> = {
  bath: 'Baño',
  haircut: 'Corte',
  bath_haircut: 'Baño + Corte',
  nail_trim: 'Uñas',
  ear_cleaning: 'Oídos',
  full_grooming: 'Grooming Completo',
  special_care: 'Cuidado Especial',
  deshedding: 'Deslanado',
  spa_canine: 'Spa Canino',
}

interface Props {
  initialAppointments: AppointmentRow[]
}

export function AppointmentsTracker({ initialAppointments }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState('all')
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completePrice, setCompletePrice] = useState('')
  const [completeNotes, setCompleteNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    setSaving(true)
    setError(null)
    const result = await updateAppointmentStatusAction({
      appointmentId: id,
      status: newStatus as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
    })
    if (result.success)
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
    else setError(result.error)
    setSaving(false)
  }, [])

  const handleComplete = useCallback(async () => {
    if (!completingId) return
    const price = parseFloat(completePrice)
    if (isNaN(price) || price < 0) {
      setError('Ingresa un precio válido.')
      return
    }
    setSaving(true)
    setError(null)
    const result = await completeAppointmentAction({
      appointmentId: completingId,
      actualPrice: price,
      trackingNotes: completeNotes || undefined,
    })
    if (result.success) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === completingId
            ? {
                ...a,
                status: 'completed',
                actual_price: price,
                completed_at: new Date().toISOString(),
                tracking_notes: completeNotes || null,
              }
            : a,
        ),
      )
      setCompletingId(null)
      setCompletePrice('')
      setCompleteNotes('')
    } else setError(result.error)
    setSaving(false)
  }, [completingId, completePrice, completeNotes])

  return (
    <div className="ds-stack-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="ds-stack-2">
          <h1 className="ds-t-d1">Citas</h1>
          <p className="ds-t-body ds-t-muted">Gestión y seguimiento post-cita.</p>
        </div>
        <div className="ds-btn-group" role="tablist" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`ds-btn${filter === f.id ? ' is-on' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="ds-alert ds-alert--danger">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>Algo salió mal</strong>
            {error}
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setError(null)}
            className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
          >
            <Icon name="x" size="sm" />
          </button>
        </div>
      )}

      {/* Desktop table */}
      <section className="hidden sm:block">
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Cliente · Mascota</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="ds-empty">
                      <div className="ds-empty__icon">
                        <Icon name="calendar" size="lg" />
                      </div>
                      <div className="ds-empty__title">Sin citas en este estado</div>
                      <div className="ds-empty__desc">
                        Ajusta el filtro o espera a que se registren nuevas citas.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((apt) => {
                const meta = getStatusMeta(apt.status)
                const active = !['completed', 'cancelled'].includes(apt.status)
                const petName = apt.pet?.name ?? '—'
                const initial = petName.charAt(0).toUpperCase() || '?'
                return (
                  <tr key={apt.id} style={!active ? { opacity: 0.6 } : undefined}>
                    <td>
                      <div className="ds-identity">
                        <div className="ds-avatar ds-avatar--md ds-avatar-pet">{initial}</div>
                        <div className="ds-identity__body">
                          <div className="ds-identity__name">
                            {apt.customer?.full_name ?? 'Sin nombre'}
                          </div>
                          <div className="ds-identity__sub">
                            {petName}
                            {apt.pet?.breed ? ` · ${apt.pet.breed}` : ''}
                            {apt.customer?.phone ? ` · ${apt.customer.phone}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{SERVICE_LABELS[apt.service_type] ?? apt.service_type}</td>
                    <td className="ds-t-mono">
                      {formatDate(apt.scheduled_at)}
                      {apt.completed_at && (
                        <div
                          className="ds-t-xs"
                          style={{ color: 'var(--success)', marginTop: 2 }}
                        >
                          ✓ {formatDate(apt.completed_at)}
                        </div>
                      )}
                    </td>
                    <td className="ds-num">
                      {apt.actual_price ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {formatCurrency(apt.actual_price)}
                        </span>
                      ) : (
                        <span className="ds-t-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={meta.dsClass}>{meta.label}</span>
                      {apt.tracking_notes && (
                        <div
                          className="ds-t-xs ds-t-muted"
                          style={{ marginTop: 4 }}
                          title={apt.tracking_notes}
                        >
                          <Icon name="msg" size="sm" /> Nota
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="ds-row-actions" style={{ justifyContent: 'flex-end' }}>
                        {apt.status === 'pending' && (
                          <button
                            type="button"
                            className="ds-btn ds-btn--sm ds-btn--outline"
                            onClick={() => handleStatusChange(apt.id, 'confirmed')}
                            disabled={saving}
                          >
                            <Icon name="check" size="sm" />
                            Confirmar
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button
                            type="button"
                            className="ds-btn ds-btn--sm ds-btn--outline"
                            onClick={() => handleStatusChange(apt.id, 'in_progress')}
                            disabled={saving}
                          >
                            <Icon name="chevron-r" size="sm" />
                            Iniciar
                          </button>
                        )}
                        {apt.status === 'in_progress' && (
                          <button
                            type="button"
                            className="ds-btn ds-btn--sm ds-btn--accent"
                            onClick={() => {
                              setCompletingId(apt.id)
                              setCompletePrice('')
                              setCompleteNotes('')
                            }}
                            disabled={saving}
                          >
                            <Icon name="check" size="sm" />
                            Cobrar
                          </button>
                        )}
                        {active && (
                          <button
                            type="button"
                            aria-label="Cancelar"
                            className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            disabled={saving}
                          >
                            <Icon name="x" size="sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <footer className="ds-pagination">
              <span>
                {filtered.length} {filtered.length === 1 ? 'cita' : 'citas'}
              </span>
              <span className="ds-t-mono">
                {filter === 'all' ? 'Mostrando todas' : `Filtro: ${filter}`}
              </span>
            </footer>
          )}
        </div>
      </section>

      {/* Mobile cards */}
      <section className="ds-stack-3 sm:hidden">
        <p className="ds-t-sm ds-t-muted">
          {filtered.length} {filtered.length === 1 ? 'cita' : 'citas'}
        </p>
        {filtered.map((apt) => {
          const meta = getStatusMeta(apt.status)
          const active = !['completed', 'cancelled'].includes(apt.status)
          return (
            <article
              key={apt.id}
              className={`ds-card${active ? '' : ' ds-card--inset'}`}
              style={!active ? { opacity: 0.7 } : undefined}
            >
              <header
                className="flex items-start justify-between gap-3"
                style={{ marginBottom: 10 }}
              >
                <div>
                  <p className="ds-t-d4">{apt.customer?.full_name ?? '—'}</p>
                  <p className="ds-t-xs ds-t-muted">{apt.customer?.phone}</p>
                </div>
                <span className={meta.dsClass}>{meta.label}</span>
              </header>
              <div className="ds-grid-2" style={{ gap: 8, marginBottom: 12 }}>
                <div>
                  <p className="ds-t-label">Mascota</p>
                  <p className="ds-t-body">
                    {apt.pet?.name}
                    {apt.pet?.breed && (
                      <span className="ds-t-xs ds-t-muted"> · {apt.pet.breed}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="ds-t-label">Servicio</p>
                  <p className="ds-t-body">{SERVICE_LABELS[apt.service_type] ?? apt.service_type}</p>
                </div>
                <div>
                  <p className="ds-t-label">Fecha</p>
                  <p className="ds-t-body ds-t-mono">{formatDate(apt.scheduled_at)}</p>
                </div>
                <div>
                  <p className="ds-t-label">Precio</p>
                  <p
                    className="ds-t-body"
                    style={{ color: apt.actual_price ? 'var(--success)' : 'var(--ink-7)', fontWeight: 600 }}
                  >
                    {apt.actual_price ? formatCurrency(apt.actual_price) : '—'}
                  </p>
                </div>
              </div>
              {active && (
                <div
                  className="flex gap-2"
                  style={{ borderTop: '1px solid var(--ink-3)', paddingTop: 10 }}
                >
                  {apt.status === 'pending' && (
                    <button
                      type="button"
                      className="ds-btn ds-btn--accent ds-btn--block"
                      onClick={() => handleStatusChange(apt.id, 'confirmed')}
                      disabled={saving}
                    >
                      Confirmar
                    </button>
                  )}
                  {apt.status === 'confirmed' && (
                    <button
                      type="button"
                      className="ds-btn ds-btn--outline ds-btn--block"
                      onClick={() => handleStatusChange(apt.id, 'in_progress')}
                      disabled={saving}
                    >
                      Iniciar
                    </button>
                  )}
                  {apt.status === 'in_progress' && (
                    <button
                      type="button"
                      className="ds-btn ds-btn--accent ds-btn--block"
                      onClick={() => {
                        setCompletingId(apt.id)
                        setCompletePrice('')
                        setCompleteNotes('')
                      }}
                      disabled={saving}
                    >
                      Cobrar y completar
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Cancelar"
                    className="ds-btn ds-btn--icon ds-btn--ghost"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                    disabled={saving}
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </div>
              )}
              {apt.tracking_notes && (
                <p className="ds-t-xs ds-t-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>
                  {apt.tracking_notes}
                </p>
              )}
            </article>
          )
        })}
      </section>

      {/* Complete modal */}
      {completingId && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ background: 'rgba(15, 15, 13, 0.5)' }}
          onClick={() => setCompletingId(null)}
        >
          <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-modal__head">
              <div
                className="ds-modal__head__icon"
                style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
              >
                <Icon name="check" size="md" />
              </div>
              <div className="ds-modal__head__body">
                <div className="ds-modal__title">Completar cita y registrar pago</div>
                <div className="ds-modal__desc">
                  Ingresa el monto cobrado para marcar la cita como completada.
                </div>
              </div>
            </div>
            <div className="ds-modal__body ds-stack-3">
              <div className="ds-field">
                <label className="ds-field__label" htmlFor="price">
                  Precio cobrado (MXN) <span className="ds-req">*</span>
                </label>
                <div className="ds-input-group">
                  <span className="ds-t-muted">$</span>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="550.00"
                    value={completePrice}
                    onChange={(e) => setCompletePrice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
                  />
                </div>
              </div>
              <div className="ds-field">
                <label className="ds-field__label" htmlFor="notes">
                  Notas de seguimiento
                </label>
                <textarea
                  id="notes"
                  className="ds-textarea"
                  placeholder="Comportamiento, recomendaciones…"
                  rows={3}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="ds-modal__foot">
              <button
                type="button"
                className="ds-btn ds-btn--ghost"
                onClick={() => {
                  setCompletingId(null)
                  setCompletePrice('')
                  setCompleteNotes('')
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ds-btn ds-btn--accent"
                onClick={handleComplete}
                disabled={saving}
              >
                <Icon name="check" size="sm" />
                {saving ? 'Guardando…' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
