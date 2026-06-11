import { createClient } from '@/lib/supabase/server'
import { ProductsManager } from './ProductsManager'
import { Icon } from '@/components/admin/Icon'

export const dynamic = 'force-dynamic'

export interface ProductRow {
  id: string
  name: string
  description: string | null
  price: number
  category: 'shampoo' | 'conditioner' | 'tool' | 'accessory' | 'treatment'
  stock_quantity: number
  image_url: string | null
  is_active: boolean
}

export default async function ProductsPage() {
  let products: ProductRow[] = []
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('products').select('*').order('name', { ascending: true })
    products = (data ?? []) as ProductRow[]
  } catch (err) {
    console.error('[Products]', err)
    fetchError = 'Error de conexión al cargar productos.'
  }

  return (
    <div className="ds-stack-6">
      <header className="ds-stack-2">
        <h1 className="ds-t-d1">Productos</h1>
        <p className="ds-t-body ds-t-muted">Inventario de productos de Paws &amp; Glow.</p>
      </header>
      {fetchError && (
        <div className="ds-alert ds-alert--warning">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>No pudimos cargar productos</strong>
            {fetchError}
          </div>
        </div>
      )}
      <ProductsManager initialProducts={products} />
    </div>
  )
}
