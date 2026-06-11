'use client'

import { useCallback, useEffect, useState } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { Icon } from '@/components/admin/Icon'

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function SaveButton({ state, onSave }: { state: SaveState; onSave: () => void }) {
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
            : 'Guardar'}
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

export default function SettingsPage() {
  const [groomingCount, setGroomingCount] = useState<number>(1)
  const groomingSave = useSectionSave(
    'grooming_image_count',
    'Número de imágenes de corte generadas por IA (1-4)',
  )

  const [salonLat, setSalonLat] = useState<number>(19.1862)
  const [salonLng, setSalonLng] = useState<number>(-98.9477)
  const [salonRadius, setSalonRadius] = useState<number>(1.5)
  const [salonName, setSalonName] = useState<string>('San Salvador Cuauhtenco')
  const locationSave = useSectionSave('salon_location', 'Ubicación del local y radio de cobertura')

  useEffect(() => {
    fetch('/api/form-config')
      .then((r) => r.json())
      .then((data: { groomingImageCount?: number }) => {
        if (typeof data.groomingImageCount === 'number') {
          setGroomingCount(Math.min(4, Math.max(1, data.groomingImageCount)))
        }
      })
      .catch(() => {})
    fetch('/api/salon-location')
      .then((r) => r.json())
      .then((data: { lat?: number; lng?: number; radiusKm?: number; name?: string }) => {
        if (typeof data.lat === 'number') setSalonLat(data.lat)
        if (typeof data.lng === 'number') setSalonLng(data.lng)
        if (typeof data.radiusKm === 'number') setSalonRadius(data.radiusKm)
        if (data.name) setSalonName(data.name)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="ds-stack-6" style={{ maxWidth: 760 }}>
      <header className="ds-stack-2">
        <h1 className="ds-t-d1">Configuración General</h1>
        <p className="ds-t-body ds-t-muted">Ajustes globales de la plataforma.</p>
      </header>

      {/* IA & generación */}
      <section className="ds-card">
        <div className="ds-card-head">
          <div className="flex items-center gap-3">
            <div
              className="ds-avatar ds-avatar--lg ds-avatar-pet"
              style={{ borderRadius: 10 }}
            >
              <Icon name="sparkle" />
            </div>
            <div>
              <div className="ds-card-head__title">IA &amp; Generación</div>
              <div className="ds-card-head__sub">
                Parámetros del motor de generación de imágenes.
              </div>
            </div>
          </div>
          <SaveButton
            state={groomingSave.state}
            onSave={() => groomingSave.save(String(groomingCount))}
          />
        </div>
        <div className="ds-stack-3">
          <div className="ds-field">
            <label className="ds-field__label">Imágenes de corte por análisis</label>
            <div className="ds-btn-group">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGroomingCount(n)}
                  className={`ds-btn${groomingCount === n ? ' is-on' : ''}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="ds-field__help">
              Número de previews de corte que genera DALL-E al analizar una mascota.
            </p>
          </div>
        </div>
      </section>

      {/* Ubicación del local */}
      <section className="ds-card">
        <div className="ds-card-head">
          <div className="flex items-center gap-3">
            <div
              className="ds-avatar ds-avatar--lg"
              style={{
                borderRadius: 10,
                background: 'var(--success-soft)',
                color: 'var(--success)',
              }}
            >
              <Icon name="home" />
            </div>
            <div>
              <div className="ds-card-head__title">Ubicación del local</div>
              <div className="ds-card-head__sub">
                Coordenadas y radio de cobertura para la verificación de ubicación.
              </div>
            </div>
          </div>
          <SaveButton
            state={locationSave.state}
            onSave={() =>
              locationSave.save({
                lat: salonLat,
                lng: salonLng,
                radiusKm: salonRadius,
                name: salonName,
              })
            }
          />
        </div>
        <div className="ds-stack-3">
          <div className="ds-grid-2">
            <div className="ds-field">
              <label className="ds-field__label">Latitud</label>
              <Input
                type="number"
                step="any"
                value={salonLat}
                onChange={(e) => setSalonLat(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Longitud</label>
              <Input
                type="number"
                step="any"
                value={salonLng}
                onChange={(e) => setSalonLng(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="ds-grid-2">
            <div className="ds-field">
              <label className="ds-field__label">Radio máximo (km)</label>
              <Input
                type="number"
                min={0.1}
                max={50}
                step={0.1}
                value={salonRadius}
                onChange={(e) => {
                  const val = Math.min(50, Math.max(0.1, parseFloat(e.target.value) || 0.1))
                  setSalonRadius(isNaN(val) ? 1.5 : val)
                }}
              />
              <p className="ds-field__help">
                Clientes fuera de este radio no podrán agendar ni usar IA.
              </p>
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Nombre del local</label>
              <Input
                type="text"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                placeholder="San Salvador Cuauhtenco"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notificaciones — disabled */}
      <section className="ds-card" style={{ opacity: 0.6 }}>
        <div className="ds-card-head">
          <div className="flex items-center gap-3">
            <div
              className="ds-avatar ds-avatar--lg"
              style={{ borderRadius: 10, background: 'var(--ink-3)', color: 'var(--ink-7)' }}
            >
              <Icon name="bell" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="ds-card-head__title">Notificaciones</div>
                <span className="ds-badge">Próximamente</span>
              </div>
              <div className="ds-card-head__sub">
                Configuración de canales de notificación.
              </div>
            </div>
          </div>
        </div>
        <div className="ds-stack-3">
          <div className="ds-field">
            <label className="ds-field__label">Correo remitente (Resend)</label>
            <Input disabled placeholder="noreply@tudominio.com" style={{ maxWidth: 360 }} />
          </div>
          <div className="ds-field">
            <label className="ds-field__label">Twilio WhatsApp</label>
            <Input disabled placeholder="+1 415 523 8886" style={{ maxWidth: 360 }} />
          </div>
        </div>
      </section>
    </div>
  )
}
