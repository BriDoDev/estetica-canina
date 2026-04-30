'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Users, Package, Settings, Settings2,
  PawPrint, LogOut, Scissors, Star, LayoutList, Menu, X,
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
  { href: '/form-builder', icon: LayoutList, label: 'Form Builder' },
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
    <aside className="w-56 lg:w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 h-full">
      <div className="p-4 lg:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FF8C7A' }}>
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-800 truncate">Paws &amp; Glow</p>
            <p className="text-xs text-slate-400">Panel Admin</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'text-rose-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-[#F5EDFA]',
              )}
              style={active ? { backgroundColor: '#FFDAD6' } : undefined}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-rose-700' : 'text-slate-400')} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-[#F5EDFA] transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:block h-screen sticky top-0">{sidebarContent}</div>
      {/* Mobile: overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-64 animate-in slide-in-from-left duration-200">
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
  useEffect(() => { queueMicrotask(() => setSidebarOpen(false)) }, [pathname])

  return (
    <div className="flex min-h-screen bg-[#FFF8F0]">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5" style={{ color: '#FF8C7A' }} />
            <span className="font-semibold text-sm text-slate-800">Paws &amp; Glow</span>
          </div>
        </div>
        <div className="p-4 lg:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
