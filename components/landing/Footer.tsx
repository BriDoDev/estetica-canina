import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PawPrint, MessageCircle, Share2, Phone, Mail, Clock } from 'lucide-react'

interface ContactConfig {
  phone?: string
  email?: string
  address?: string
  hours?: {
    weekdays?: string
    saturday?: string
    sunday?: string
  }
}

async function getContact(): Promise<ContactConfig> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'contact')
      .single()
    if (data?.value && typeof data.value === 'object') {
      return data.value as ContactConfig
    }
  } catch {
    // use defaults
  }
  return {
    phone: '+52 55 1234 5678',
    email: 'hola@pawsandglow.mx',
    hours: {
      weekdays: 'Lun–Vie: 9:00–19:00',
      saturday: 'Sáb: 9:00–17:00',
      sunday: 'Dom: Cerrado',
    },
  }
}

export async function Footer() {
  const contact = await getContact()

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                <PawPrint className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Paws &amp; Glow</p>
                <p className="text-xs text-slate-500">Estética Canina Premium</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Cuidamos a tu mejor amigo con amor, experiencia y la última tecnología en diagnóstico
              por IA.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-indigo-600"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-indigo-600"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 transition-colors hover:bg-green-600"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-widest text-white uppercase">
              Navegación
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '#services', label: 'Servicios' },
                { href: '#booking', label: 'Agendar cita' },
                { href: '#contact', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-widest text-white uppercase">Contacto</h3>
            <ul className="space-y-3 text-sm">
              {contact.phone && (
                <li className="flex items-center gap-2 text-slate-400">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                  {contact.phone}
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                  {contact.email}
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-widest text-white uppercase">Horarios</h3>
            <ul className="space-y-2 text-sm">
              {contact.hours?.weekdays && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                  {contact.hours.weekdays}
                </li>
              )}
              {contact.hours?.saturday && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                  {contact.hours.saturday}
                </li>
              )}
              {contact.hours?.sunday && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
                  {contact.hours.sunday}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Paws &amp; Glow. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
