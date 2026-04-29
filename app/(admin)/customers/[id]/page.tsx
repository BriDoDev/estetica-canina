import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Dog,
  ClipboardList,
} from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const serviceLabels: Record<string, string> = {
  bath: 'Baño',
  haircut: 'Corte de pelo',
  bath_haircut: 'Baño + Corte',
  nail_trim: 'Corte de uñas',
  ear_cleaning: 'Limpieza de oídos',
  full_grooming: 'Grooming Completo',
}

const coatLabels: Record<string, string> = {
  short: 'Pelo corto',
  medium: 'Pelo mediano',
  long: 'Pelo largo',
  curly: 'Pelo rizado',
  double: 'Doble capa',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

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
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-500 -ml-2">
          <Link href="/customers">
            <ArrowLeft className="w-4 h-4" />
            Volver a Clientes
          </Link>
        </Button>
      </div>

      {/* Customer info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {customer.full_name
                  .split(' ')
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{customer.full_name}</h1>
                <p className="text-sm text-slate-400">
                  Cliente desde {formatDate(customer.created_at)}
                </p>
              </div>
            </div>
            {customer.whatsapp_opt_in && (
              <Badge className="bg-green-100 text-green-700 border-none gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp activo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              {customer.email}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              {customer.phone}
            </div>
            {customer.notes && (
              <div className="sm:col-span-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-xs border border-amber-100">
                <strong>Notas:</strong> {customer.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dog className="w-5 h-5 text-indigo-500" />
            Mascotas ({pets?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pets && pets.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50"
                >
                  {pet.photo_url ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={pet.photo_url}
                        alt={pet.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🐕</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{pet.name}</p>
                    {pet.breed && (
                      <p className="text-sm text-slate-500">{pet.breed}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {pet.coat_type && (
                        <Badge className="bg-indigo-50 text-indigo-700 border-none text-xs">
                          {coatLabels[pet.coat_type] ?? pet.coat_type}
                        </Badge>
                      )}
                      {pet.age_years != null && (
                        <Badge className="bg-slate-100 text-slate-600 border-none text-xs">
                          {pet.age_years} años
                        </Badge>
                      )}
                      {pet.weight_kg != null && (
                        <Badge className="bg-slate-100 text-slate-600 border-none text-xs">
                          {pet.weight_kg} kg
                        </Badge>
                      )}
                    </div>
                    {pet.special_notes && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {pet.special_notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">
              Sin mascotas registradas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            Citas ({appointments?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appt) => {
                const analysis = appt.ai_analysis as Record<string, unknown> | null
                return (
                  <div
                    key={appt.id}
                    className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 text-sm">
                          {serviceLabels[appt.service_type] ?? appt.service_type}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Intl.DateTimeFormat('es-MX', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(appt.scheduled_at))}
                        </p>
                        {typeof analysis?.summary === 'string' && (
                          <p className="text-xs text-indigo-600 mt-1 truncate max-w-xs">
                            🤖 {analysis.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {appt.price != null && (
                        <span className="text-sm font-semibold text-indigo-600">
                          {formatCurrency(appt.price)}
                        </span>
                      )}
                      <Badge
                        className={`border-none text-xs ${statusColors[appt.status] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {statusLabels[appt.status] ?? appt.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-6">
              Sin citas registradas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
