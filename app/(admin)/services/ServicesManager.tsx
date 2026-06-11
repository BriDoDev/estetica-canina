'use client'

import { useState, useRef } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { Icon } from '@/components/admin/Icon'
import Image from 'next/image'
import type { ServiceItem } from './page'

interface ServicesManagerProps {
  initialServices: ServiceItem[]
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

const EMPTY_FORM: Omit<ServiceItem, 'id'> = {
  icon: '🐾',
  name: '',
  description: '',
  price: 'Desde $0',
  badge: null,
  active: true,
  imageUrl: null,
}

function getStoragePathFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const prefix = '/storage/v1/object/public/landing/'
    if (u.pathname.startsWith(prefix)) {
      return u.pathname.slice(prefix.length)
    }
  } catch {
    // ignore
  }
  return null
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogSaving, setDialogSaving] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<ServiceItem, 'id'>>(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const openCreate = () => {
    setEditingService(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  const openEdit = (svc: ServiceItem) => {
    setEditingService(svc)
    setForm({
      icon: svc.icon,
      name: svc.name,
      description: svc.description,
      price: svc.price,
      badge: svc.badge ?? null,
      active: svc.active,
      imageUrl: svc.imageUrl ?? null,
    })
    setImageFile(null)
    setImagePreview(svc.imageUrl ?? null)
    setDialogOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setForm((f) => ({ ...f, imageUrl: null }))
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const saveDialog = async () => {
    if (!form.name.trim()) return
    setDialogSaving(true)

    try {
      const supabase = createClient()
      let imageUrl = form.imageUrl ?? null

      const serviceId = editingService?.id ?? generateId()

      if (imageFile) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg'
        const path = `services/${serviceId}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('landing')
          .upload(path, imageFile, { upsert: true })

        if (uploadError) {
          alert(`Error al subir imagen: ${uploadError.message}`)
          setDialogSaving(false)
          return
        }

        imageUrl = supabase.storage.from('landing').getPublicUrl(path).data.publicUrl
      }

      const updatedService: ServiceItem = {
        id: serviceId,
        ...form,
        imageUrl,
      }

      if (editingService) {
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? updatedService : s)))
      } else {
        setServices((prev) => [...prev, updatedService])
      }

      setDialogOpen(false)
    } finally {
      setDialogSaving(false)
    }
  }

  const deleteService = async () => {
    if (!deleteId) return
    const svc = services.find((s) => s.id === deleteId)

    if (svc?.imageUrl) {
      try {
        const supabase = createClient()
        const storagePath = getStoragePathFromUrl(svc.imageUrl)
        if (storagePath) {
          await supabase.storage.from('landing').remove([storagePath])
        }
      } catch {
        // non-fatal: image deletion failure shouldn't block service deletion
      }
    }

    setServices((prev) => prev.filter((s) => s.id !== deleteId))
    setDeleteId(null)
  }

  const toggleActive = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }

  const saveAll = async () => {
    setSaving(true)
    setSaveMsg(null)
    const result = await updateConfigAction('services', services, 'Servicios')
    setSaving(false)
    setSaveMsg(result.success ? '✅ Cambios guardados' : `❌ ${result.error}`)
    setTimeout(() => setSaveMsg(null), 3000)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <button type="button" onClick={openCreate} className="ds-btn ds-btn--accent">
          <Icon name="plus" size="sm" />
          Nuevo servicio
        </button>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="ds-t-sm ds-t-muted">{saveMsg}</span>}
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="ds-btn ds-btn--outline"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="ds-grid-3">
        {services.map((svc) => (
          <article
            key={svc.id}
            className="ds-card overflow-hidden"
            style={{ padding: 0, opacity: svc.active ? 1 : 0.6 }}
          >
            {svc.imageUrl && (
              <div className="relative h-40 w-full">
                <Image
                  src={svc.imageUrl}
                  alt={svc.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div style={{ padding: 16 }}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="dots" size="sm" className="ds-t-muted" />
                  {!svc.imageUrl && <span className="text-2xl">{svc.icon}</span>}
                </div>
                <div className="ds-row-actions" style={{ opacity: 1 }}>
                  <Switch
                    checked={svc.active}
                    onCheckedChange={() => toggleActive(svc.id)}
                    aria-label="Activo"
                  />
                  <button
                    type="button"
                    onClick={() => openEdit(svc)}
                    className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                    aria-label="Editar"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(svc.id)}
                    className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                    style={{ color: 'var(--danger)' }}
                    aria-label="Eliminar"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
              <h3 className="ds-t-d4" style={{ marginBottom: 4 }}>
                {svc.name}
              </h3>
              <p className="ds-t-sm ds-t-muted" style={{ marginBottom: 12 }}>
                {svc.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="ds-t-body" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {svc.price}
                </span>
                {svc.badge && <span className="ds-badge ds-badge--accent">{svc.badge}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <div className="ds-stack-3" style={{ paddingBlock: 8 }}>
            <div className="ds-field">
              <label className="ds-field__label">Imagen del servicio</label>
              {imagePreview ? (
                <div className="relative">
                  <div
                    className="relative h-40 w-full overflow-hidden"
                    style={{ borderRadius: 12, border: '1px solid var(--ink-4)' }}
                  >
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    aria-label="Quitar imagen"
                    className="ds-btn ds-btn--icon ds-btn--sm"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'var(--surface)',
                      color: 'var(--danger)',
                    }}
                  >
                    <Icon name="x" size="sm" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2"
                  style={{
                    borderRadius: 12,
                    border: '2px dashed var(--ink-5)',
                    color: 'var(--ink-8)',
                  }}
                >
                  <Icon name="image" size="lg" />
                  <span className="ds-t-body" style={{ fontWeight: 600 }}>
                    Subir imagen
                  </span>
                  <span className="ds-t-xs ds-t-muted">JPG, PNG o WebP · Máx 2MB</span>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div className="ds-grid-2">
              <div className="ds-field">
                <label className="ds-field__label">Icono (emoji)</label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="🐾"
                  className="text-xl"
                />
              </div>
              <div className="ds-field">
                <label className="ds-field__label">Badge (opcional)</label>
                <Input
                  value={form.badge ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value || null }))}
                  placeholder="Popular"
                />
              </div>
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Nombre <span className="ds-req">*</span></label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Descripción</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Breve descripción del servicio"
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Precio</label>
              <Input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="Desde $250"
              />
            </div>
            <label className="ds-row-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, active: v }))}
              />
              <span className="ds-t-body">Activo en la página</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={dialogSaving}>
              Cancelar
            </Button>
            <button
              type="button"
              onClick={saveDialog}
              disabled={!form.name.trim() || dialogSaving}
              className="ds-btn ds-btn--accent"
            >
              {dialogSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingService ? 'Guardar cambios' : 'Crear servicio'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio y su imagen serán eliminados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteService} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
