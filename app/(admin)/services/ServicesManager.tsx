'use client'

import { useState, useRef } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Trash2, Loader2, GripVertical, ImagePlus, X } from 'lucide-react'
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
        <Button onClick={openCreate} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </Button>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm text-slate-600">{saveMsg}</span>}
          <Button onClick={saveAll} disabled={saving} variant="outline" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`overflow-hidden rounded-2xl border bg-white transition-opacity ${svc.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}
          >
            {svc.imageUrl ? (
              <div className="relative h-40 w-full">
                <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" />
              </div>
            ) : null}
            <div className={`p-4 ${svc.imageUrl ? '' : ''}`}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 cursor-grab text-slate-300" />
                  {!svc.imageUrl && <span className="text-2xl">{svc.icon}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={svc.active}
                    onCheckedChange={() => toggleActive(svc.id)}
                    aria-label="Activo"
                  />
                  <button
                    onClick={() => openEdit(svc)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(svc.id)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="mb-1 font-semibold text-slate-800">{svc.name}</h3>
              <p className="mb-3 line-clamp-2 text-xs text-slate-500">{svc.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-600">{svc.price}</span>
                {svc.badge && (
                  <Badge className="border-none bg-indigo-100 text-xs text-indigo-700">
                    {svc.badge}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Image upload */}
            <div className="space-y-1.5">
              <Label>Imagen del servicio</Label>
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500 transition-colors hover:bg-red-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-sm font-medium">Subir imagen</span>
                  <span className="text-xs text-slate-400">JPG, PNG o WebP · Máx 2MB</span>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Icono (emoji)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="🐾"
                  className="text-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Badge (opcional)</Label>
                <Input
                  value={form.badge ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value || null }))}
                  placeholder="Popular"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Breve descripción del servicio"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Precio</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="Desde $250"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, active: v }))}
                id="active-switch"
              />
              <Label htmlFor="active-switch">Activo en la página</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={dialogSaving}>
              Cancelar
            </Button>
            <Button
              onClick={saveDialog}
              disabled={!form.name.trim() || dialogSaving}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {dialogSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingService ? 'Guardar cambios' : 'Crear servicio'}
            </Button>
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
