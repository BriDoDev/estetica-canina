'use client'

import { useCallback, useState } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { Icon } from '@/components/admin/Icon'

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
    <button
      type="button"
      onClick={onSave}
      disabled={state === 'saving'}
      className="ds-btn ds-btn--sm ds-btn--accent"
      style={{ minWidth: 130 }}
    >
      {state === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {state === 'success' && <Icon name="check" size="sm" />}
      {state === 'error' && <Icon name="alert" size="sm" />}
      {state === 'saving'
        ? 'Guardando…'
        : state === 'success'
          ? 'Guardado'
          : state === 'error'
            ? 'Error'
            : 'Guardar sección'}
    </button>
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
    <div className="ds-stack-6">
      <section className="ds-card">
        <div className="ds-card-head">
          <div>
            <div className="ds-card-head__title">Hero — Portada</div>
            <div className="ds-card-head__sub">Título, subtítulo y CTAs visibles en la landing.</div>
          </div>
          <SectionSaveButton state={heroSave.state} onSave={() => heroSave.save(heroForm)} />
        </div>
        <div className="ds-stack-3">
          <div className="ds-field">
            <label className="ds-field__label">Título principal</label>
            <Input
              value={heroForm.title ?? ''}
              onChange={(e) => setHeroForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tu mascota merece brillar ✨"
            />
          </div>
          <div className="ds-field">
            <label className="ds-field__label">Subtítulo</label>
            <Input
              value={heroForm.subtitle ?? ''}
              onChange={(e) => setHeroForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="Estética canina de alto nivel…"
            />
          </div>
          <div className="ds-grid-2">
            <div className="ds-field">
              <label className="ds-field__label">CTA primario</label>
              <Input
                value={heroForm.ctaPrimary ?? ''}
                onChange={(e) => setHeroForm((f) => ({ ...f, ctaPrimary: e.target.value }))}
                placeholder="Agendar cita"
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">CTA secundario</label>
              <Input
                value={heroForm.ctaSecondary ?? ''}
                onChange={(e) => setHeroForm((f) => ({ ...f, ctaSecondary: e.target.value }))}
                placeholder="Ver servicios"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="ds-card">
        <div className="ds-card-head">
          <div>
            <div className="ds-card-head__title">Información de contacto</div>
            <div className="ds-card-head__sub">Datos visibles en el footer.</div>
          </div>
          <SectionSaveButton
            state={contactSave.state}
            onSave={() => contactSave.save(contactForm)}
          />
        </div>
        <div className="ds-stack-3">
          <div className="ds-field">
            <label className="ds-field__label">Teléfono / WhatsApp</label>
            <Input
              value={contactForm.phone ?? ''}
              onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="ds-field">
            <label className="ds-field__label">Correo electrónico</label>
            <Input
              type="email"
              value={contactForm.email ?? ''}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="hola@pawsandglow.mx"
            />
          </div>
          <div className="ds-field">
            <label className="ds-field__label">Dirección</label>
            <Input
              value={contactForm.address ?? ''}
              onChange={(e) => setContactForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Calle, Ciudad, Estado"
            />
          </div>
        </div>
      </section>

      <section className="ds-card">
        <div className="ds-card-head">
          <div>
            <div className="ds-card-head__title">Horarios de atención</div>
            <div className="ds-card-head__sub">Aparecen en el footer y en confirmaciones.</div>
          </div>
          <SectionSaveButton state={hoursSave.state} onSave={() => hoursSave.save(hoursForm)} />
        </div>
        <div className="ds-stack-3">
          <div className="ds-field">
            <label className="ds-field__label">Lunes – Viernes</label>
            <Input
              value={hoursForm.weekdays ?? ''}
              onChange={(e) => setHoursForm((f) => ({ ...f, weekdays: e.target.value }))}
              placeholder="Lun–Vie: 9:00–19:00"
            />
          </div>
          <div className="ds-field">
            <label className="ds-field__label">Sábado</label>
            <Input
              value={hoursForm.saturday ?? ''}
              onChange={(e) => setHoursForm((f) => ({ ...f, saturday: e.target.value }))}
              placeholder="Sáb: 9:00–17:00"
            />
          </div>
          <div className="ds-field">
            <label className="ds-field__label">Domingo</label>
            <Input
              value={hoursForm.sunday ?? ''}
              onChange={(e) => setHoursForm((f) => ({ ...f, sunday: e.target.value }))}
              placeholder="Dom: Cerrado"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
