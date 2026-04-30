'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  LayoutList,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/appointments', icon: Calendar, label: 'Citas' },
  { href: '/customers', icon: Users, label: 'Clientes' },
  { href: '/products', icon: Package, label: 'Productos' },
  { href: '/services', icon: Scissors, label: 'Servicios' },
  { href: '/reviews', icon: Star, label: 'Reseñas' },
  { href: '/cms', icon: Settings, label: 'CMS Landing' },
  { href: '/form-builder', icon: LayoutList, label: 'Form Builder' },
  { href: '/settings', icon: Settings2, label: 'Configuración' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 lg:w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="p-4 lg:p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#FF8C7A' }}>
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-800 truncate">Paws &amp; Glow</p>
            <p className="text-xs text-slate-400">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Logout */}
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
}
