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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Pencil, Trash2, Package, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ProductRow } from './page'

interface ProductsManagerProps {
  initialProducts: ProductRow[]
}

type ProductCategory = ProductRow['category']

const categoryLabels: Record<ProductCategory, string> = {
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
              : p
          )
        )
      } else {
        const result = await createProductAction(formData)
        if (!result.success) {
          setFormError(result.error ?? 'Error al crear')
          return
        }
        // Reload will happen via server revalidation; optimistically add placeholder
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
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
        )
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Button>
        <span className="text-sm text-slate-500">{products.length} productos</span>
      </div>

      {products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className={`border rounded-2xl p-4 bg-white transition-opacity ${
                product.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={product.is_active}
                    onCheckedChange={() =>
                      handleToggleActive(product.id, product.is_active)
                    }
                    aria-label="Activo"
                  />
                  <button
                    onClick={() => openEdit(product)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-indigo-600">
                  {formatCurrency(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-600 border-none text-xs">
                    {categoryLabels[product.category] ?? product.category}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Stock: {product.stock_quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 text-sm">
          No hay productos registrados. ¡Agrega el primero!
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Shampoo Premium"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Descripción del producto..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Precio (MXN) *</Label>
                <Input
                  value={form.price}
                  type="number"
                  min="0"
                  step="0.01"
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="299.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input
                  value={form.stock_quantity}
                  type="number"
                  min="0"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock_quantity: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ProductCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>URL de imagen</Label>
              <Input
                value={form.image_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
                placeholder="https://..."
                type="url"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v: boolean) => setForm((f) => ({ ...f, is_active: v }))}
                id="product-active"
              />
              <Label htmlFor="product-active">Producto activo</Label>
            </div>
            {formError && (
              <p className="text-red-500 text-sm">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveDialog}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
