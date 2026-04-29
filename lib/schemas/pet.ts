import { z } from 'zod'

export const petSchema = z.object({
  customerId: z.string().uuid('ID de cliente inválido'),
  name: z.string().min(1, 'El nombre de la mascota es requerido'),
  breed: z.string().optional(),
  ageYears: z.coerce.number().min(0).max(30).optional(),
  weightKg: z.coerce.number().min(0.1).max(150).optional(),
  coatType: z
    .enum(['short', 'medium', 'long', 'curly', 'double'])
    .optional(),
  specialNotes: z.string().max(500).optional(),
})

export type PetFormData = z.infer<typeof petSchema>
