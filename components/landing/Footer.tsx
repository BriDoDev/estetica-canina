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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-white text-sm">Paws &amp; Glow</p>
                <p className="text-xs text-slate-500">Estética Canina Premium</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cuidamos a tu mejor amigo con amor, experiencia y la última tecnología
              en diagnóstico por IA.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-green-600 flex items-center justify-center transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest">
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
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              {contact.phone && (
                <li className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  {contact.phone}
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  {contact.email}
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-widest">
              Horarios
            </h3>
            <ul className="space-y-2 text-sm">
              {contact.hours?.weekdays && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  {contact.hours.weekdays}
                </li>
              )}
              {contact.hours?.saturday && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  {contact.hours.saturday}
                </li>
              )}
              {contact.hours?.sunday && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  {contact.hours.sunday}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Paws &amp; Glow. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
