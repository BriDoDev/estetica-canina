'use client'

import { useState } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react'
import type { ReviewItem } from './page'

interface ReviewsManagerProps {
  initialReviews: ReviewItem[]
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

const EMPTY_REVIEW: Omit<ReviewItem, 'id'> = {
  name: '',
  pet: '',
  comment: '',
  rating: 5,
  active: true,
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="focus:outline-none">
          <Star
            className={`h-6 w-6 transition-colors ${
              n <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<ReviewItem, 'id'>>(EMPTY_REVIEW)

  const openCreate = () => {
    setEditingReview(null)
    setForm(EMPTY_REVIEW)
    setDialogOpen(true)
  }

  const openEdit = (review: ReviewItem) => {
    setEditingReview(review)
    setForm({
      name: review.name,
      pet: review.pet ?? '',
      comment: review.comment,
      rating: review.rating,
      active: review.active,
    })
    setDialogOpen(true)
  }

  const saveDialog = () => {
    if (!form.name.trim() || !form.comment.trim()) return
    if (editingReview) {
      setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? { ...r, ...form } : r)))
    } else {
      setReviews((prev) => [...prev, { id: generateId(), ...form }])
    }
    setDialogOpen(false)
  }

  const deleteReview = () => {
    if (!deleteId) return
    setReviews((prev) => prev.filter((r) => r.id !== deleteId))
    setDeleteId(null)
  }

  const toggleActive = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  const saveAll = async () => {
    setSaving(true)
    setSaveMsg(null)
    const result = await updateConfigAction('reviews', reviews, 'Reseñas')
    setSaving(false)
    setSaveMsg(result.success ? '✅ Cambios guardados' : `❌ ${result.error}`)
    setTimeout(() => setSaveMsg(null), 3000)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Button onClick={openCreate} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Nueva reseña
        </Button>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm text-slate-600">{saveMsg}</span>}
          <Button onClick={saveAll} disabled={saving} variant="outline" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`rounded-2xl border bg-white p-4 transition-opacity ${review.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
                  {review.name
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{review.name}</p>
                  {review.pet && <p className="text-xs text-slate-400">{review.pet}</p>}
                  <div className="my-1.5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600">{review.comment}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Switch
                  checked={review.active}
                  onCheckedChange={() => toggleActive(review.id)}
                  aria-label="Visible"
                />
                <button
                  onClick={() => openEdit(review)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  aria-label="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(review.id)}
                  className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReview ? 'Editar reseña' : 'Nueva reseña'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre del cliente *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="María García"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mascota (opcional)</Label>
              <Input
                value={form.pet ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, pet: e.target.value }))}
                placeholder="Dueña de Luna (Shih Tzu)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Calificación</Label>
              <StarPicker
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Comentario *</Label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Escribe el comentario del cliente..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, active: v }))}
                id="review-active"
              />
              <Label htmlFor="review-active">Visible en la página</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveDialog}
              disabled={!form.name.trim() || !form.comment.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {editingReview ? 'Guardar cambios' : 'Crear reseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reseña será eliminada de la lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteReview} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
