'use client'

import { useState } from 'react'
import { updateConfigAction } from '@/app/actions/landing-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2 } from 'lucide-react'
import { Icon } from '@/components/admin/Icon'
import type { ReviewItem } from './page'

interface ReviewsManagerProps {
  initialReviews: ReviewItem[]
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
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
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          style={{
            fontSize: 22,
            lineHeight: 1,
            color: n <= value ? 'var(--accent)' : 'var(--ink-5)',
            background: 'transparent',
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--accent)', letterSpacing: '2px', fontSize: 13 }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--ink-5)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
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
        <button type="button" onClick={openCreate} className="ds-btn ds-btn--accent">
          <Icon name="plus" size="sm" />
          Nueva reseña
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

      <div className="ds-stack-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="ds-card"
            style={review.active ? undefined : { opacity: 0.6 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="ds-avatar ds-avatar--md ds-avatar-pet">
                  {initialsFor(review.name)}
                </div>
                <div className="min-w-0">
                  <p className="ds-t-d4" style={{ marginBottom: 2 }}>
                    {review.name}
                  </p>
                  {review.pet && <p className="ds-t-xs ds-t-muted">{review.pet}</p>}
                  <div style={{ marginTop: 4, marginBottom: 6 }}>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="ds-t-sm ds-t-muted">{review.comment}</p>
                </div>
              </div>
              <div className="ds-row-actions" style={{ opacity: 1 }}>
                <Switch
                  checked={review.active}
                  onCheckedChange={() => toggleActive(review.id)}
                  aria-label="Visible"
                />
                <button
                  type="button"
                  onClick={() => openEdit(review)}
                  className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                  aria-label="Editar"
                >
                  <Icon name="edit" size="sm" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(review.id)}
                  className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                  style={{ color: 'var(--danger)' }}
                  aria-label="Eliminar"
                >
                  <Icon name="trash" size="sm" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReview ? 'Editar reseña' : 'Nueva reseña'}</DialogTitle>
          </DialogHeader>
          <div className="ds-stack-3" style={{ paddingBlock: 8 }}>
            <div className="ds-field">
              <label className="ds-field__label">
                Nombre del cliente <span className="ds-req">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="María García"
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Mascota (opcional)</label>
              <Input
                value={form.pet ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, pet: e.target.value }))}
                placeholder="Dueña de Luna (Shih Tzu)"
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Calificación</label>
              <StarPicker
                value={form.rating}
                onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">
                Comentario <span className="ds-req">*</span>
              </label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Escribe el comentario del cliente…"
                rows={3}
              />
            </div>
            <label className="ds-row-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, active: v }))}
              />
              <span className="ds-t-body">Visible en la página</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <button
              type="button"
              onClick={saveDialog}
              disabled={!form.name.trim() || !form.comment.trim()}
              className="ds-btn ds-btn--accent"
            >
              {editingReview ? 'Guardar cambios' : 'Crear reseña'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
