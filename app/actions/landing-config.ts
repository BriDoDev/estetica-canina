'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getConfigAction(key: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('landing_config')
    .select('*')
    .eq('key', key)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }
  return { data: data ?? null, error: null }
}

export async function updateConfigAction(key: string, value: unknown, label?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const { data: existing } = await supabase
    .from('landing_config')
    .select('id')
    .eq('key', key)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('landing_config')
      .update({ value: value as never, updated_by: user.id, updated_at: new Date().toISOString(), ...(label ? { label } : {}) })
      .eq('key', key)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('landing_config').insert({
      key,
      value: value as never,
      label: label ?? key,
      updated_by: user.id,
    })

    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/cms')
  return { success: true, error: null }
}

export async function getAllConfigAction() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('landing_config')
    .select('*')
    .order('key')

  return { data: data ?? [], error: error?.message ?? null }
}
