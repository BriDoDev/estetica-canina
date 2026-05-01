'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  appointmentSchema,
  type AppointmentFormData,
  serviceLabels,
  coatTypeLabels,
} from '@/lib/schemas/appointment'
import { createAppointmentAction } from '@/app/actions/appointments'
import { analyzePetAction } from '@/app/actions/analyze-pet'
import { generateGroomingPreviewAction } from '@/app/actions/generate-grooming'
import { useFormConfig } from '@/lib/hooks/useFormConfig'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PetAnalysisResult } from '@/types'
import { Camera, CheckCircle, AlertCircle, Loader2, Sparkles, X, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { PawLoader } from '@/components/ui/PawLoader'
import { compressImageForAPI } from '@/lib/image-compression'
import type { LandingService } from '@/app/api/form-config/route'

type Step = 'customer' | 'pet' | 'service' | 'confirm'

const STEPS: Step[] = ['customer', 'pet', 'service', 'confirm']

const stepLabels: Record<Step, string> = {
  customer: 'Tus datos',
  pet: 'Tu mascota',
  service: 'Servicio',
  confirm: 'Confirmar',
}

// Maps landing service IDs to appointment serviceType enum values
const LANDING_TO_SERVICE_TYPE: Record<string, AppointmentFormData['serviceType']> = {
  '1': 'bath',
  '2': 'haircut',
  '3': 'full_grooming',
  '4': 'special_care',
  '5': 'deshedding',
  '6': 'spa_canine',
}

function getServiceLabel(
  serviceType: AppointmentFormData['serviceType'] | undefined,
  services: LandingService[],
  enabledIds: string[],
): string {
  if (!serviceType) return '—'
  // Try to find a matching landing service that's enabled
  const match = services.find((s) => {
    const mapped = LANDING_TO_SERVICE_TYPE[s.id]
    return mapped === serviceType && enabledIds.includes(s.id) && s.active
  })
  if (match) return match.name
  return serviceLabels[serviceType] ?? serviceType
}

export function AppointmentForm() {
  const geo = useGeolocation()
  const [currentStep, setCurrentStep] = useState<Step>('customer')
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null)
  const [petPhotoPreview, setPetPhotoPreview] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<PetAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [groomingPreviews, setGroomingPreviews] = useState<
    { styleId: string; name: string; description: string; imageUrl: string }[] | null
  >(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [groomingError, setGroomingError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formTopRef = useRef<HTMLDivElement>(null)

  const { config, services, isLoading: configLoading } = useFormConfig()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema) as Resolver<AppointmentFormData>,
    defaultValues: { whatsappOptIn: false },
    mode: 'onBlur',
  })

  const currentStepIndex = STEPS.indexOf(currentStep)

  // Get enabled active services for the service step
  const enabledServices: LandingService[] = services.filter(
    (s) => config.enabledServiceIds.includes(s.id) && s.active,
  )

  // Helper: is a field visible according to config
  const isFieldVisible = (fieldName: string): boolean => {
    const fieldCfg = config.fields.find((f) => f.name === fieldName)
    return fieldCfg ? fieldCfg.visible : true
  }

  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (geo.status !== 'in_range') return
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type early on client
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!allowed.includes(file.type)) {
        setAiError(
          'Solo se aceptan imágenes JPG, PNG o WebP. Si estás en iPhone, selecciona "Compatibilidad máxima" en Ajustes > Cámara.',
        )
        return
      }

      setPetPhotoFile(file)
      setAiError(null)
      setAiAnalysis(null)
      setGroomingPreviews(null)
      const reader = new FileReader()
      reader.onload = (ev) => setPetPhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      // Compress image before sending to server action (avoid 1MB limit)
      setIsAnalyzing(true)
      try {
        const compressed = await compressImageForAPI(file)
        const fd = new FormData()
        fd.append('petPhoto', compressed.file)
        const result = await analyzePetAction(fd)
        if (result.data) {
          setAiAnalysis(result.data)
          if (result.data.breed && result.data.breed !== 'Mestizo') {
            setValue('petBreed', result.data.breed)
          }
          if (result.data.coatType) {
            const coatMap: Record<string, AppointmentFormData['coatType']> = {
              corto: 'short',
              mediano: 'medium',
              largo: 'long',
              rizado: 'curly',
              doble: 'double',
            }
            const detectedCoat = Object.entries(coatMap).find(([key]) =>
              result.data!.coatType.toLowerCase().includes(key),
            )
            if (detectedCoat) setValue('coatType', detectedCoat[1])
          }

          // Auto-generate grooming previews with image-to-image pipeline
          const compressedBytes = new Uint8Array(await compressed.file.arrayBuffer())
          const compressedBinary = Array.from(compressedBytes)
            .map((b) => String.fromCharCode(b))
            .join('')
          const compressedBase64 = btoa(compressedBinary)
          const previewResult = await generateGroomingPreviewAction(
            result.data.breed,
            compressedBase64,
            compressed.file.type,
          )
          if (previewResult.data && previewResult.data.length > 0) {
            setGroomingPreviews(previewResult.data)
          }
        } else if (result.error) {
          setAiError(result.error)
        }
      } catch (err) {
        console.error('[AI analysis]', err)
        setAiError(
          'No pudimos analizar la foto en este momento. Puedes continuar sin el diagnóstico automático.',
        )
      } finally {
        setIsAnalyzing(false)
      }
    },
    [geo.status, setValue],
  )

  const runAIAnalysis = useCallback(
    async (
      originalFile: File,
    ): Promise<{ compressedFile: File; aiResult: PetAnalysisResult | null }> => {
      setIsAnalyzing(true)
      setAiError(null)
      try {
        // 1. Compress image for OpenAI API
        const compressed = await compressImageForAPI(originalFile)

        // 2. Send compressed image to AI
        const fd = new FormData()
        fd.append('petPhoto', compressed.file)
        const result = await analyzePetAction(fd)

        if (result.data) {
          setAiAnalysis(result.data)
          if (result.data.breed && result.data.breed !== 'Mestizo') {
            setValue('petBreed', result.data.breed)
          }
          if (result.data.coatType) {
            const coatMap: Record<string, AppointmentFormData['coatType']> = {
              corto: 'short',
              mediano: 'medium',
              largo: 'long',
              rizado: 'curly',
              doble: 'double',
            }
            const detectedCoat = Object.entries(coatMap).find(([key]) =>
              result.data!.coatType.toLowerCase().includes(key),
            )
            if (detectedCoat) setValue('coatType', detectedCoat[1])
          }
          return { compressedFile: compressed.file, aiResult: result.data }
        } else {
          setAiError(result.error)
          return { compressedFile: compressed.file, aiResult: null }
        }
      } catch (err) {
        console.error('[AI analysis]', err)
        setAiError(
          'No pudimos analizar la foto en este momento. Puedes continuar sin el diagnóstico automático.',
        )
        return { compressedFile: originalFile, aiResult: null }
      } finally {
        setIsAnalyzing(false)
      }
    },
    [setValue],
  )

  const removePhoto = useCallback(() => {
    setPetPhotoFile(null)
    setPetPhotoPreview(null)
    setAiAnalysis(null)
    setGroomingPreviews(null)
    setGroomingError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault() // Prevent accidental form submission via Enter key
    let fieldsToValidate: (keyof AppointmentFormData)[] = []
    if (currentStep === 'customer')
      fieldsToValidate = ['customerName', 'customerEmail', 'customerPhone']
    else if (currentStep === 'pet') fieldsToValidate = ['petName']
    else if (currentStep === 'service') fieldsToValidate = ['serviceType', 'scheduledAt']

    const valid = await trigger(fieldsToValidate)
    if (!valid) return

    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
      // Scroll to top of form and blur focused element so Enter can't auto-submit
      setTimeout(() => {
        ;(document.activeElement as HTMLElement)?.blur()
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) setCurrentStep(STEPS[prevIndex])
  }

  const onSubmit = async (data: AppointmentFormData) => {
    // Guard: only allow submission from confirm step
    if (currentStep !== 'confirm') return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let compressedFile: File | undefined

      // Run AI analysis on confirm if we have a photo
      if (petPhotoFile) {
        const analysis = await runAIAnalysis(petPhotoFile)
        compressedFile = analysis.compressedFile
      }

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'petPhotoFile') {
          formData.append(key, String(value))
        }
      })
      // Send compressed image (not original)
      if (compressedFile) formData.append('petPhotoFile', compressedFile)

      const result = await createAppointmentAction(formData)
      if (result.error) setSubmitError(result.error)
      else setSubmitSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Cita agendada!</h2>
          <p className="text-center text-slate-600">
            Recibirás una confirmación en tu correo. Te esperamos con{' '}
            <strong>{watch('petName')}</strong> el día de tu cita.
          </p>
          <Button
            onClick={() => {
              setSubmitSuccess(false)
              setCurrentStep('customer')
            }}
            variant="outline"
          >
            Agendar otra cita
          </Button>
        </CardContent>
      </Card>
    )
  }

  const showSidePanel = !!(
    petPhotoPreview ||
    aiAnalysis ||
    isGeneratingPreview ||
    (groomingPreviews && groomingPreviews.length > 0)
  )
  // Hide side panel in service step — show only services
  const hasSidePanel = showSidePanel && currentStep !== 'service'

  const GeoStatusBanner = () => {
    if (geo.status === 'idle' || geo.status === 'requesting') {
      return (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Verificando disponibilidad en tu zona...
            </p>
            <p className="mt-0.5 text-xs text-blue-600">
              Estamos confirmando que podemos atenderte en tu ubicación.
            </p>
          </div>
        </div>
      )
    }
    if (geo.status === 'denied' || geo.status === 'out_of_range' || geo.status === 'unavailable') {
      return (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {geo.status === 'denied'
                ? 'Por ahora no podemos verificar tu ubicación'
                : geo.status === 'out_of_range'
                  ? 'Estás un poco lejos de nuestra zona de servicio'
                  : 'No estamos disponibles en tu zona en este momento'}
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              {geo.status === 'denied'
                ? 'No te preocupes, puedes llamarnos directamente para agendar tu cita.'
                : geo.errorMsg}
            </p>
          </div>
        </div>
      )
    }
    if (geo.status === 'in_range') {
      return (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
          <div>
            <p className="text-sm font-semibold text-green-800">¡Estamos cerca de ti!</p>
            {geo.distanceKm !== null && (
              <p className="text-xs text-green-600">
                A {geo.distanceKm} km de {geo.salonName}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  // Section titles from config (with fallbacks)
  const customerTitle = config.sections.customer.title || 'Tus datos de contacto'
  const petTitle = config.sections.pet.title || 'Datos de tu mascota'
  const serviceTitle = config.sections.service.title || 'Selecciona el servicio'

  return (
    <>
      <PawLoader isLoading={isSubmitting} message="Agendando tu cita..." />

      <div ref={formTopRef} className="mx-auto max-w-5xl scroll-mt-8 overflow-x-hidden">
        {geo.status !== 'in_range' ? (
          <div className="mx-auto max-w-lg py-8">
            <GeoStatusBanner />
            {(geo.status === 'denied' || geo.status === 'out_of_range') && (
              <p className="mt-2 text-center text-sm text-slate-500">
                El formulario estará disponible cuando tu ubicación sea verificada.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            {/* Left: step indicator + form */}
            <div className="min-w-0 flex-1">
              <GeoStatusBanner />
              {/* Step indicator */}
              <div className="mb-8 flex items-center gap-2">
                {STEPS.map((step, idx) => (
                  <div key={step} className="flex flex-1 items-center gap-2">
                    <div
                      className={cn(
                        'flex items-center gap-2 text-sm font-medium transition-colors',
                        idx <= currentStepIndex ? 'text-indigo-600' : 'text-slate-400',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                          idx < currentStepIndex
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : idx === currentStepIndex
                              ? 'border-indigo-600 text-indigo-600'
                              : 'border-slate-300 text-slate-400',
                        )}
                      >
                        {idx < currentStepIndex ? '✓' : idx + 1}
                      </div>
                      <span className="hidden sm:block">{stepLabels[step]}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1 transition-colors',
                          idx < currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200',
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSubmit(onSubmit, (errs) => {
                  const firstMsg = Object.values(errs)[0]?.message
                  if (firstMsg) setSubmitError(`Hay un error en el formulario: ${firstMsg}`)
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentStep !== 'confirm') {
                    e.preventDefault()
                  }
                }}
              >
                {/* Step 1: Customer */}
                {currentStep === 'customer' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-slate-800">{customerTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isFieldVisible('customerName') && (
                        <div className="space-y-2">
                          <Label htmlFor="customerName">Nombre completo *</Label>
                          <Input
                            id="customerName"
                            placeholder="María García López"
                            {...register('customerName')}
                            aria-invalid={!!errors.customerName}
                            aria-describedby={
                              errors.customerName ? 'customerName-error' : undefined
                            }
                            className={cn(
                              errors.customerName
                                ? 'border-red-400 focus-visible:ring-red-300'
                                : touchedFields.customerName && !errors.customerName
                                  ? 'border-green-400 focus-visible:ring-green-200'
                                  : '',
                            )}
                          />
                          {errors.customerName && (
                            <p
                              id="customerName-error"
                              role="alert"
                              className="flex items-center gap-1 text-xs text-red-600"
                            >
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {errors.customerName.message}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldVisible('customerEmail') && (
                        <div className="space-y-2">
                          <Label htmlFor="customerEmail">Correo electrónico *</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            placeholder="maria@ejemplo.com"
                            {...register('customerEmail')}
                            aria-invalid={!!errors.customerEmail}
                            aria-describedby={
                              errors.customerEmail ? 'customerEmail-error' : undefined
                            }
                            className={cn(
                              errors.customerEmail
                                ? 'border-red-400 focus-visible:ring-red-300'
                                : touchedFields.customerEmail && !errors.customerEmail
                                  ? 'border-green-400 focus-visible:ring-green-200'
                                  : '',
                            )}
                          />
                          {errors.customerEmail && (
                            <p
                              id="customerEmail-error"
                              role="alert"
                              className="flex items-center gap-1 text-xs text-red-600"
                            >
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {errors.customerEmail.message}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldVisible('customerPhone') && (
                        <div className="space-y-2">
                          <Label htmlFor="customerPhone">Teléfono / WhatsApp *</Label>
                          <Input
                            id="customerPhone"
                            placeholder="+52 55 1234 5678"
                            {...register('customerPhone')}
                            aria-invalid={!!errors.customerPhone}
                            aria-describedby={
                              errors.customerPhone ? 'customerPhone-error' : undefined
                            }
                            className={cn(
                              errors.customerPhone
                                ? 'border-red-400 focus-visible:ring-red-300'
                                : touchedFields.customerPhone && !errors.customerPhone
                                  ? 'border-green-400 focus-visible:ring-green-200'
                                  : '',
                            )}
                          />
                          {errors.customerPhone && (
                            <p
                              id="customerPhone-error"
                              role="alert"
                              className="flex items-center gap-1 text-xs text-red-600"
                            >
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {errors.customerPhone.message}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldVisible('whatsappOptIn') && (
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                          <input
                            id="whatsappOptIn"
                            type="checkbox"
                            {...register('whatsappOptIn')}
                            className="h-4 w-4 accent-green-600"
                          />
                          <Label
                            htmlFor="whatsappOptIn"
                            className="cursor-pointer text-sm text-green-800"
                          >
                            Recibir recordatorios y confirmaciones por WhatsApp
                          </Label>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Pet */}
                {currentStep === 'pet' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-slate-800">{petTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Foto de la mascota (activa el análisis IA)</Label>
                        {petPhotoPreview ? (
                          <div>
                            <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-2.5">
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={petPhotoPreview}
                                  alt="Foto de la mascota"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-indigo-800">Foto cargada</p>
                                <p className="truncate text-xs text-slate-500">
                                  {petPhotoFile?.name ?? 'imagen'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={removePhoto}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 transition-colors hover:bg-red-200"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {isAnalyzing && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analizando foto con IA... (puede tardar unos segundos)
                              </div>
                            )}
                            {aiError && !isAnalyzing && (
                              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                {aiError}
                              </div>
                            )}
                            {aiAnalysis && !isAnalyzing && (
                              <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                                <div className="mb-2 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-indigo-600" />
                                  <span className="text-sm font-semibold text-indigo-800">
                                    Análisis IA completado
                                  </span>
                                </div>
                                <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
                                  <div>
                                    <strong>Raza:</strong> {aiAnalysis.breed}
                                  </div>
                                  <div>
                                    <strong>Edad est.:</strong> {aiAnalysis.estimatedAge}
                                  </div>
                                  <div>
                                    <strong>Tipo de pelo:</strong> {aiAnalysis.coatType}
                                  </div>
                                  <div>
                                    <strong>Estado:</strong>{' '}
                                    <Badge
                                      variant={
                                        aiAnalysis.coatCondition === 'excellent' ||
                                        aiAnalysis.coatCondition === 'good'
                                          ? 'default'
                                          : 'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {aiAnalysis.coatCondition === 'excellent'
                                        ? 'Excelente'
                                        : aiAnalysis.coatCondition === 'good'
                                          ? 'Bueno'
                                          : aiAnalysis.coatCondition === 'needs_attention'
                                            ? 'Necesita atención'
                                            : 'Requiere cuidado'}
                                    </Badge>
                                  </div>
                                </div>
                                {aiAnalysis.urgentCare && (
                                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                                    {aiAnalysis.urgentCare}
                                  </div>
                                )}
                                <div className="mt-2 space-y-1.5">
                                  {aiAnalysis.recommendations.map((rec, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2 text-xs text-slate-700"
                                    >
                                      <Badge
                                        variant={
                                          rec.priority === 'high' ? 'destructive' : 'secondary'
                                        }
                                        className="flex-shrink-0 text-xs"
                                      >
                                        {rec.priority === 'high'
                                          ? 'Alta'
                                          : rec.priority === 'medium'
                                            ? 'Media'
                                            : 'Baja'}
                                      </Badge>
                                      <span>
                                        {rec.service}: {rec.description}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-3 border-t border-indigo-200 pt-3">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={isGeneratingPreview}
                                    onClick={async () => {
                                      if (geo.status !== 'in_range') return
                                      setIsGeneratingPreview(true)
                                      setGroomingError(null)
                                      setGroomingPreviews(null)

                                      // Use compressed image for faster image-to-image processing
                                      let imageBase64: string | undefined
                                      let imageMimeType: string | undefined
                                      if (petPhotoFile) {
                                        const compressed = await compressImageForAPI(petPhotoFile)
                                        imageBase64 = compressed.base64
                                        imageMimeType = compressed.file.type
                                      }

                                      const result = await generateGroomingPreviewAction(
                                        aiAnalysis.breed,
                                        imageBase64,
                                        imageMimeType,
                                      )
                                      setIsGeneratingPreview(false)
                                      if (result.data && result.data.length > 0) {
                                        setGroomingPreviews(result.data)
                                      } else {
                                        setGroomingError(
                                          result.error ?? 'No se pudo generar la imagen.',
                                        )
                                      }
                                    }}
                                    className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
                                  >
                                    {isGeneratingPreview ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Generando preview...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-3.5 w-3.5" />✨ Generar preview de
                                        corte
                                      </>
                                    )}
                                  </Button>

                                  {groomingError && (
                                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                      {groomingError}
                                    </div>
                                  )}

                                  {isGeneratingPreview && (
                                    <p className="mt-2 text-center text-xs text-slate-500">
                                      La vista previa aparecerá en el panel lateral →
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                          >
                            <Camera className="h-8 w-8 text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-600">
                              Subir foto de tu mascota
                            </span>
                            <span className="text-xs text-slate-400">
                              JPG, PNG o WebP · Máx 5MB
                            </span>
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {isFieldVisible('petName') && (
                          <div className="space-y-2">
                            <Label htmlFor="petName">Nombre de la mascota *</Label>
                            <Input
                              id="petName"
                              placeholder="Max"
                              {...register('petName')}
                              aria-invalid={!!errors.petName}
                              aria-describedby={errors.petName ? 'petName-error' : undefined}
                              className={cn(
                                errors.petName
                                  ? 'border-red-400 focus-visible:ring-red-300'
                                  : touchedFields.petName && !errors.petName
                                    ? 'border-green-400 focus-visible:ring-green-200'
                                    : '',
                              )}
                            />
                            {errors.petName && (
                              <p
                                id="petName-error"
                                role="alert"
                                className="flex items-center gap-1 text-xs text-red-600"
                              >
                                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                                {errors.petName.message}
                              </p>
                            )}
                          </div>
                        )}
                        {isFieldVisible('petBreed') && (
                          <div className="space-y-2">
                            <Label htmlFor="petBreed">Raza</Label>
                            <Input
                              id="petBreed"
                              placeholder="Golden Retriever"
                              {...register('petBreed')}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {isFieldVisible('petAgeYears') && (
                          <div className="space-y-2">
                            <Label htmlFor="petAgeYears">Edad (años)</Label>
                            <Input
                              id="petAgeYears"
                              type="number"
                              min="0"
                              max="30"
                              placeholder="3"
                              {...register('petAgeYears')}
                            />
                          </div>
                        )}
                        {isFieldVisible('petWeightKg') && (
                          <div className="space-y-2">
                            <Label htmlFor="petWeightKg">Peso (kg)</Label>
                            <Input
                              id="petWeightKg"
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="8.5"
                              {...register('petWeightKg')}
                            />
                          </div>
                        )}
                        {isFieldVisible('coatType') && (
                          <div className="space-y-2">
                            <Label>Tipo de pelo</Label>
                            <Select
                              onValueChange={(val) =>
                                setValue('coatType', val as AppointmentFormData['coatType'])
                              }
                              value={watch('coatType') ?? ''}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(coatTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {isFieldVisible('notes') && (
                        <div className="space-y-2">
                          <Label htmlFor="notes-pet">Notas especiales</Label>
                          <Textarea
                            id="notes-pet"
                            placeholder="Alergias, comportamiento especial, condiciones de salud..."
                            rows={3}
                            {...register('notes')}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Service */}
                {currentStep === 'service' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-slate-800">{serviceTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Servicio *</Label>
                        {configLoading ? (
                          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando servicios...
                          </div>
                        ) : enabledServices.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {enabledServices.map((svc) => {
                              const svcType = LANDING_TO_SERVICE_TYPE[svc.id]
                              const isSelected = selectedServiceId === svc.id
                              return (
                                <button
                                  key={svc.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedServiceId(svc.id)
                                    if (svcType) setValue('serviceType', svcType)
                                  }}
                                  className={cn(
                                    'overflow-hidden rounded-xl border-2 text-left transition-all',
                                    isSelected
                                      ? 'border-indigo-600 bg-indigo-50'
                                      : 'border-slate-200 hover:border-indigo-300',
                                  )}
                                >
                                  {svc.imageUrl && (
                                    <div className="relative h-24 w-full">
                                      <Image
                                        src={svc.imageUrl}
                                        alt={svc.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="p-3">
                                    <div className="mb-1 flex items-center gap-2">
                                      {!svc.imageUrl && <span className="text-lg">{svc.icon}</span>}
                                      <span
                                        className={cn(
                                          'text-sm font-medium',
                                          isSelected ? 'text-indigo-700' : 'text-slate-700',
                                        )}
                                      >
                                        {svc.name}
                                      </span>
                                    </div>
                                    <p className="text-xs font-bold text-indigo-600">{svc.price}</p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          // Fallback to static service labels if no enabled services
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(serviceLabels).map(([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setValue(
                                    'serviceType',
                                    value as AppointmentFormData['serviceType'],
                                  )
                                }
                                className={cn(
                                  'rounded-xl border-2 p-3 text-left text-sm font-medium transition-all',
                                  watch('serviceType') === value
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 text-slate-600 hover:border-indigo-300',
                                )}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                        {errors.serviceType && (
                          <p role="alert" className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                            {errors.serviceType.message}
                          </p>
                        )}
                      </div>

                      {isFieldVisible('scheduledAt') && (
                        <div className="space-y-2">
                          <Label htmlFor="scheduledAt">Fecha y hora *</Label>
                          <Input
                            id="scheduledAt"
                            type="datetime-local"
                            {...register('scheduledAt')}
                            min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                            aria-invalid={!!errors.scheduledAt}
                            aria-describedby={
                              errors.scheduledAt ? 'scheduledAt-error' : 'scheduledAt-hint'
                            }
                            className={cn(
                              'min-h-[44px]',
                              errors.scheduledAt
                                ? 'border-red-400 focus-visible:ring-red-300'
                                : touchedFields.scheduledAt && !errors.scheduledAt
                                  ? 'border-green-400 focus-visible:ring-green-200'
                                  : '',
                            )}
                          />
                          <p id="scheduledAt-hint" className="text-xs text-slate-400">
                            Selecciona un día y hora. Las citas deben agendarse con al menos 1 hora
                            de anticipación.
                          </p>
                          {errors.scheduledAt && (
                            <p
                              id="scheduledAt-error"
                              role="alert"
                              className="flex items-center gap-1 text-xs text-red-600"
                            >
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {errors.scheduledAt.message}
                            </p>
                          )}
                        </div>
                      )}

                      {aiAnalysis && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                          <p className="mb-2 text-xs font-semibold text-indigo-700">
                            Recomendaciones IA para {watch('petName')}:
                          </p>
                          <div className="space-y-1.5">
                            {aiAnalysis.recommendations.map((rec, i) => (
                              <div key={i} className="text-xs text-slate-700">
                                <span className="font-medium">{rec.service}</span> —{' '}
                                {rec.estimatedPrice}
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-indigo-600">
                            Tiempo estimado de grooming: {aiAnalysis.estimatedGroomingTime} min
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Confirm */}
                {currentStep === 'confirm' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-slate-800">Resumen de tu cita</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                          Contacto
                        </p>
                        <div className="space-y-2">
                          {[
                            { label: 'Nombre', value: watch('customerName') },
                            { label: 'Correo', value: watch('customerEmail') },
                            { label: 'Teléfono', value: watch('customerPhone') },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="flex justify-between border-b border-slate-100 py-1.5"
                            >
                              <span className="text-sm text-slate-500">{label}</span>
                              <span className="text-sm font-medium text-slate-800">
                                {value || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                          Mascota
                        </p>
                        <div className="space-y-2">
                          {[
                            { label: 'Nombre', value: watch('petName') },
                            {
                              label: 'Raza',
                              value: watch('petBreed') || (aiAnalysis?.breed ?? '—'),
                            },
                            {
                              label: 'Tipo de pelo',
                              value: watch('coatType')
                                ? coatTypeLabels[watch('coatType')!]
                                : (aiAnalysis?.coatType ?? '—'),
                            },
                            {
                              label: 'Edad / Peso',
                              value:
                                [
                                  watch('petAgeYears') ? `${watch('petAgeYears')} años` : null,
                                  watch('petWeightKg') ? `${watch('petWeightKg')} kg` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ') || '—',
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="flex justify-between border-b border-slate-100 py-1.5"
                            >
                              <span className="text-sm text-slate-500">{label}</span>
                              <span className="text-sm font-medium text-slate-800">{value}</span>
                            </div>
                          ))}
                          {petPhotoPreview && (
                            <div className="flex items-center justify-between border-b border-slate-100 py-1.5">
                              <span className="text-sm text-slate-500">Foto</span>
                              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200">
                                <Image
                                  src={petPhotoPreview}
                                  alt="Mascota"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                          Servicio
                        </p>
                        <div className="space-y-2">
                          {[
                            {
                              label: 'Servicio',
                              value: getServiceLabel(
                                watch('serviceType'),
                                services,
                                config.enabledServiceIds,
                              ),
                            },
                            {
                              label: 'Fecha y hora',
                              value: watch('scheduledAt')
                                ? new Intl.DateTimeFormat('es-MX', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                  }).format(new Date(watch('scheduledAt')))
                                : '—',
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="flex justify-between border-b border-slate-100 py-1.5"
                            >
                              <span className="text-sm text-slate-500">{label}</span>
                              <span className="text-sm font-medium text-slate-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {aiAnalysis && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                            <p className="text-xs font-semibold text-indigo-700">Análisis IA</p>
                          </div>
                          <p className="text-xs text-slate-600">
                            <strong>Raza:</strong> {aiAnalysis.breed} · <strong>Condición:</strong>{' '}
                            {aiAnalysis.coatCondition === 'excellent'
                              ? '✅ Excelente'
                              : aiAnalysis.coatCondition === 'good'
                                ? '👍 Buena'
                                : aiAnalysis.coatCondition === 'needs_attention'
                                  ? '⚠️ Necesita atención'
                                  : '🔴 Requiere cuidado'}
                          </p>
                        </div>
                      )}

                      <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        Al confirmar recibirás un correo de confirmación con todos los detalles de
                        tu cita.
                      </div>

                      {submitError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {submitError}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Navigation: mobile: stacked full-width (primary top, secondary bottom) */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="w-full sm:w-auto"
                  >
                    Anterior
                  </Button>
                  {currentStep !== 'confirm' ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="order-first w-full sm:order-none sm:w-auto"
                      style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }}
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      tabIndex={-1}
                      disabled={isSubmitting}
                      className="order-first w-full sm:order-none sm:w-auto sm:min-w-[160px]"
                      style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />✅ Confirmar y Agendar
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Right / Bottom: side panel — pet photo + grooming preview */}
            {hasSidePanel && (
              <div className="w-full shrink-0 space-y-4 lg:sticky lg:top-6 lg:w-72">
                {petPhotoPreview && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-600">Foto actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-44 w-full overflow-hidden rounded-xl">
                        <Image src={petPhotoPreview} alt="Mascota" fill className="object-cover" />
                      </div>
                      {aiAnalysis && (
                        <div className="mt-3 space-y-1 text-xs text-slate-600">
                          <p>
                            <strong>Raza detectada:</strong> {aiAnalysis.breed}
                          </p>
                          <p>
                            <strong>Condición:</strong>{' '}
                            {aiAnalysis.coatCondition === 'excellent'
                              ? '✅ Excelente'
                              : aiAnalysis.coatCondition === 'good'
                                ? '👍 Buena'
                                : aiAnalysis.coatCondition === 'needs_attention'
                                  ? '⚠️ Necesita atención'
                                  : '🔴 Requiere cuidado'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {groomingPreviews && groomingPreviews.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-600">
                        Vista previa del corte
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {groomingPreviews.map((preview) => (
                        <div key={preview.styleId}>
                          <div className="relative h-44 w-full overflow-hidden rounded-xl">
                            <Image
                              src={preview.imageUrl}
                              alt={preview.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-700">{preview.name}</p>
                          <p className="text-xs text-slate-500">{preview.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {isGeneratingPreview && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-600">
                        Vista previa del corte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl bg-slate-100">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                        <p className="text-xs text-slate-500">Generando imagen IA...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
