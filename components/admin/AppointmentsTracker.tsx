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
  id: string; service_type: string; status: string; scheduled_at: string
  actual_price: number | null; completed_at: string | null; tracking_notes: string | null
  pet: { name: string; breed: string | null } | null
  customer: { full_name: string; phone: string } | null
}

const statusColors: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700', in_progress: 'bg-violet-100 text-violet-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }
const statusLabels: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmada', in_progress: 'En proceso', completed: 'Completada', cancelled: 'Cancelada' }
const serviceLabels: Record<string, string> = { bath: 'Baño', haircut: 'Corte', bath_haircut: 'Baño + Corte', nail_trim: 'Uñas', ear_cleaning: 'Oídos', full_grooming: 'Grooming Completo', special_care: 'Cuidado Especial', deshedding: 'Deslanado', spa_canine: 'Spa Canino' }

interface Props { initialAppointments: AppointmentRow[] }

export function AppointmentsTracker({ initialAppointments }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filter, setFilter] = useState('all')
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completePrice, setCompletePrice] = useState('')
  const [completeNotes, setCompleteNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    setSaving(true); setError(null)
    const result = await updateAppointmentStatusAction({ appointmentId: id, status: newStatus as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' })
    if (result.success) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    else setError(result.error)
    setSaving(false)
  }, [])

  const handleComplete = useCallback(async () => {
    if (!completingId) return
    const price = parseFloat(completePrice)
    if (isNaN(price) || price < 0) { setError('Ingresa un precio válido.'); return }
    setSaving(true); setError(null)
    const result = await completeAppointmentAction({ appointmentId: completingId, actualPrice: price, trackingNotes: completeNotes || undefined })
    if (result.success) {
      setAppointments(prev => prev.map(a => a.id === completingId ? { ...a, status: 'completed', actual_price: price, completed_at: new Date().toISOString(), tracking_notes: completeNotes || null } : a))
      setCompletingId(null); setCompletePrice(''); setCompleteNotes('')
    } else setError(result.error)
    setSaving(false)
  }, [completingId, completePrice, completeNotes])

  const FilterChip = ({ f }: { f: string }) => (
    <button key={f} onClick={() => setFilter(f)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${filter === f ? 'text-rose-900 font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-[#F5EDFA]'}`}
      style={filter === f ? { backgroundColor: '#FFDAD6' } : {}}
    >{f === 'all' ? 'Todas' : statusLabels[f] ?? f}</button>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-[28px] font-bold text-slate-900">Citas</h1>
          <p className="text-sm text-slate-500">Gestión y seguimiento post-cita</p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(f => <FilterChip key={f} f={f} />)}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Desktop table */}
      <Card className="hidden sm:block rounded-2xl border border-slate-100 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base font-medium">{filter === 'all' ? 'Todas las citas' : statusLabels[filter]} ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100"><th className="text-left py-2 px-2 text-slate-400 font-medium text-xs">Cliente</th><th className="text-left py-2 px-2 text-slate-400 font-medium text-xs">Mascota</th><th className="text-left py-2 px-2 text-slate-400 font-medium text-xs">Servicio</th><th className="text-left py-2 px-2 text-slate-400 font-medium text-xs">Fecha</th><th className="text-right py-2 px-2 text-slate-400 font-medium text-xs">Precio</th><th className="text-center py-2 px-2 text-slate-400 font-medium text-xs">Estado</th><th className="text-right py-2 px-2 text-slate-400 font-medium text-xs">Acciones</th></tr></thead>
              <tbody>
                {filtered.map(apt => {
                  const active = !['completed', 'cancelled'].includes(apt.status)
                  return (
                    <tr key={apt.id} className={active ? 'hover:bg-[#F5EDFA] rounded-xl' : 'opacity-60'}>
                      <td className="py-3 px-2"><p className="font-medium text-sm">{apt.customer?.full_name}</p><p className="text-xs text-slate-400">{apt.customer?.phone}</p></td>
                      <td className="py-3 px-2"><p className="font-medium text-sm">{apt.pet?.name}</p>{apt.pet?.breed && <p className="text-xs text-slate-400">{apt.pet.breed}</p>}</td>
                      <td className="py-3 px-2 text-sm">{serviceLabels[apt.service_type]}</td>
                      <td className="py-3 px-2"><p className="text-sm">{formatDate(apt.scheduled_at)}</p>{apt.completed_at && <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3"/>{formatDate(apt.completed_at)}</p>}</td>
                      <td className="py-3 px-2 text-right">{apt.actual_price ? <span className="font-semibold text-green-700 text-sm">{formatCurrency(apt.actual_price)}</span> : <span className="text-slate-300">—</span>}</td>
                      <td className="py-3 px-2 text-center"><Badge className={`${statusColors[apt.status]} border-none text-xs rounded-lg`}>{statusLabels[apt.status]}</Badge>{apt.tracking_notes && <div className="mt-1 text-xs text-slate-400 flex justify-center gap-1" title={apt.tracking_notes}><FileText className="w-3 h-3"/>Nota</div>}</td>
                      <td className="py-3 px-2"><div className="flex items-center justify-end gap-1">
                        {apt.status === 'pending' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleStatusChange(apt.id, 'confirmed')} disabled={saving}><CheckCircle className="w-3 h-3"/>Confirmar</Button>}
                        {apt.status === 'confirmed' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleStatusChange(apt.id, 'in_progress')} disabled={saving}><PlayCircle className="w-3 h-3"/>Iniciar</Button>}
                        {apt.status === 'in_progress' && <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-600 border-green-300" onClick={() => { setCompletingId(apt.id); setCompletePrice(''); setCompleteNotes('') }} disabled={saving}><DollarSign className="w-3 h-3"/>Cobrar</Button>}
                        {active && <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => handleStatusChange(apt.id, 'cancelled')} disabled={saving}><XCircle className="w-3 h-3"/></Button>}
                      </div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <p className="text-slate-400 text-sm text-center py-10">No hay citas en este estado</p>}
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        <p className="text-sm text-slate-400">{filtered.length} citas</p>
        {filtered.map(apt => {
          const active = !['completed', 'cancelled'].includes(apt.status)
          return (
            <div key={apt.id} className={`p-4 rounded-2xl border ${active ? 'bg-white shadow-sm border-slate-100' : 'opacity-60 bg-slate-50'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{apt.customer?.full_name}</p>
                  <p className="text-xs text-slate-400">{apt.customer?.phone}</p>
                </div>
                <Badge className={`${statusColors[apt.status]} border-none text-xs rounded-lg`}>{statusLabels[apt.status]}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><p className="text-xs text-slate-400">Mascota</p><p className="font-medium">{apt.pet?.name}{apt.pet?.breed && <span className="text-xs text-slate-400"> · {apt.pet.breed}</span>}</p></div>
                <div><p className="text-xs text-slate-400">Servicio</p><p className="font-medium">{serviceLabels[apt.service_type]}</p></div>
                <div><p className="text-xs text-slate-400">Fecha</p><p className="text-sm">{formatDate(apt.scheduled_at)}</p></div>
                <div><p className="text-xs text-slate-400">Precio</p><p className="font-semibold text-green-700">{apt.actual_price ? formatCurrency(apt.actual_price) : '—'}</p></div>
              </div>
              {active && (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {apt.status === 'pending' && <Button size="sm" className="h-9 text-xs flex-1" style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }} onClick={() => handleStatusChange(apt.id, 'confirmed')} disabled={saving}>Confirmar</Button>}
                  {apt.status === 'confirmed' && <Button size="sm" variant="outline" className="h-9 text-xs flex-1" onClick={() => handleStatusChange(apt.id, 'in_progress')} disabled={saving}>Iniciar</Button>}
                  {apt.status === 'in_progress' && <Button size="sm" className="h-9 text-xs flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => { setCompletingId(apt.id); setCompletePrice(''); setCompleteNotes('') }} disabled={saving}>Cobrar y completar</Button>}
                  <Button size="sm" variant="ghost" className="h-9 text-xs text-red-500" onClick={() => handleStatusChange(apt.id, 'cancelled')} disabled={saving}>Cancelar</Button>
                </div>
              )}
              {apt.tracking_notes && <p className="mt-2 text-xs text-slate-400 italic">{apt.tracking_notes}</p>}
            </div>
          )
        })}
      </div>

      {/* Complete modal */}
      {completingId && (
        <Card className="border-2 border-green-300 rounded-2xl">
          <CardHeader><CardTitle className="text-green-800 flex items-center gap-2 text-lg"><CheckCircle className="w-5 h-5"/>Completar cita y registrar pago</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Precio cobrado (MXN) *</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input type="number" min="0" step="0.01" placeholder="550.00" className="pl-7 min-h-[44px]" value={completePrice} onChange={e => setCompletePrice(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComplete()}/>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Notas de seguimiento</label>
              <Textarea placeholder="Comportamiento, recomendaciones..." rows={3} value={completeNotes} onChange={e => setCompleteNotes(e.target.value)}/>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setCompletingId(null); setCompletePrice(''); setCompleteNotes('') }}>Cancelar</Button>
              <Button className="bg-green-600 hover:bg-green-700 gap-2 text-white" onClick={handleComplete} disabled={saving}><CheckCircle className="w-4 h-4"/>{saving ? 'Guardando...' : 'Confirmar pago'}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
