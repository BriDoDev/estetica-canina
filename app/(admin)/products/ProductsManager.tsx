'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductActiveAction,
} from '@/app/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { formatCurrency } from '@/lib/utils'
import { Icon } from '@/components/admin/Icon'
import type { ProductRow } from './page'

interface ProductsManagerProps {
  initialProducts: ProductRow[]
}

type ProductCategory = ProductRow['category']

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  shampoo: 'Shampoo',
  conditioner: 'Acondicionador',
  tool: 'Herramienta',
  accessory: 'Accesorio',
  treatment: 'Tratamiento',
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'shampoo' as ProductCategory,
  stock_quantity: '0',
  image_url: '',
  is_active: true,
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const openCreate = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (product: ProductRow) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      category: product.category,
      stock_quantity: String(product.stock_quantity),
      image_url: product.image_url ?? '',
      is_active: product.is_active,
    })
    setFormError(null)
    setDialogOpen(true)
  }

  const saveDialog = () => {
    if (!form.name.trim() || !form.price || isNaN(parseFloat(form.price))) {
      setFormError('Nombre y precio son requeridos')
      return
    }

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('price', form.price)
    formData.append('category', form.category)
    formData.append('stock_quantity', form.stock_quantity)
    formData.append('image_url', form.image_url)
    formData.append('is_active', String(form.is_active))

    startTransition(async () => {
      if (editingProduct) {
        const result = await updateProductAction(editingProduct.id, formData)
        if (!result.success) {
          setFormError(result.error ?? 'Error al guardar')
          return
        }
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: form.name,
                  description: form.description || null,
                  price: parseFloat(form.price),
                  category: form.category,
                  stock_quantity: parseInt(form.stock_quantity) || 0,
                  image_url: form.image_url || null,
                  is_active: form.is_active,
                }
              : p,
          ),
        )
      } else {
        const result = await createProductAction(formData)
        if (!result.success) {
          setFormError(result.error ?? 'Error al crear')
          return
        }
        setProducts((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
            category: form.category,
            stock_quantity: parseInt(form.stock_quantity) || 0,
            image_url: form.image_url || null,
            is_active: form.is_active,
          },
        ])
      }
      setDialogOpen(false)
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteProductAction(deleteId)
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteId))
      }
      setDeleteId(null)
    })
  }

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleProductActiveAction(id, !current)
      if (result.success) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p)))
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <button type="button" onClick={openCreate} className="ds-btn ds-btn--accent">
          <Icon name="plus" size="sm" />
          Nuevo producto
        </button>
        <span className="ds-t-sm ds-t-muted">{products.length} productos</span>
      </div>

      {products.length > 0 ? (
        <div className="ds-grid-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="ds-card"
              style={product.is_active ? undefined : { opacity: 0.6 }}
            >
              <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
                <div
                  className="ds-avatar ds-avatar--xl ds-avatar-pet"
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="cart" size="lg" />
                  )}
                </div>
                <div className="ds-row-actions" style={{ opacity: 1 }}>
                  <Switch
                    checked={product.is_active}
                    onCheckedChange={() => handleToggleActive(product.id, product.is_active)}
                    aria-label="Activo"
                  />
                  <button
                    type="button"
                    onClick={() => openEdit(product)}
                    className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                    aria-label="Editar"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(product.id)}
                    className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
                    style={{ color: 'var(--danger)' }}
                    aria-label="Eliminar"
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>

              <h3 className="ds-t-d4" style={{ marginBottom: 4 }}>
                {product.name}
              </h3>
              {product.description && (
                <p className="ds-t-sm ds-t-muted" style={{ marginBottom: 12 }}>
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                <span
                  className="ds-t-d4"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--display)' }}
                >
                  {formatCurrency(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="ds-badge">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </span>
                  <span className="ds-t-xs ds-t-muted">Stock {product.stock_quantity}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ds-empty">
          <div className="ds-empty__icon">
            <Icon name="cart" size="lg" />
          </div>
          <div className="ds-empty__title">Sin productos</div>
          <div className="ds-empty__desc">
            Agrega tu primer producto para comenzar a vender add-ons.
          </div>
          <button type="button" className="ds-btn ds-btn--accent" onClick={openCreate}>
            <Icon name="plus" size="sm" />
            Nuevo producto
          </button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <div className="ds-stack-3" style={{ paddingBlock: 8 }}>
            <div className="ds-field">
              <label className="ds-field__label">Nombre <span className="ds-req">*</span></label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Shampoo Premium"
              />
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Descripción</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del producto…"
                rows={2}
              />
            </div>
            <div className="ds-grid-2">
              <div className="ds-field">
                <label className="ds-field__label">Precio (MXN) <span className="ds-req">*</span></label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="299.00"
                />
              </div>
              <div className="ds-field">
                <label className="ds-field__label">Stock</label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="ds-field">
              <label className="ds-field__label">Categoría</label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as ProductCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ds-field">
              <label className="ds-field__label">URL de imagen</label>
              <Input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://…"
              />
            </div>
            <label className="ds-row-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, is_active: v }))}
              />
              <span className="ds-t-body">Producto activo</span>
            </label>
            {formError && (
              <div className="ds-alert ds-alert--danger">
                <Icon name="alert" className="ds-alert__icon" />
                <div className="ds-alert__body">{formError}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <button
              type="button"
              onClick={saveDialog}
              disabled={isPending}
              className="ds-btn ds-btn--accent"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
