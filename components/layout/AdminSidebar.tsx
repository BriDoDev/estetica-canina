'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  Settings,
  Settings2,
  PawPrint,
  LogOut,
  Scissors,
  Star,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/appointments', icon: Calendar, label: 'Citas' },
  { href: '/customers', icon: Users, label: 'Clientes' },
  { href: '/products', icon: Package, label: 'Productos' },
  { href: '/services', icon: Scissors, label: 'Servicios' },
  { href: '/reviews', icon: Star, label: 'Reseñas' },
  { href: '/cms', icon: Settings, label: 'CMS' },
  { href: '/settings', icon: Settings2, label: 'Configuración' },
]

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-100 bg-white lg:w-60">
      <div className="flex items-center justify-between border-b border-slate-100 p-4 lg:p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#FF8C7A' }}
          >
            <PawPrint className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">Paws &amp; Glow</p>
            <p className="text-xs text-slate-400">Panel Admin</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'font-semibold text-rose-900'
                  : 'text-slate-500 hover:bg-[#F5EDFA] hover:text-slate-700',
              )}
              style={active ? { backgroundColor: '#FFDAD6' } : undefined}
            >
              <item.icon
                className={cn('h-4 w-4 flex-shrink-0', active ? 'text-rose-700' : 'text-slate-400')}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-[#F5EDFA] hover:text-slate-600"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <div className="sticky top-0 hidden h-screen lg:block">{sidebarContent}</div>
      {/* Mobile: overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <div className="animate-in slide-in-from-left absolute top-0 bottom-0 left-0 w-64 duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  const pathname = usePathname()
  useEffect(() => {
    queueMicrotask(() => setSidebarOpen(false))
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-[#FFF8F0]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5" style={{ color: '#FF8C7A' }} />
            <span className="text-sm font-semibold text-slate-800">Paws &amp; Glow</span>
          </div>
        </div>
        <div className="overflow-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
