import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Icon } from '@/components/admin/Icon'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface CustomerRow {
  id: string
  full_name: string
  email: string
  phone: string
  whatsapp_opt_in: boolean
  created_at: string
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
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
    <div className="ds-stack-6">
      <header className="flex items-start justify-between gap-4">
        <div className="ds-stack-2">
          <h1 className="ds-t-d1">Clientes</h1>
          <p className="ds-t-body ds-t-muted">Base de clientes de Paws &amp; Glow.</p>
        </div>
      </header>

      {fetchError && (
        <div className="ds-alert ds-alert--warning">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>No pudimos cargar los clientes</strong>
            {fetchError}
          </div>
        </div>
      )}

      {customers && customers.length > 0 ? (
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Canales</th>
                <th style={{ textAlign: 'right' }}>Alta</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <Link href={`/customers/${customer.id}`} className="ds-identity">
                      <div className="ds-avatar ds-avatar--md ds-avatar-pet">
                        {initialsFor(customer.full_name)}
                      </div>
                      <div className="ds-identity__body">
                        <div className="ds-identity__name">{customer.full_name}</div>
                        <div className="ds-identity__sub">{customer.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="ds-t-mono">{customer.phone}</td>
                  <td>
                    {customer.whatsapp_opt_in ? (
                      <span className="ds-badge ds-badge--success">
                        <Icon name="msg" size="sm" />
                        WhatsApp
                      </span>
                    ) : (
                      <span className="ds-t-muted">—</span>
                    )}
                  </td>
                  <td className="ds-num ds-t-mono">{formatDate(customer.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                      aria-label="Ver detalle"
                    >
                      <Icon name="chevron-r" size="sm" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <footer className="ds-pagination">
            <span>
              {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </footer>
        </div>
      ) : (
        <div className="ds-empty">
          <div className="ds-empty__icon">
            <Icon name="users" size="lg" />
          </div>
          <div className="ds-empty__title">Sin clientes aún</div>
          <div className="ds-empty__desc">
            Cuando se registren clientes desde la landing aparecerán aquí.
          </div>
        </div>
      )}
    </div>
  )
}
