import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <PawPrint className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Paws & Glow</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="#services" className="transition-colors hover:text-primary">
            Servicios
          </Link>
          <Link href="#booking" className="transition-colors hover:text-primary">
            Agendar
          </Link>
          <Link href="#testimonials" className="transition-colors hover:text-primary">
            Testimonios
          </Link>
        </nav>

        <Button asChild size="sm" style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }} className="hover:bg-primary/90">
          <Link href="#booking">Reservar ahora</Link>
        </Button>
      </div>
    </header>
  )
}
