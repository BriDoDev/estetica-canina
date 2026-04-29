import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Paws & Glow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="#services" className="hover:text-indigo-600 transition-colors">Servicios</Link>
          <Link href="#booking" className="hover:text-indigo-600 transition-colors">Agendar</Link>
          <Link href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonios</Link>
        </nav>

        <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="#booking">Reservar ahora</Link>
        </Button>
      </div>
    </header>
  )
}
