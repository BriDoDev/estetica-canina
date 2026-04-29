'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerFormData } from '@/lib/schemas/customer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<CustomerFormData>
}

export function CustomerForm({ onSubmit, isLoading = false, defaultValues }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerFormData>,
    defaultValues: {
      whatsappOptIn: false,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo *</Label>
        <Input
          id="fullName"
          placeholder="María García López"
          {...register('fullName')}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input
          id="email"
          type="email"
          placeholder="maria@ejemplo.com"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          placeholder="+52 55 1234 5678"
          {...register('phone')}
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <input
          id="whatsappOptIn"
          type="checkbox"
          {...register('whatsappOptIn')}
          className="w-4 h-4 text-green-600 accent-green-600"
        />
        <Label htmlFor="whatsappOptIn" className="text-sm text-green-800 cursor-pointer">
          Recibir notificaciones por WhatsApp
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Observaciones adicionales..."
          rows={3}
          {...register('notes')}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Guardar cliente
      </Button>
    </form>
  )
}
