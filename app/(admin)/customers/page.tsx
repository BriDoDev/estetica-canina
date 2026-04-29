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
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*, pets(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-500">Base de clientes de Paws &amp; Glow</p>
      </div>

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
                  className="flex items-center justify-between py-3 px-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
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
                      <Badge className="bg-green-100 text-green-700 border-none text-xs gap-1">
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {formatDate(customer.created_at)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-10">
              No hay clientes registrados aún
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
