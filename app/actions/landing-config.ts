'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getConfigAction(key: string) {
  try {
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
  } catch (err) {
    console.error('[getConfigAction]', err)
    return { data: null, error: 'Error al obtener configuración.' }
  }
}

export async function updateConfigAction(key: string, value: unknown, label?: string) {
  // ── Validation ──
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    return { success: false, error: 'Clave de configuración inválida.' }
  }
  if (value === undefined || value === null) {
    return { success: false, error: 'El valor de configuración no puede estar vacío.' }
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'No autorizado. Inicia sesión nuevamente.' }
    }

    const { data: existing } = await supabase
      .from('landing_config')
      .select('id')
      .eq('key', key)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('landing_config')
        .update({
          value: value as never,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
          ...(label ? { label } : {}),
        })
        .eq('key', key)

      if (error) {
        console.error('[updateConfigAction] Update error:', error)
        return { success: false, error: `Error al guardar: ${error.message}` }
      }
    } else {
      const { error } = await supabase.from('landing_config').insert({
        key,
        value: value as never,
        label: label ?? key,
        updated_by: user.id,
      })

      if (error) {
        console.error('[updateConfigAction] Insert error:', error)
        return { success: false, error: `Error al crear configuración: ${error.message}` }
      }
    }

    revalidatePath('/')
    revalidatePath('/cms')
    return { success: true, error: null }
  } catch (err) {
    console.error('[updateConfigAction] Unexpected error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error inesperado al guardar configuración.',
    }
  }
}

export async function getAllConfigAction() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('landing_config')
      .select('*')
      .order('key')

    return { data: data ?? [], error: error?.message ?? null }
  } catch (err) {
    console.error('[getAllConfigAction]', err)
    return { data: [], error: 'Error al obtener configuraciones.' }
  }
}
