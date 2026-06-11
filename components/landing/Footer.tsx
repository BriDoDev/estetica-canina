import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Share2, MessageCircle, Phone } from 'lucide-react'

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
    /* use defaults */
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
    <footer className="bg-brand-deep text-paper-2 pt-14 pb-7">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="mb-9 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="flex items-center gap-2.5 no-underline">
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-white font-display"
                style={{ background: 'var(--color-accent)', fontWeight: 600, fontSize: 15 }}
              >
                P
              </span>
              <span className="font-display text-paper-2 text-[20px] leading-none" style={{ fontWeight: 500 }}>
                Paws &amp; Glow
                <span
                  className="block font-sans text-[10px] uppercase tracking-[0.18em] leading-none mt-1 font-semibold"
                  style={{ color: 'rgba(250,246,236,0.55)' }}
                >
                  Estética Canina
                </span>
              </span>
            </a>
            <p
              className="mt-4 text-[13.5px] leading-[1.7]"
              style={{ color: 'rgba(250,246,236,0.78)' }}
            >
              Cuidamos a tu mejor amigo con amor, experiencia y la última tecnología en diagnóstico
              por IA.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="grid h-[34px] w-[34px] place-items-center rounded-full"
                style={{ background: 'rgba(250,246,236,0.08)' }}
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="grid h-[34px] w-[34px] place-items-center rounded-full"
                style={{ background: 'rgba(250,246,236,0.08)' }}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="grid h-[34px] w-[34px] place-items-center rounded-full"
                style={{ background: 'rgba(250,246,236,0.08)' }}
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4
              className="mb-3.5 font-sans text-[11.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'rgba(250,246,236,0.55)' }}
            >
              Servicios
            </h4>
            <ul className="list-none p-0 m-0 space-y-1.5">
              {[
                { href: '#servicios', label: 'Baño Profundo' },
                { href: '#servicios', label: 'Corte Profesional' },
                { href: '#servicios', label: 'Grooming Completo' },
                { href: '#servicios', label: 'Cuidado Especial' },
                { href: '#servicios', label: 'Spa Canino' },
              ].map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="no-underline text-[13.5px] leading-[1.7]"
                    style={{ color: 'rgba(250,246,236,0.78)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="mb-3.5 font-sans text-[11.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'rgba(250,246,236,0.55)' }}
            >
              Empresa
            </h4>
            <ul className="list-none p-0 m-0 space-y-1.5">
              {[
                { href: '#testimonios', label: 'Testimonios' },
                { href: '#agenda', label: 'Reservar' },
                { href: '#', label: 'Política de citas' },
                { href: '#', label: 'Privacidad' },
              ].map((l, i) => (
                <li key={i}>
                  <Link
                    href={l.href}
                    className="no-underline text-[13.5px] leading-[1.7]"
                    style={{ color: 'rgba(250,246,236,0.78)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="mb-3.5 font-sans text-[11.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'rgba(250,246,236,0.55)' }}
            >
              Contacto
            </h4>
            <ul className="list-none p-0 m-0 space-y-1.5">
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="no-underline text-[13.5px] leading-[1.7]"
                    style={{ color: 'rgba(250,246,236,0.78)' }}
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="no-underline text-[13.5px] leading-[1.7]"
                    style={{ color: 'rgba(250,246,236,0.78)' }}
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.hours?.weekdays && (
                <li
                  className="text-[13.5px] leading-[1.7] mt-2.5"
                  style={{ color: 'rgba(250,246,236,0.78)' }}
                >
                  {contact.hours.weekdays}
                  {contact.hours?.saturday && (
                    <>
                      <br />
                      {contact.hours.saturday}
                    </>
                  )}
                  {contact.hours?.sunday && (
                    <>
                      <br />
                      {contact.hours.sunday}
                    </>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div
          className="pt-5.5 flex flex-col gap-2.5 text-[12px] md:flex-row md:justify-between"
          style={{
            borderTop: '1px solid rgba(250,246,236,0.12)',
            color: 'rgba(250,246,236,0.45)',
            paddingTop: 22,
          }}
        >
          <span>© {new Date().getFullYear()} Paws &amp; Glow. Todos los derechos reservados.</span>
          <span>Hecho con cariño en CDMX.</span>
        </div>
      </div>
    </footer>
  )
}
