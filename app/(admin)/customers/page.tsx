import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { MessageCircle, ChevronRight } from 'lucide-react'

interface CustomerRow {
  id: string
  full_name: string
  email: string
  phone: string
  whatsapp_opt_in: boolean
  created_at: string
}

export default async function CustomersPage() {
  let customers: CustomerRow[] | null = null
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('customers')
      .select('*, pets(count)')
      .order('created_at', { ascending: false })
    customers = data as unknown as CustomerRow[] | null
  } catch (err) {
    console.error('[Customers]', err)
    fetchError = 'Error de conexión al cargar clientes.'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-500">Base de clientes de Paws &amp; Glow</p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <span>⚠️</span> {fetchError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos los clientes ({customers?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <div className="space-y-1">
              {(customers as unknown as CustomerRow[]).map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="group flex items-center justify-between rounded-lg border-b border-slate-100 px-2 py-3 transition-colors last:border-0 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
                      {customer.full_name
                        .split(' ')
                        .slice(0, 2)
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{customer.full_name}</p>
                      <p className="text-xs text-slate-400">
                        {customer.email} · {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {customer.whatsapp_opt_in && (
                      <Badge className="gap-1 border-none bg-green-100 text-xs text-green-700">
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </Badge>
                    )}
                    <span className="hidden text-xs text-slate-400 sm:block">
                      {formatDate(customer.created_at)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              No hay clientes registrados aún
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
