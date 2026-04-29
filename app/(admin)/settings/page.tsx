'use client'

import { useState, useCallback } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Check, AlertCircle, Sparkles, Bell, MapPin } from 'lucide-react'

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function SaveButton({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <Button
      onClick={onSave}
      disabled={state === 'saving'}
      size="sm"
      className="bg-indigo-600 hover:bg-indigo-700 gap-2 min-w-[120px]"
    >
      {state === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {state === 'success' && <Check className="w-3.5 h-3.5" />}
      {state === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
      {state === 'saving'
        ? 'Guardando...'
        : state === 'success'
        ? 'Guardado'
        : state === 'error'
        ? 'Error'
        : 'Guardar'}
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
    [key, label]
  )

  return { state, save }
}

export default function SettingsPage() {
  const [groomingCount, setGroomingCount] = useState<number>(1)
  const groomingSave = useSectionSave(
    'grooming_image_count',
    'Número de imágenes de corte generadas por IA (1-4)'
  )

  const [salonLat, setSalonLat] = useState<number>(19.1862)
  const [salonLng, setSalonLng] = useState<number>(-98.9477)
  const [salonRadius, setSalonRadius] = useState<number>(1.5)
  const [salonName, setSalonName] = useState<string>('San Salvador Cuauhtenco')
  const locationSave = useSectionSave('salon_location', 'Ubicación del local y radio de cobertura')

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración General</h1>
        <p className="text-slate-500">Ajustes globales de la plataforma</p>
      </div>

      {/* IA & Generación */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">IA &amp; Generación</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Parámetros del motor de generación de imágenes
              </CardDescription>
            </div>
          </div>
          <SaveButton
            state={groomingSave.state}
            onSave={() => groomingSave.save(String(groomingCount))}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500 uppercase tracking-wide">
              Imágenes de corte por análisis
            </Label>
            <Input
              type="number"
              min={1}
              max={4}
              className="max-w-[120px]"
              value={groomingCount}
              onChange={(e) => {
                const val = Math.min(4, Math.max(1, Number(e.target.value)))
                setGroomingCount(isNaN(val) ? 1 : val)
              }}
            />
            <p className="text-xs text-slate-400">
              Número de previews de corte que genera DALL-E al analizar una mascota
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ubicación del local */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Ubicación del local</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Coordenadas y radio de cobertura para la verificación de ubicación
              </CardDescription>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Latitud</Label>
              <Input
                type="number"
                step="any"
                value={salonLat}
                onChange={(e) => setSalonLat(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">Longitud</Label>
              <Input
                type="number"
                step="any"
                value={salonLng}
                onChange={(e) => setSalonLng(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                Radio máximo (km)
              </Label>
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
              <p className="text-xs text-slate-400">
                Clientes fuera de este radio no podrán agendar ni usar IA
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                Nombre del local
              </Label>
              <Input
                type="text"
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
                placeholder="San Salvador Cuauhtenco"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-slate-500">Notificaciones</CardTitle>
              <span className="text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Próximamente
              </span>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Configuración de canales de notificación
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400 uppercase tracking-wide">
              Correo remitente (Resend)
            </Label>
            <Input
              disabled
              placeholder="noreply@tudominio.com"
              className="max-w-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400 uppercase tracking-wide">
              Twilio WhatsApp
            </Label>
            <Input
              disabled
              placeholder="+1 415 523 8886"
              className="max-w-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
