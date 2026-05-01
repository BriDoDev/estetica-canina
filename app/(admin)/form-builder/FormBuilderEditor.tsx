'use client'

import { useState } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import type { FormConfig, FormFieldConfig } from '@/lib/types/form-config'
import { CORE_FIELD_IDS } from '@/lib/types/form-config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { GripVertical, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface LandingService {
  id: string
  icon: string
  name: string
  description: string
  price: string
  badge?: string | null
  active: boolean
  imageUrl?: string | null
}

interface FormBuilderEditorProps {
  initialConfig: FormConfig
  initialServices: LandingService[]
}

const SECTION_LABELS = {
  customer: 'Datos del cliente',
  pet: 'Datos de la mascota',
  service: 'Servicio',
} as const

const FIELD_TYPE_LABELS: Record<FormFieldConfig['type'], string> = {
  text: 'Texto',
  email: 'Email',
  tel: 'Teléfono',
  number: 'Número',
  textarea: 'Área de texto',
  select: 'Selección',
  checkbox: 'Casilla',
  datetime: 'Fecha y hora',
}

const WIDTH_LABELS = {
  full: 'Completo',
  half: 'Mitad',
  third: 'Tercio',
} as const

const EMPTY_NEW_FIELD: Omit<FormFieldConfig, 'id' | 'order'> = {
  type: 'text',
  name: '',
  label: '',
  placeholder: '',
  required: false,
  section: 'customer',
  visible: true,
  width: 'full',
}

function generateFieldId() {
  return `custom_${Math.random().toString(36).slice(2, 8)}`
}

export function FormBuilderEditor({ initialConfig, initialServices }: FormBuilderEditorProps) {
  const [config, setConfig] = useState<FormConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [newField, setNewField] = useState<Omit<FormFieldConfig, 'id' | 'order'>>(EMPTY_NEW_FIELD)

  const showMsg = (msg: string) => {
    setSaveMsg(msg)
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const saveConfig = async () => {
    setSaving(true)
    const result = await updateConfigAction(
      'appointment_form_config',
      config,
      'Configuración del formulario de citas',
    )
    setSaving(false)
    showMsg(result.success ? '✅ Cambios guardados' : `❌ ${result.error}`)
  }

  // ─── Fields tab ──────────────────────────────────────────

  const updateField = (id: string, updates: Partial<FormFieldConfig>) => {
    setConfig((c) => ({
      ...c,
      fields: c.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  }

  const deleteField = (id: string) => {
    if (CORE_FIELD_IDS.includes(id)) return
    setConfig((c) => ({ ...c, fields: c.fields.filter((f) => f.id !== id) }))
  }

  const moveField = (id: string, direction: 'up' | 'down') => {
    setConfig((c) => {
      const field = c.fields.find((f) => f.id === id)
      if (!field) return c
      const sectionFields = c.fields
        .filter((f) => f.section === field.section)
        .sort((a, b) => a.order - b.order)
      const idx = sectionFields.findIndex((f) => f.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sectionFields.length) return c
      const newOrder = sectionFields[swapIdx].order
      const swapOrder = sectionFields[idx].order
      return {
        ...c,
        fields: c.fields.map((f) => {
          if (f.id === id) return { ...f, order: newOrder }
          if (f.id === sectionFields[swapIdx].id) return { ...f, order: swapOrder }
          return f
        }),
      }
    })
  }

  const addCustomField = () => {
    if (!newField.label.trim() || !newField.name.trim()) return
    const sectionFields = config.fields.filter((f) => f.section === newField.section)
    const maxOrder = sectionFields.reduce((m, f) => Math.max(m, f.order), 0)
    const field: FormFieldConfig = {
      ...newField,
      id: generateFieldId(),
      order: maxOrder + 1,
    }
    setConfig((c) => ({ ...c, fields: [...c.fields, field] }))
    setNewField(EMPTY_NEW_FIELD)
    setAddFieldOpen(false)
  }

  // ─── Sections tab ─────────────────────────────────────────

  const updateSection = (
    key: keyof FormConfig['sections'],
    updates: Partial<FormConfig['sections']['customer']>,
  ) => {
    setConfig((c) => ({
      ...c,
      sections: {
        ...c.sections,
        [key]: { ...c.sections[key], ...updates },
      },
    }))
  }

  // ─── Services tab ─────────────────────────────────────────

  const toggleService = (id: string) => {
    setConfig((c) => {
      const enabled = c.enabledServiceIds.includes(id)
      return {
        ...c,
        enabledServiceIds: enabled
          ? c.enabledServiceIds.filter((sid) => sid !== id)
          : [...c.enabledServiceIds, id],
      }
    })
  }

  // ─── Render ───────────────────────────────────────────────

  const renderFieldsForSection = (section: 'customer' | 'pet' | 'service') => {
    const sectionFields = config.fields
      .filter((f) => f.section === section)
      .sort((a, b) => a.order - b.order)

    return sectionFields.map((field, idx) => (
      <div
        key={field.id}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300"
      >
        <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-slate-300" />

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-800">{field.label}</span>
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              {FIELD_TYPE_LABELS[field.type]}
            </Badge>
            {CORE_FIELD_IDS.includes(field.id) && (
              <Badge className="flex-shrink-0 border-none bg-slate-100 text-xs text-slate-500">
                Esencial
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400">{field.name}</p>
        </div>

        {/* Required toggle */}
        <div className="flex flex-shrink-0 flex-col items-center gap-0.5">
          <span className="text-[10px] text-slate-400">Req.</span>
          <Switch
            checked={field.required}
            onCheckedChange={(v) => updateField(field.id, { required: v })}
            disabled={CORE_FIELD_IDS.includes(field.id) && field.required}
          />
        </div>

        {/* Visible toggle */}
        <div className="flex flex-shrink-0 flex-col items-center gap-0.5">
          <span className="text-[10px] text-slate-400">Visible</span>
          <Switch
            checked={field.visible}
            onCheckedChange={(v) => updateField(field.id, { visible: v })}
            disabled={CORE_FIELD_IDS.includes(field.id)}
          />
        </div>

        {/* Width selector */}
        <Select
          value={field.width}
          onValueChange={(val) => updateField(field.id, { width: val as FormFieldConfig['width'] })}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(WIDTH_LABELS).map(([val, lbl]) => (
              <SelectItem key={val} value={val} className="text-xs">
                {lbl}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Order arrows */}
        <div className="flex flex-shrink-0 flex-col gap-0.5">
          <button
            onClick={() => moveField(field.id, 'up')}
            disabled={idx === 0}
            className="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Subir"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveField(field.id, 'down')}
            disabled={idx === sectionFields.length - 1}
            className="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Bajar"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Delete (only non-core) */}
        <button
          onClick={() => deleteField(field.id)}
          disabled={CORE_FIELD_IDS.includes(field.id)}
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Eliminar campo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ))
  }

  // ─── Live Preview ─────────────────────────────────────────

  const renderPreview = () => {
    const sections = (['customer', 'pet', 'service'] as const).filter(
      (s) => config.sections[s].visible,
    )

    return (
      <div className="pointer-events-none mx-auto max-w-xl space-y-4 select-none">
        {/* Step dots */}
        <div className="mb-6 flex items-center gap-2">
          {sections.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold ${i === 0 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-400'}`}
                >
                  {i + 1}
                </div>
                <span className="hidden text-xs text-slate-500 sm:block">
                  {config.sections[s].title || SECTION_LABELS[s]}
                </span>
              </div>
              {i < sections.length - 1 && <div className="h-0.5 flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* First visible section */}
        {sections[0] &&
          (() => {
            const sec = sections[0]
            const fields = config.fields
              .filter((f) => f.section === sec && f.visible)
              .sort((a, b) => a.order - b.order)
            return (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 pt-5 pb-2">
                  <h3 className="font-semibold text-slate-800">
                    {config.sections[sec].title || SECTION_LABELS[sec]}
                  </h3>
                </div>
                <div className="space-y-3 p-5">
                  {sec === 'service' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {initialServices
                          .filter((s) => config.enabledServiceIds.includes(s.id) && s.active)
                          .slice(0, 4)
                          .map((svc) => (
                            <div
                              key={svc.id}
                              className="overflow-hidden rounded-xl border-2 border-slate-200"
                            >
                              {svc.imageUrl && (
                                <div className="relative h-16 w-full">
                                  <Image
                                    src={svc.imageUrl}
                                    alt={svc.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="p-2">
                                <div className="mb-0.5 flex items-center gap-1">
                                  {!svc.imageUrl && <span className="text-sm">{svc.icon}</span>}
                                  <span className="truncate text-xs font-medium text-slate-700">
                                    {svc.name}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-indigo-600">{svc.price}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-slate-100 px-3">
                        <span className="text-xs text-slate-400">Fecha y hora</span>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-6 gap-3">
                      {fields.map((f) => {
                        const span =
                          f.width === 'full'
                            ? 'col-span-6'
                            : f.width === 'half'
                              ? 'col-span-3'
                              : 'col-span-2'
                        return (
                          <div key={f.id} className={span}>
                            <div className="mb-1 text-xs text-slate-500">
                              {f.label}
                              {f.required && <span className="ml-0.5 text-red-400">*</span>}
                            </div>
                            {f.type === 'checkbox' ? (
                              <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-2">
                                <div className="h-3.5 w-3.5 rounded border border-green-400 bg-white" />
                                <span className="truncate text-xs text-green-800">{f.label}</span>
                              </div>
                            ) : f.type === 'textarea' ? (
                              <div className="h-16 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <span className="text-xs text-slate-300">
                                  {f.placeholder ?? '...'}
                                </span>
                              </div>
                            ) : f.type === 'select' ? (
                              <div className="flex h-8 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3">
                                <span className="text-xs text-slate-400">Seleccionar</span>
                                <span className="text-xs text-slate-300">▾</span>
                              </div>
                            ) : (
                              <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                                <span className="text-xs text-slate-300">
                                  {f.placeholder ?? f.label}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

        {/* Nav buttons mockup */}
        <div className="flex justify-between pt-1">
          <div className="h-9 w-24 rounded-lg border border-slate-300 bg-white" />
          <div className="h-9 w-24 rounded-lg bg-indigo-600" />
        </div>

        <p className="text-center text-xs text-slate-400">
          Vista previa del paso 1 · Los cambios se reflejan en tiempo real
        </p>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="fields">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="fields">Campos</TabsTrigger>
            <TabsTrigger value="sections">Secciones</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="preview">👁 Vista previa</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-slate-600">{saveMsg}</span>}
            <Button onClick={saveConfig} disabled={saving} variant="outline" className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </div>

        {/* ── Tab 1: Fields ─────────────────────────────────── */}
        <TabsContent value="fields" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setAddFieldOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Añadir campo
            </Button>
          </div>

          {(['customer', 'pet', 'service'] as const).map((section) => (
            <div key={section}>
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase">
                {SECTION_LABELS[section]}
              </h3>
              <div className="space-y-2">{renderFieldsForSection(section)}</div>
            </div>
          ))}
        </TabsContent>

        {/* ── Tab 2: Sections ───────────────────────────────── */}
        <TabsContent value="sections" className="space-y-4">
          {(['customer', 'pet', 'service'] as const).map((key) => (
            <div key={key} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{SECTION_LABELS[key]}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Visible</span>
                  <Switch
                    checked={config.sections[key].visible}
                    onCheckedChange={(v) => updateSection(key, { visible: v })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Título de la sección</Label>
                <Input
                  value={config.sections[key].title}
                  onChange={(e) => updateSection(key, { title: e.target.value })}
                  placeholder={`Título para ${SECTION_LABELS[key]}`}
                />
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ── Tab 3: Services ───────────────────────────────── */}
        <TabsContent value="services" className="space-y-3">
          <p className="text-sm text-slate-500">
            Selecciona qué servicios aparecen como opciones en el formulario de citas.
          </p>
          {initialServices.length === 0 && (
            <p className="text-sm text-slate-400 italic">
              No hay servicios configurados. Ve a la sección &quot;Servicios&quot; para añadirlos.
            </p>
          )}
          {initialServices.map((svc) => {
            const isEnabled = config.enabledServiceIds.includes(svc.id)
            return (
              <div
                key={svc.id}
                className={`flex items-center gap-4 rounded-xl border bg-white p-3 transition-colors ${
                  isEnabled ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 opacity-60'
                }`}
              >
                <input
                  type="checkbox"
                  id={`svc-${svc.id}`}
                  checked={isEnabled}
                  onChange={() => toggleService(svc.id)}
                  className="h-4 w-4 flex-shrink-0 accent-indigo-600"
                />
                {svc.imageUrl ? (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" />
                  </div>
                ) : (
                  <span className="flex-shrink-0 text-2xl">{svc.icon}</span>
                )}
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`svc-${svc.id}`}
                    className="cursor-pointer text-sm font-medium text-slate-800"
                  >
                    {svc.name}
                  </label>
                  <p className="truncate text-xs text-slate-500">{svc.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-indigo-600">{svc.price}</p>
                  {!svc.active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </TabsContent>

        {/* ── Tab 4: Preview ────────────────────────────────── */}
        <TabsContent value="preview">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="mb-6 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Preview en vivo — Paso 1
            </p>
            {renderPreview()}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add field Dialog */}
      <Dialog open={addFieldOpen} onOpenChange={setAddFieldOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir campo personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de campo</Label>
                <Select
                  value={newField.type}
                  onValueChange={(v) =>
                    setNewField((f) => ({ ...f, type: v as FormFieldConfig['type'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPE_LABELS).map(([val, lbl]) => (
                      <SelectItem key={val} value={val}>
                        {lbl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sección</Label>
                <Select
                  value={newField.section}
                  onValueChange={(v) =>
                    setNewField((f) => ({ ...f, section: v as FormFieldConfig['section'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTION_LABELS).map(([val, lbl]) => (
                      <SelectItem key={val} value={val}>
                        {lbl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Etiqueta *</Label>
              <Input
                value={newField.label}
                onChange={(e) => setNewField((f) => ({ ...f, label: e.target.value }))}
                placeholder="Ej: Número de cédula"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Nombre del campo * <span className="text-xs text-slate-400">(sin espacios)</span>
              </Label>
              <Input
                value={newField.name}
                onChange={(e) =>
                  setNewField((f) => ({ ...f, name: e.target.value.replace(/\s/g, '_') }))
                }
                placeholder="Ej: cedula_number"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Placeholder</Label>
              <Input
                value={newField.placeholder ?? ''}
                onChange={(e) => setNewField((f) => ({ ...f, placeholder: e.target.value }))}
                placeholder="Texto de ejemplo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ancho</Label>
                <Select
                  value={newField.width}
                  onValueChange={(v) =>
                    setNewField((f) => ({ ...f, width: v as FormFieldConfig['width'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WIDTH_LABELS).map(([val, lbl]) => (
                      <SelectItem key={val} value={val}>
                        {lbl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  id="new-required"
                  checked={newField.required}
                  onCheckedChange={(v) => setNewField((f) => ({ ...f, required: v }))}
                />
                <Label htmlFor="new-required">Requerido</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFieldOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={addCustomField}
              disabled={!newField.label.trim() || !newField.name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Añadir campo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
