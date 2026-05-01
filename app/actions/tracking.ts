'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CompleteAppointmentInput {
  appointmentId: string
  actualPrice: number
  trackingNotes?: string
}

interface UpdateAppointmentStatusInput {
  appointmentId: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
}

export async function completeAppointmentAction(input: CompleteAppointmentInput) {
  if (!input.appointmentId) return { success: false, error: 'ID de cita requerido.' }
  if (input.actualPrice === undefined || input.actualPrice < 0) {
    return { success: false, error: 'Precio inválido.' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado.' }

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        actual_price: input.actualPrice,
        completed_at: new Date().toISOString(),
        tracking_notes: input.trackingNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.appointmentId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/appointments')
    revalidatePath('/dashboard')
    return { success: true, error: null }
  } catch (err) {
    console.error('[completeAppointment]', err)
    return { success: false, error: 'Error al completar la cita.' }
  }
}

export async function updateAppointmentStatusAction(input: UpdateAppointmentStatusInput) {
  if (!input.appointmentId) return { success: false, error: 'ID de cita requerido.' }
  if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(input.status)) {
    return { success: false, error: 'Estado inválido.' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado.' }

    let error: { message: string } | null = null

    if (input.status === 'completed') {
      const result = await supabase
        .from('appointments')
        .update({
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.appointmentId)
      error = result.error
    } else {
      const result = await supabase
        .from('appointments')
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.appointmentId)
      error = result.error
    }

    if (error) return { success: false, error: error.message }

    revalidatePath('/appointments')
    revalidatePath('/dashboard')
    return { success: true, error: null }
  } catch (err) {
    console.error('[updateAppointmentStatus]', err)
    return { success: false, error: 'Error al actualizar estado.' }
  }
}
