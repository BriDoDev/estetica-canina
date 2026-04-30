# Security Audit — Paws & Glow v1.0.0

## Scope
Full-stack audit: Next.js 16 + Supabase + OpenAI + WhatsApp + Resend.

---

## 1. Autenticación y Autorización

| Check | Status | Nota |
|-------|--------|------|
| RLS en todas las tablas | ✅ | profiles, customers, pets, appointments, products, landing_config |
| AdminLayout verifica sesión | ✅ | `auth.getUser()` → redirect /login |
| Middleware refresca sesión | ✅ | `updateSession()` en todas las rutas |
| Server Actions verifican auth | ✅ | `getUser()` antes de mutaciones |
| Políticas RLS coherentes | ✅ | SELECT público para landing_config/products, INSERT público para customers/pets/appointments |
| **Riesgo:** `Anyone can insert appointments` | ⚠️ | Cualquiera puede crear citas. Mitigado: validación Zod + sin acceso a datos de otros |

---

## 2. Protección de Datos

| Check | Status | Nota |
|-------|--------|------|
| API keys en .env.local | ✅ | No hardcodeadas |
| Supabase anon key pública | ✅ | Diseñada para ser pública (RLS protege) |
| OpenAI API key solo server-side | ✅ | En Server Actions / lib/ai/ |
| Resend API key solo server-side | ✅ | Server Action |
| Sin secretos en cliente | ✅ | Ninguna key expuesta al browser |
| Zod validation en inputs | ✅ | appointmentSchema valida todos los campos |
| **Riesgo:** `OPENAI_API_KEY` en lib/ai | ⚠️ | El archivo `lib/ai/generate-grooming.ts` crea `new OpenAI()` a nivel módulo. Si el bundle incluye esta inicialización, la key podría filtrarse. Verificado: solo se usa en Server Actions → seguro. |

---

## 3. Inyección y XSS

| Check | Status | Nota |
|-------|--------|------|
| React escapa HTML por default | ✅ | JSX automático |
| Zod sanitiza inputs | ✅ | Coerción + validación de tipos |
| No dangerouslySetInnerHTML | ✅ | Solo en next/error page (Next.js interno) |
| URL params no se reflejan en DOM | ✅ | No hay renderizado de query params |
| File upload validado | ✅ | MIME type check + size check |

---

## 4. CSRF

| Check | Status | Nota |
|-------|--------|------|
| Server Actions usan POST | ✅ | Next.js Server Actions = POST con header especial |
| Supabase Auth maneja CSRF | ✅ | Tokens en cookies httpOnly |
| Sin formularios GET que muten | ✅ | Todas las mutaciones son POST |

---

## 5. Rate Limiting y Abuso

| Check | Status | Nota |
|-------|--------|------|
| Rate limit en Server Actions | ❌ | Sin rate limiting. **Crítico**: un atacante podría hacer spam de `createAppointmentAction` |
| Rate limit en OpenAI API | ✅ | OpenAI maneja sus propios rate limits |
| Rate limit en login | ✅ | Supabase Auth limita intentos |
| File upload size limit | ✅ | 4MB body size limit + 5MB file check |

---

## 6. Dependencias

| Check | Status | Nota |
|-------|--------|------|
| npm audit | ⚠️ | Revisar antes de deploy |
| OpenAI SDK v6 | ✅ | Última versión |
| Next.js 16.2.4 | ✅ | Última stable |
| Supabase SDK actualizado | ✅ | v2.105+ |

---

## 7. Headers de Seguridad

| Header | Status | Nota |
|--------|--------|------|
| Content-Security-Policy | ❌ | No configurado. Recomendado para producción |
| X-Frame-Options | ❌ | No configurado |
| X-Content-Type-Options | ⚠️ | Next.js default: nosniff |
| Strict-Transport-Security | ⚠️ | Netlify lo maneja |
| Referrer-Policy | ⚠️ | Browser default |

**Acción:** Agregar `headers()` en next.config para CSP y security headers en producción.

---

## 8. Exposición de Datos

| Check | Status | Nota |
|-------|--------|------|
| Error messages no exponen internals | ✅ | Mensajes genéricos en errores |
| Stack traces en producción | ⚠️ | `console.error` en catch blocks — eliminar o redirigir a logger |
| API routes no devuelven datos sensibles | ✅ | Solo datos necesarios |

---

## Resumen de Riesgos

| Severidad | Issue | Acción |
|-----------|-------|--------|
| 🔴 **High** | Sin rate limiting en Server Actions | Agregar rate limiting (Vercel/Netlify edge o Redis) |
| 🟡 **Medium** | Sin CSP headers | Configurar en next.config |
| 🟡 **Medium** | console.error en producción | Reemplazar con logger estructurado |
| 🟢 **Low** | INSERT público en appointments | Aceptable para MVP con validación Zod |
| 🟢 **Low** | Sin X-Frame-Options | Netlify añade por default |

---

_Generado por Kurama 🍥 — 2026-04-29_
