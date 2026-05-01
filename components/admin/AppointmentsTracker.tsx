'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatCurrency } from '@/lib/utils'
import { completeAppointmentAction, updateAppointmentStatusAction } from '@/app/actions/tracking'
import { CheckCircle, XCircle, PlayCircle, DollarSign, FileText } from 'lucide-react'

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

  const FilterChip = ({ f }: { f: string }) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${filter === f ? 'font-semibold text-rose-900' : 'text-slate-500 hover:bg-[#F5EDFA] hover:text-slate-700'}`}
      style={filter === f ? { backgroundColor: '#FFDAD6' } : {}}
    >
      {f === 'all' ? 'Todas' : (statusLabels[f] ?? f)}
    </button>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-[28px]">Citas</h1>
          <p className="text-sm text-slate-500">Gestión y seguimiento post-cita</p>
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <FilterChip key={f} f={f} />
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>⚠️</span> {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop table */}
      <Card className="hidden rounded-2xl border border-slate-100 shadow-sm sm:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            {filter === 'all' ? 'Todas las citas' : statusLabels[filter]} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-400">
                    Cliente
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-400">
                    Mascota
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-400">
                    Servicio
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-slate-400">Fecha</th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-slate-400">
                    Precio
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-medium text-slate-400">
                    Estado
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-medium text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt) => {
                  const active = !['completed', 'cancelled'].includes(apt.status)
                  return (
                    <tr
                      key={apt.id}
                      className={active ? 'rounded-xl hover:bg-[#F5EDFA]' : 'opacity-60'}
                    >
                      <td className="px-2 py-3">
                        <p className="text-sm font-medium">{apt.customer?.full_name}</p>
                        <p className="text-xs text-slate-400">{apt.customer?.phone}</p>
                      </td>
                      <td className="px-2 py-3">
                        <p className="text-sm font-medium">{apt.pet?.name}</p>
                        {apt.pet?.breed && (
                          <p className="text-xs text-slate-400">{apt.pet.breed}</p>
                        )}
                      </td>
                      <td className="px-2 py-3 text-sm">{serviceLabels[apt.service_type]}</td>
                      <td className="px-2 py-3">
                        <p className="text-sm">{formatDate(apt.scheduled_at)}</p>
                        {apt.completed_at && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {formatDate(apt.completed_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        {apt.actual_price ? (
                          <span className="text-sm font-semibold text-green-700">
                            {formatCurrency(apt.actual_price)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <Badge
                          className={`${statusColors[apt.status]} rounded-lg border-none text-xs`}
                        >
                          {statusLabels[apt.status]}
                        </Badge>
                        {apt.tracking_notes && (
                          <div
                            className="mt-1 flex justify-center gap-1 text-xs text-slate-400"
                            title={apt.tracking_notes}
                          >
                            <FileText className="h-3 w-3" />
                            Nota
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {apt.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-xs"
                              onClick={() => handleStatusChange(apt.id, 'confirmed')}
                              disabled={saving}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Confirmar
                            </Button>
                          )}
                          {apt.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-xs"
                              onClick={() => handleStatusChange(apt.id, 'in_progress')}
                              disabled={saving}
                            >
                              <PlayCircle className="h-3 w-3" />
                              Iniciar
                            </Button>
                          )}
                          {apt.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 border-green-300 text-xs text-green-600"
                              onClick={() => {
                                setCompletingId(apt.id)
                                setCompletePrice('')
                                setCompleteNotes('')
                              }}
                              disabled={saving}
                            >
                              <DollarSign className="h-3 w-3" />
                              Cobrar
                            </Button>
                          )}
                          {active && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-red-500"
                              onClick={() => handleStatusChange(apt.id, 'cancelled')}
                              disabled={saving}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No hay citas en este estado</p>
          )}
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        <p className="text-sm text-slate-400">{filtered.length} citas</p>
        {filtered.map((apt) => {
          const active = !['completed', 'cancelled'].includes(apt.status)
          return (
            <div
              key={apt.id}
              className={`rounded-2xl border p-4 ${active ? 'border-slate-100 bg-white shadow-sm' : 'bg-slate-50 opacity-60'}`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{apt.customer?.full_name}</p>
                  <p className="text-xs text-slate-400">{apt.customer?.phone}</p>
                </div>
                <Badge className={`${statusColors[apt.status]} rounded-lg border-none text-xs`}>
                  {statusLabels[apt.status]}
                </Badge>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Mascota</p>
                  <p className="font-medium">
                    {apt.pet?.name}
                    {apt.pet?.breed && (
                      <span className="text-xs text-slate-400"> · {apt.pet.breed}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Servicio</p>
                  <p className="font-medium">{serviceLabels[apt.service_type]}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Fecha</p>
                  <p className="text-sm">{formatDate(apt.scheduled_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Precio</p>
                  <p className="font-semibold text-green-700">
                    {apt.actual_price ? formatCurrency(apt.actual_price) : '—'}
                  </p>
                </div>
              </div>
              {active && (
                <div className="flex gap-2 border-t border-slate-100 pt-2">
                  {apt.status === 'pending' && (
                    <Button
                      size="sm"
                      className="h-9 flex-1 text-xs"
                      style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }}
                      onClick={() => handleStatusChange(apt.id, 'confirmed')}
                      disabled={saving}
                    >
                      Confirmar
                    </Button>
                  )}
                  {apt.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1 text-xs"
                      onClick={() => handleStatusChange(apt.id, 'in_progress')}
                      disabled={saving}
                    >
                      Iniciar
                    </Button>
                  )}
                  {apt.status === 'in_progress' && (
                    <Button
                      size="sm"
                      className="h-9 flex-1 bg-green-600 text-xs text-white hover:bg-green-700"
                      onClick={() => {
                        setCompletingId(apt.id)
                        setCompletePrice('')
                        setCompleteNotes('')
                      }}
                      disabled={saving}
                    >
                      Cobrar y completar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 text-xs text-red-500"
                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              {apt.tracking_notes && (
                <p className="mt-2 text-xs text-slate-400 italic">{apt.tracking_notes}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Complete modal */}
      {completingId && (
        <Card className="rounded-2xl border-2 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-800">
              <CheckCircle className="h-5 w-5" />
              Completar cita y registrar pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Precio cobrado (MXN) *
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="550.00"
                  className="min-h-[44px] pl-7"
                  value={completePrice}
                  onChange={(e) => setCompletePrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notas de seguimiento
              </label>
              <Textarea
                placeholder="Comportamiento, recomendaciones..."
                rows={3}
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCompletingId(null)
                  setCompletePrice('')
                  setCompleteNotes('')
                }}
              >
                Cancelar
              </Button>
              <Button
                className="gap-2 bg-green-600 text-white hover:bg-green-700"
                onClick={handleComplete}
                disabled={saving}
              >
                <CheckCircle className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Confirmar pago'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
