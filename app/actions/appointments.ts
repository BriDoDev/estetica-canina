'use server'

import { createClient } from '@/lib/supabase/server'
import { appointmentSchema } from '@/lib/schemas/appointment'
import { analyzePetPhoto } from '@/lib/ai/analyze-pet'
import { revalidatePath } from 'next/cache'
import type { AppointmentWithDetails } from '@/types'
import type { Json } from '@/types/database'

interface CreateAppointmentResult {
  data: { appointmentId: string } | null
  error: string | null
}

export async function createAppointmentAction(
  formData: FormData
): Promise<CreateAppointmentResult> {
  try {
    const raw = {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string,
      whatsappOptIn: formData.get('whatsappOptIn') === 'true',
      petName: formData.get('petName') as string,
      petBreed: formData.get('petBreed') as string | undefined,
      petAgeYears: formData.get('petAgeYears')
        ? Number(formData.get('petAgeYears'))
        : undefined,
      petWeightKg: formData.get('petWeightKg')
        ? Number(formData.get('petWeightKg'))
        : undefined,
      coatType: (formData.get('coatType') as string) || undefined,
      serviceType: formData.get('serviceType') as string,
      scheduledAt: formData.get('scheduledAt') as string,
      notes: (formData.get('notes') as string) || undefined,
      petPhotoFile: formData.get('petPhotoFile') as File | null,
    }

    const validated = appointmentSchema.safeParse(raw)
    if (!validated.success) {
      return {
        data: null,
        error: validated.error.issues[0]?.message ?? 'Datos inválidos',
      }
    }

    const supabase = await createClient()

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          full_name: validated.data.customerName as string,
          email: validated.data.customerEmail as string,
          phone: validated.data.customerPhone as string,
          whatsapp_opt_in: validated.data.whatsappOptIn as boolean,
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (customerError) {
      console.error('[createAppointment] Customer error:', customerError)
      return { data: null, error: 'Error al registrar el cliente' }
    }

    const { data: pet, error: petError } = await supabase
      .from('pets')
      .insert({
        customer_id: customer.id as string,
        name: validated.data.petName as string,
        breed: (validated.data.petBreed as string | undefined) ?? null,
        age_years: validated.data.petAgeYears ?? null,
        weight_kg: validated.data.petWeightKg ?? null,
        coat_type: validated.data.coatType ?? null,
      })
      .select()
      .single()

    if (petError) {
      console.error('[createAppointment] Pet error:', petError)
      return { data: null, error: 'Error al registrar la mascota' }
    }

    let petPhotoUrl: string | null = null
    let aiAnalysis = null

    const petPhotoFile = formData.get('petPhotoFile') as File | null
    if (petPhotoFile && petPhotoFile.size > 0) {
      const fileExt = petPhotoFile.name.split('.').pop()
      const fileName = `${pet.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, petPhotoFile, {
          contentType: petPhotoFile.type,
          upsert: false,
        })

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(uploadData.path)

        petPhotoUrl = publicUrlData.publicUrl

        await supabase
          .from('pets')
          .update({ photo_url: petPhotoUrl })
          .eq('id', pet.id as string)

        try {
          const arrayBuffer = await petPhotoFile.arrayBuffer()
          const base64 = Buffer.from(arrayBuffer).toString('base64')
          aiAnalysis = await analyzePetPhoto(base64, petPhotoFile.type)
        } catch (aiErr) {
          console.warn('[createAppointment] AI analysis failed:', aiErr)
        }
      }
    }

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        pet_id: pet.id as string,
        customer_id: customer.id as string,
        service_type: validated.data.serviceType,
        status: 'pending' as const,
        scheduled_at: new Date(validated.data.scheduledAt).toISOString(),
        duration_minutes: 60,
        notes: validated.data.notes ?? null,
        pet_photo_url: petPhotoUrl,
        ai_analysis: aiAnalysis as Json | null,
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('[createAppointment] Appointment error:', appointmentError)
      return { data: null, error: 'Error al crear la cita' }
    }

    revalidatePath('/dashboard/appointments')

    return { data: { appointmentId: appointment.id as string }, error: null }
  } catch (err) {
    console.error('[createAppointmentAction] Unexpected error:', err)
    return { data: null, error: 'Error inesperado al procesar la solicitud' }
  }
}

export async function getAppointmentsAction(): Promise<{
  data: AppointmentWithDetails[]
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        pet:pets(*),
        customer:customers(*)
      `)
      .order('scheduled_at', { ascending: true })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data as unknown as AppointmentWithDetails[], error: null }
  } catch {
    return { data: [], error: 'Error al cargar las citas' }
  }
}
