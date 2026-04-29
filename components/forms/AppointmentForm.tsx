'use client'

import { useState, useRef, useCallback, useTransition } from 'react'
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
import {
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react'
import Image from 'next/image'
import { PawLoader } from '@/components/ui/PawLoader'
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
  '4': 'nail_trim',
  '5': 'nail_trim',
  '6': 'full_grooming',
}

function getServiceLabel(serviceType: AppointmentFormData['serviceType'] | undefined, services: LandingService[], enabledIds: string[]): string {
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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [groomingPreviews, setGroomingPreviews] = useState<
    { styleId: string; name: string; description: string; imageUrl: string }[] | null
  >(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [groomingError, setGroomingError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
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
    (s) => config.enabledServiceIds.includes(s.id) && s.active
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
        setAiError('Solo se aceptan imágenes JPG, PNG o WebP. Si estás en iPhone, selecciona "Compatibilidad máxima" en Ajustes > Cámara.')
        return
      }

      setPetPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPetPhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      startTransition(async () => {
        setIsAnalyzing(true)
        setAiAnalysis(null)
        setAiError(null)
        try {
          const fd = new FormData()
          fd.append('petPhoto', file)
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
                result.data!.coatType.toLowerCase().includes(key)
              )
              if (detectedCoat) setValue('coatType', detectedCoat[1])
            }
          } else if (result.error) {
            setAiError(result.error)
          }
        } catch (err) {
          console.error('[AI analysis]', err)
          setAiError('No se pudo analizar la foto. Verifica que OPENAI_API_KEY esté configurada en .env.local. Puedes continuar sin el análisis.')
        } finally {
          setIsAnalyzing(false)
        }
      })
    },
    [setValue, geo.status]
  )

  const removePhoto = useCallback(() => {
    setPetPhotoFile(null)
    setPetPhotoPreview(null)
    setAiAnalysis(null)
    setGroomingPreviews(null)
    setGroomingError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const nextStep = async () => {
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
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'petPhotoFile') {
          formData.append(key, String(value))
        }
      })
      if (petPhotoFile) formData.append('petPhotoFile', petPhotoFile)

      const result = await createAppointmentAction(formData)
      if (result.error) setSubmitError(result.error)
      else setSubmitSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">¡Cita agendada!</h2>
          <p className="text-center text-slate-600">
            Recibirás una confirmación en tu correo. Te esperamos con{' '}
            <strong>{watch('petName')}</strong> el día de tu cita.
          </p>
          <Button
            onClick={() => { setSubmitSuccess(false); setCurrentStep('customer') }}
            variant="outline"
          >
            Agendar otra cita
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasSidePanel = !!(petPhotoPreview || aiAnalysis || isGeneratingPreview || (groomingPreviews && groomingPreviews.length > 0))

  const GeoStatusBanner = () => {
    if (geo.status === 'idle' || geo.status === 'requesting') {
      return (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-blue-800 text-sm">
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0 text-blue-500" />
          <div>
            <p className="font-semibold">Verificando tu ubicación...</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Necesitamos confirmar que estás cerca del local para continuar.
            </p>
          </div>
        </div>
      )
    }
    if (
      geo.status === 'denied' ||
      geo.status === 'out_of_range' ||
      geo.status === 'unavailable'
    ) {
      return (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">
              {geo.status === 'denied'
                ? 'Ubicación no permitida'
                : geo.status === 'out_of_range'
                ? 'Fuera del área de servicio'
                : 'No se pudo verificar ubicación'}
            </p>
            <p className="text-xs text-red-600 mt-0.5">{geo.errorMsg}</p>
            {geo.status === 'denied' && (
              <p className="text-xs text-red-500 mt-1">
                Activa los permisos de ubicación en tu navegador y recarga la página.
              </p>
            )}
          </div>
        </div>
      )
    }
    if (geo.status === 'in_range') {
      return (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-6 text-green-800 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-500" />
          <p className="text-xs">
            <span className="font-semibold">Ubicación verificada</span>
            {geo.distanceKm !== null && ` · A ${geo.distanceKm} km de ${geo.salonName}`}
          </p>
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

      <div ref={formTopRef} className="max-w-5xl mx-auto scroll-mt-8">
        {geo.status !== 'in_range' ? (
          <div className="max-w-lg mx-auto py-8">
            <GeoStatusBanner />
            {(geo.status === 'denied' || geo.status === 'out_of_range') && (
              <p className="text-slate-500 text-sm text-center mt-2">
                El formulario estará disponible cuando tu ubicación sea verificada.
              </p>
            )}
          </div>
        ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left: step indicator + form */}
          <div className="flex-1 min-w-0">
            <GeoStatusBanner />
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-colors',
                      idx <= currentStepIndex ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                        idx < currentStepIndex
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : idx === currentStepIndex
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-slate-300 text-slate-400'
                      )}
                    >
                      {idx < currentStepIndex ? '✓' : idx + 1}
                    </div>
                    <span className="hidden sm:block">{stepLabels[step]}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 transition-colors',
                        idx < currentStepIndex ? 'bg-indigo-600' : 'bg-slate-200'
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
                          aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                          className={cn(
                            errors.customerName
                              ? 'border-red-400 focus-visible:ring-red-300'
                              : touchedFields.customerName && !errors.customerName
                              ? 'border-green-400 focus-visible:ring-green-200'
                              : ''
                          )}
                        />
                        {errors.customerName && (
                          <p id="customerName-error" role="alert" className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
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
                          aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
                          className={cn(
                            errors.customerEmail
                              ? 'border-red-400 focus-visible:ring-red-300'
                              : touchedFields.customerEmail && !errors.customerEmail
                              ? 'border-green-400 focus-visible:ring-green-200'
                              : ''
                          )}
                        />
                        {errors.customerEmail && (
                          <p id="customerEmail-error" role="alert" className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
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
                          aria-describedby={errors.customerPhone ? 'customerPhone-error' : undefined}
                          className={cn(
                            errors.customerPhone
                              ? 'border-red-400 focus-visible:ring-red-300'
                              : touchedFields.customerPhone && !errors.customerPhone
                              ? 'border-green-400 focus-visible:ring-green-200'
                              : ''
                          )}
                        />
                        {errors.customerPhone && (
                          <p id="customerPhone-error" role="alert" className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            {errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isFieldVisible('whatsappOptIn') && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <input
                          id="whatsappOptIn"
                          type="checkbox"
                          {...register('whatsappOptIn')}
                          className="w-4 h-4 accent-green-600"
                        />
                        <Label htmlFor="whatsappOptIn" className="text-sm text-green-800 cursor-pointer">
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
                          <div className="flex items-center gap-3 p-2.5 bg-indigo-50 rounded-xl border border-indigo-200">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={petPhotoPreview} alt="Foto de la mascota" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-indigo-800">Foto cargada</p>
                              <p className="text-xs text-slate-500 truncate">
                                {petPhotoFile?.name ?? 'imagen'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="w-7 h-7 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {isAnalyzing && (
                            <div className="mt-2 flex items-center gap-2 text-indigo-600 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analizando foto con IA... (puede tardar unos segundos)
                            </div>
                          )}
                          {aiError && !isAnalyzing && (
                            <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-xs">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              {aiError}
                            </div>
                          )}
                          {aiAnalysis && !isAnalyzing && (
                            <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                <span className="font-semibold text-indigo-800 text-sm">Análisis IA completado</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-slate-700">
                                <div><strong>Raza:</strong> {aiAnalysis.breed}</div>
                                <div><strong>Edad est.:</strong> {aiAnalysis.estimatedAge}</div>
                                <div><strong>Tipo de pelo:</strong> {aiAnalysis.coatType}</div>
                                <div>
                                  <strong>Estado:</strong>{' '}
                                  <Badge
                                    variant={
                                      aiAnalysis.coatCondition === 'excellent' || aiAnalysis.coatCondition === 'good'
                                        ? 'default'
                                        : 'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {aiAnalysis.coatCondition === 'excellent' ? 'Excelente' :
                                     aiAnalysis.coatCondition === 'good' ? 'Bueno' :
                                     aiAnalysis.coatCondition === 'needs_attention' ? 'Necesita atención' : 'Requiere cuidado'}
                                  </Badge>
                                </div>
                              </div>
                              {aiAnalysis.urgentCare && (
                                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  {aiAnalysis.urgentCare}
                                </div>
                              )}
                              <div className="mt-2 space-y-1.5">
                                {aiAnalysis.recommendations.map((rec, i) => (
                                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                    <Badge
                                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                                      className="text-xs flex-shrink-0"
                                    >
                                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                                    </Badge>
                                    <span>{rec.service}: {rec.description}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 pt-3 border-t border-indigo-200">
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={isGeneratingPreview}
                                  onClick={async () => {
                                    if (geo.status !== 'in_range') return
                                    setIsGeneratingPreview(true)
                                    setGroomingError(null)
                                    setGroomingPreviews(null)

                                    let imageBase64: string | undefined
                                    let imageMimeType: string | undefined
                                    if (petPhotoFile) {
                                      const arrayBuffer = await petPhotoFile.arrayBuffer()
                                      imageBase64 = Buffer.from(arrayBuffer).toString('base64')
                                      imageMimeType = petPhotoFile.type
                                    }

                                    const result = await generateGroomingPreviewAction(
                                      aiAnalysis.breed,
                                      imageBase64,
                                      imageMimeType
                                    )
                                    setIsGeneratingPreview(false)
                                    if (result.data && result.data.length > 0) {
                                      setGroomingPreviews(result.data)
                                    } else {
                                      setGroomingError(result.error ?? 'No se pudo generar la imagen.')
                                    }
                                  }}
                                  className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
                                >
                                  {isGeneratingPreview ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      Generando preview...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      ✨ Generar preview de corte
                                    </>
                                  )}
                                </Button>

                                {groomingError && (
                                  <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-700 text-xs">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    {groomingError}
                                  </div>
                                )}

                                {isGeneratingPreview && (
                                  <p className="mt-2 text-xs text-slate-500 text-center">
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
                          className="w-full h-36 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                        >
                          <Camera className="w-8 h-8 text-indigo-400" />
                          <span className="text-sm text-indigo-600 font-medium">Subir foto de tu mascota</span>
                          <span className="text-xs text-slate-400">JPG, PNG o WebP · Máx 5MB</span>
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
                                : ''
                            )}
                          />
                          {errors.petName && (
                            <p id="petName-error" role="alert" className="flex items-center gap-1 text-red-600 text-xs">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                              {errors.petName.message}
                            </p>
                          )}
                        </div>
                      )}
                      {isFieldVisible('petBreed') && (
                        <div className="space-y-2">
                          <Label htmlFor="petBreed">Raza</Label>
                          <Input id="petBreed" placeholder="Golden Retriever" {...register('petBreed')} />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {isFieldVisible('petAgeYears') && (
                        <div className="space-y-2">
                          <Label htmlFor="petAgeYears">Edad (años)</Label>
                          <Input id="petAgeYears" type="number" min="0" max="30" placeholder="3" {...register('petAgeYears')} />
                        </div>
                      )}
                      {isFieldVisible('petWeightKg') && (
                        <div className="space-y-2">
                          <Label htmlFor="petWeightKg">Peso (kg)</Label>
                          <Input id="petWeightKg" type="number" min="0.1" step="0.1" placeholder="8.5" {...register('petWeightKg')} />
                        </div>
                      )}
                      {isFieldVisible('coatType') && (
                        <div className="space-y-2">
                          <Label>Tipo de pelo</Label>
                          <Select
                            onValueChange={(val) => setValue('coatType', val as AppointmentFormData['coatType'])}
                            value={watch('coatType') ?? ''}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(coatTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
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
                        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cargando servicios...
                        </div>
                      ) : enabledServices.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {enabledServices.map((svc) => {
                            const svcType = LANDING_TO_SERVICE_TYPE[svc.id]
                            const isSelected = svcType && watch('serviceType') === svcType
                            return (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={() => {
                                  if (svcType) setValue('serviceType', svcType)
                                }}
                                className={cn(
                                  'rounded-xl border-2 text-left transition-all overflow-hidden',
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-slate-200 hover:border-indigo-300'
                                )}
                              >
                                {svc.imageUrl && (
                                  <div className="relative w-full h-24">
                                    <Image
                                      src={svc.imageUrl}
                                      alt={svc.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    {!svc.imageUrl && <span className="text-lg">{svc.icon}</span>}
                                    <span className={cn('text-sm font-medium', isSelected ? 'text-indigo-700' : 'text-slate-700')}>
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
                              onClick={() => setValue('serviceType', value as AppointmentFormData['serviceType'])}
                              className={cn(
                                'p-3 rounded-xl border-2 text-sm font-medium text-left transition-all',
                                watch('serviceType') === value
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.serviceType && (
                        <p role="alert" className="flex items-center gap-1 text-red-600 text-xs">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
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
                          aria-describedby={errors.scheduledAt ? 'scheduledAt-error' : undefined}
                          className={cn(
                            errors.scheduledAt
                              ? 'border-red-400 focus-visible:ring-red-300'
                              : touchedFields.scheduledAt && !errors.scheduledAt
                              ? 'border-green-400 focus-visible:ring-green-200'
                              : ''
                          )}
                        />
                        {errors.scheduledAt && (
                          <p id="scheduledAt-error" role="alert" className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            {errors.scheduledAt.message}
                          </p>
                        )}
                      </div>
                    )}

                    {aiAnalysis && (
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-700 mb-2">
                          Recomendaciones IA para {watch('petName')}:
                        </p>
                        <div className="space-y-1.5">
                          {aiAnalysis.recommendations.map((rec, i) => (
                            <div key={i} className="text-xs text-slate-700">
                              <span className="font-medium">{rec.service}</span> — {rec.estimatedPrice}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-indigo-600 mt-2">
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
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contacto</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Nombre', value: watch('customerName') },
                          { label: 'Correo', value: watch('customerEmail') },
                          { label: 'Teléfono', value: watch('customerPhone') },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-sm text-slate-500">{label}</span>
                            <span className="text-sm font-medium text-slate-800">{value || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mascota</p>
                      <div className="space-y-2">
                        {[
                          { label: 'Nombre', value: watch('petName') },
                          { label: 'Raza', value: watch('petBreed') || (aiAnalysis?.breed ?? '—') },
                          {
                            label: 'Tipo de pelo',
                            value: watch('coatType') ? coatTypeLabels[watch('coatType')!] : (aiAnalysis?.coatType ?? '—'),
                          },
                          {
                            label: 'Edad / Peso',
                            value: [
                              watch('petAgeYears') ? `${watch('petAgeYears')} años` : null,
                              watch('petWeightKg') ? `${watch('petWeightKg')} kg` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || '—',
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-sm text-slate-500">{label}</span>
                            <span className="text-sm font-medium text-slate-800">{value}</span>
                          </div>
                        ))}
                        {petPhotoPreview && (
                          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                            <span className="text-sm text-slate-500">Foto</span>
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                              <Image src={petPhotoPreview} alt="Mascota" fill className="object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Servicio</p>
                      <div className="space-y-2">
                        {[
                          {
                            label: 'Servicio',
                            value: getServiceLabel(watch('serviceType'), services, config.enabledServiceIds),
                          },
                          {
                            label: 'Fecha y hora',
                            value: watch('scheduledAt')
                              ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(
                                  new Date(watch('scheduledAt'))
                                )
                              : '—',
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-sm text-slate-500">{label}</span>
                            <span className="text-sm font-medium text-slate-800">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {aiAnalysis && (
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <p className="text-xs font-semibold text-indigo-700">Análisis IA</p>
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong>Raza:</strong> {aiAnalysis.breed} ·{' '}
                          <strong>Condición:</strong>{' '}
                          {aiAnalysis.coatCondition === 'excellent' ? '✅ Excelente' :
                           aiAnalysis.coatCondition === 'good' ? '👍 Buena' :
                           aiAnalysis.coatCondition === 'needs_attention' ? '⚠️ Necesita atención' : '🔴 Requiere cuidado'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-200 text-green-800 text-xs">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Al confirmar recibirás un correo de confirmación con todos los detalles de tu cita.
                    </div>

                    {submitError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {submitError}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStepIndex === 0}>
                  Anterior
                </Button>
                {currentStep !== 'confirm' ? (
                  <Button type="button" onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    tabIndex={-1}
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 min-w-[160px]"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ✅ Confirmar y Agendar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Right / Bottom: side panel — pet photo + grooming preview */}
          {hasSidePanel && (
            <div className="w-full lg:w-72 lg:sticky lg:top-6 space-y-4 shrink-0">
              {petPhotoPreview && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-600">Foto actual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-44 rounded-xl overflow-hidden">
                      <Image src={petPhotoPreview} alt="Mascota" fill className="object-cover" />
                    </div>
                    {aiAnalysis && (
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p><strong>Raza detectada:</strong> {aiAnalysis.breed}</p>
                        <p>
                          <strong>Condición:</strong>{' '}
                          {aiAnalysis.coatCondition === 'excellent' ? '✅ Excelente' :
                           aiAnalysis.coatCondition === 'good' ? '👍 Buena' :
                           aiAnalysis.coatCondition === 'needs_attention' ? '⚠️ Necesita atención' : '🔴 Requiere cuidado'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {groomingPreviews && groomingPreviews.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-600">Vista previa del corte</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {groomingPreviews.map((preview) => (
                      <div key={preview.styleId}>
                        <div className="relative w-full h-44 rounded-xl overflow-hidden">
                          <Image src={preview.imageUrl} alt={preview.name} fill className="object-cover" />
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
                    <CardTitle className="text-sm text-slate-600">Vista previa del corte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-44 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
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
