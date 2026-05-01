import { createClient } from '@/lib/supabase/server'
import { ProductsManager } from './ProductsManager'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <p className="text-slate-500">Inventario de productos de Paws &amp; Glow</p>
      </div>
      {fetchError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <span>⚠️</span> {fetchError}
        </div>
      )}
      <ProductsManager initialProducts={products} />
    </div>
  )
}
