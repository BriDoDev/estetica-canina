import { z } from 'zod'

export const appointmentSchema = z.object({
  customerName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customerEmail: z.string().email('Correo electrónico inválido'),
  customerPhone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[0-9+\s\-()]+$/, 'Formato de teléfono inválido'),
  whatsappOptIn: z.boolean().default(false),
  petName: z.string().min(1, 'El nombre de la mascota es requerido'),
  petBreed: z.string().optional(),
  petAgeYears: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.number().min(0).max(30).optional()
  ),
  petWeightKg: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.number().min(0.1).max(150).optional()
  ),
  coatType: z
    .enum(['short', 'medium', 'long', 'curly', 'double'])
    .optional(),
  serviceType: z.enum([
    'bath',
    'haircut',
    'bath_haircut',
    'nail_trim',
    'ear_cleaning',
    'full_grooming',
  ]),
  scheduledAt: z.string().min(1, 'La fecha y hora son requeridas'),
  notes: z.string().max(500).optional(),
  petPhotoFile: z
    .instanceof(File)
    .nullish()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'La foto debe ser menor a 5MB'
    )
    .refine(
      (file) =>
        !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Solo se permiten imágenes JPG, PNG o WebP'
    ),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const serviceLabels: Record<AppointmentFormData['serviceType'], string> = {
  bath: 'Baño',
  haircut: 'Corte de pelo',
  bath_haircut: 'Baño + Corte',
  nail_trim: 'Corte de uñas',
  ear_cleaning: 'Limpieza de oídos',
  full_grooming: 'Grooming Completo',
}

export const coatTypeLabels: Record<NonNullable<AppointmentFormData['coatType']>, string> = {
  short: 'Pelo corto',
  medium: 'Pelo mediano',
  long: 'Pelo largo',
  curly: 'Pelo rizado',
  double: 'Doble capa',
}
