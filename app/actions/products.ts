'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ProductCategory = 'shampoo' | 'conditioner' | 'tool' | 'accessory' | 'treatment'

export async function createProductAction(data: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  const name = data.get('name') as string
  const description = data.get('description') as string | null
  const price = parseFloat(data.get('price') as string)
  const category = data.get('category') as ProductCategory
  const stock_quantity = parseInt(data.get('stock_quantity') as string) || 0
  const image_url = (data.get('image_url') as string) || null
  const is_active = data.get('is_active') === 'true'

  if (!name || isNaN(price) || !category) {
    return { success: false, error: 'Datos inválidos' }
  }

  const { error } = await supabase.from('products').insert({
    name,
    description: description || null,
    price,
    category,
    stock_quantity,
    image_url,
    is_active,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/products')
  return { success: true, error: null }
}

export async function updateProductAction(id: string, data: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  const name = data.get('name') as string
  const description = data.get('description') as string | null
  const price = parseFloat(data.get('price') as string)
  const category = data.get('category') as ProductCategory
  const stock_quantity = parseInt(data.get('stock_quantity') as string) || 0
  const image_url = (data.get('image_url') as string) || null
  const is_active = data.get('is_active') === 'true'

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description: description || null,
      price,
      category,
      stock_quantity,
      image_url,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/products')
  return { success: true, error: null }
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/products')
  return { success: true, error: null }
}

export async function toggleProductActiveAction(id: string, isActive: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/products')
  return { success: true, error: null }
}
