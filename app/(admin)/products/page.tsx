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
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <p className="text-slate-500">Inventario de productos de Paws &amp; Glow</p>
      </div>
      <ProductsManager initialProducts={(products ?? []) as ProductRow[]} />
    </div>
  )
}
