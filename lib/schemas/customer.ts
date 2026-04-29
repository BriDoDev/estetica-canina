import { z } from 'zod'

export const customerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[0-9+\s\-()]+$/, 'Formato de teléfono inválido'),
  whatsappOptIn: z.boolean().default(false),
  notes: z.string().max(500).optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>
