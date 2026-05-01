'use client'

import { useState, useCallback } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, AlertCircle } from 'lucide-react'

interface HeroConfig {
  title?: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

interface ContactConfig {
  phone?: string
  email?: string
  address?: string
}

interface HoursConfig {
  weekdays?: string
  saturday?: string
  sunday?: string
}

interface CmsEditorProps {
  hero: HeroConfig
  contact: ContactConfig
  hours: HoursConfig
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function SectionSaveButton({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <Button
      onClick={onSave}
      disabled={state === 'saving'}
      size="sm"
      className="min-w-[120px] gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
    >
      {state === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === 'success' && <Check className="h-3.5 w-3.5" />}
      {state === 'error' && <AlertCircle className="h-3.5 w-3.5" />}
      {state === 'saving'
        ? 'Guardando...'
        : state === 'success'
          ? 'Guardado'
          : state === 'error'
            ? 'Error'
            : 'Guardar sección'}
    </Button>
  )
}

function useSectionSave(key: string, label: string) {
  const [state, setState] = useState<SaveState>('idle')

  const save = useCallback(
    async (value: unknown) => {
      setState('saving')
      const result = await updateConfigAction(key, value, label)
      setState(result.success ? 'success' : 'error')
      setTimeout(() => setState('idle'), 2500)
    },
    [key, label],
  )

  return { state, save }
}

export function CmsEditor({ hero, contact, hours }: CmsEditorProps) {
  const [heroForm, setHeroForm] = useState<HeroConfig>({ ...hero })
  const [contactForm, setContactForm] = useState<ContactConfig>({ ...contact })
  const [hoursForm, setHoursForm] = useState<HoursConfig>({ ...hours })

  const heroSave = useSectionSave('hero', 'Hero')
  const contactSave = useSectionSave('contact', 'Contacto')
  const hoursSave = useSectionSave('hours', 'Horarios')

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Hero — Portada</CardTitle>
          <SectionSaveButton state={heroSave.state} onSave={() => heroSave.save(heroForm)} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">
              Título principal
            </Label>
            <Input
              value={heroForm.title ?? ''}
              onChange={(e) => setHeroForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tu mascota merece brillar ✨"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">Subtítulo</Label>
            <Input
              value={heroForm.subtitle ?? ''}
              onChange={(e) => setHeroForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="Estética canina de alto nivel..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wide text-slate-500 uppercase">
                Texto CTA primario
              </Label>
              <Input
                value={heroForm.ctaPrimary ?? ''}
                onChange={(e) => setHeroForm((f) => ({ ...f, ctaPrimary: e.target.value }))}
                placeholder="Agendar cita"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs tracking-wide text-slate-500 uppercase">
                Texto CTA secundario
              </Label>
              <Input
                value={heroForm.ctaSecondary ?? ''}
                onChange={(e) => setHeroForm((f) => ({ ...f, ctaSecondary: e.target.value }))}
                placeholder="Ver servicios"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Información de contacto</CardTitle>
          <SectionSaveButton
            state={contactSave.state}
            onSave={() => contactSave.save(contactForm)}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">
              Teléfono / WhatsApp
            </Label>
            <Input
              value={contactForm.phone ?? ''}
              onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">
              Correo electrónico
            </Label>
            <Input
              value={contactForm.email ?? ''}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
              type="email"
              placeholder="hola@pawsandglow.mx"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">Dirección</Label>
            <Input
              value={contactForm.address ?? ''}
              onChange={(e) => setContactForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Calle, Ciudad, Estado"
            />
          </div>
        </CardContent>
      </Card>

      {/* Business hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Horarios de atención</CardTitle>
          <SectionSaveButton state={hoursSave.state} onSave={() => hoursSave.save(hoursForm)} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">
              Lunes – Viernes
            </Label>
            <Input
              value={hoursForm.weekdays ?? ''}
              onChange={(e) => setHoursForm((f) => ({ ...f, weekdays: e.target.value }))}
              placeholder="Lun–Vie: 9:00–19:00"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">Sábado</Label>
            <Input
              value={hoursForm.saturday ?? ''}
              onChange={(e) => setHoursForm((f) => ({ ...f, saturday: e.target.value }))}
              placeholder="Sáb: 9:00–17:00"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs tracking-wide text-slate-500 uppercase">Domingo</Label>
            <Input
              value={hoursForm.sunday ?? ''}
              onChange={(e) => setHoursForm((f) => ({ ...f, sunday: e.target.value }))}
              placeholder="Dom: Cerrado"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
