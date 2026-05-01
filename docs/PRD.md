# PRD — Paws & Glow

**Product Requirements Document**
Versión 1.0 | Abril 2026

---

## 1. Resumen Ejecutivo

Paws & Glow es una plataforma SaaS para estéticas caninas que digitaliza el flujo completo de atención al cliente — desde el agendamiento de citas hasta las notificaciones post-servicio — con inteligencia artificial como diferenciador competitivo central.

**Problema:** Las estéticas caninas en México operan con procesos 100% manuales (WhatsApp, llamadas, papel), resultando en ~30% de no-shows, 10+ horas/semana perdidas en coordinación, y tickets promedio bajos por falta de recomendaciones personalizadas.

**Solución:** Una plataforma web donde los clientes agendan en 2 minutos, la IA analiza la foto de su mascota y recomienda servicios, y el negocio gestiona todo desde un dashboard unificado.

**Diferenciador clave:** OpenAI Vision analiza el pelaje del perro y recomienda servicios premium basados en el estado real, no en lo que el cliente cree que necesita. DALL-E genera previews de estilos de grooming ("así se verá tu perro después del servicio").

---

## 2. Objetivos del Producto

| Objetivo | Métrica | Target |
|---|---|---|
| Reducir no-shows | Tasa de ausencia | <10% (desde ~30%) |
| Acelerar agendamiento | Tiempo por cita | <3 min (desde 8-15 min) |
| Aumentar ticket promedio | Ingreso por cita | $550 MXN (desde $350 MXN) |
| Capturar agendamiento 24/7 | % citas fuera de horario laboral | >30% |
| Eliminar coordinación manual | Horas staff/semana en llamadas | <2h (desde 10h+) |

---

## 3. Usuarios / Personas

### 3.1 Cliente (Dueño de Mascota)

| Característica | Descripción |
|---|---|
| Demografía | Hombres/mujeres 25-55, dueños de perros, principalmente urbanos |
| Nivel técnico | Básico — usan WhatsApp, Instagram, navegador móvil |
| Necesidad principal | Agendar cita rápido, saber qué servicio necesita su perro, recibir recordatorios |
| Punto de acceso | Landing page o código QR en el local |

### 3.2 Administrador / Staff del Negocio

| Característica | Descripción |
|---|---|
| Rol | Dueño/a de la estética o encargado/a |
| Nivel técnico | Básico-intermedio — maneja apps, no código |
| Necesidad principal | Ver citas del día, gestionar clientes y productos, modificar contenido de la página sin desarrollador |
| Punto de acceso | Panel admin con login por email |

---

## 4. Funcionalidades (Requisitos Funcionales)

### 4.1 Landing Page Pública

| ID | Requisito | Descripción | Estado |
|---|---|---|---|
| LP-01 | Hero section | Título, subtítulo, CTAs (Agendar cita / Ver servicios), stats bar | ✅ |
| LP-02 | Servicios | 6 servicios con icono, nombre, descripción, precio, badge (popular/nuevo) | ✅ |
| LP-03 | Testimonios | Reseñas de clientes con nombre, mascota, rating 1-5, comentario | ✅ |
| LP-04 | Footer | Marca, navegación, contacto (teléfono/email), horarios, redes sociales | ✅ |
| LP-05 | Formulario de cita | Multi-step form (Cliente → Mascota → Servicio → Confirmar) | ✅ |
| LP-06 | PWA | Service worker + manifest para instalación como app | ✅ |
| LP-07 | Modelo 3D | Perro en 3D (React Three Fiber) que cambia de "sucio" a "limpio" al hacer scroll | ✅ |

### 4.2 Formulario de Agendamiento (Multi-step)

| ID | Requisito | Descripción | Estado |
|---|---|---|---|
| AF-01 | Paso 1: Cliente | Nombre, email, teléfono, opt-in WhatsApp | ✅ |
| AF-02 | Paso 2: Mascota | Nombre, raza, edad, peso, tipo de pelo, subir foto | ✅ |
| AF-03 | Paso 3: Servicio | Selección de tipo de servicio (9 tipos), fecha/hora | ✅ |
| AF-04 | Paso 4: Confirmar | Resumen de cita, confirmación final | ✅ |
| AF-05 | Geolocalización | Validar que el cliente esté dentro del radio de servicio del salón | ✅ |
| AF-06 | Análisis IA de foto | GPT-4o Vision analiza la foto de la mascota y devuelve diagnóstico | ✅ |
| AF-07 | Previsualización IA | DALL-E genera imágenes del perro con diferentes estilos de grooming | ✅ |
| AF-08 | Compresión de imagen | Cliente comprime imagen antes de enviar a OpenAI | ✅ |
| AF-09 | Campos dinámicos | Formulario se adapta según configuración del Form Builder | ✅ |
| AF-10 | Validación | Zod v4 + React Hook Form con mensajes de error en español | ✅ |

### 4.3 Diagnóstico IA (OpenAI Vision)

| ID | Requisito | Descripción | Estado |
|---|---|---|---|
| AI-01 | Detección de raza | Identificar raza del perro desde la foto | ✅ |
| AI-02 | Detección de tipo de pelo | Clasificar: corto/medio/largo/rizado/doble capa | ✅ |
| AI-03 | Condición del pelaje | Evaluar: excelente/bueno/necesita atención/deficiente | ✅ |
| AI-04 | Recomendaciones de servicio | Sugerir 4 servicios con prioridad (alta/media/baja), descripción y precio estimado | ✅ |
| AI-05 | Cuidados urgentes | Detectar condiciones que requieran atención veterinaria o especial | ✅ |
| AI-06 | Tiempo estimado | Estimar duración del servicio de grooming | ✅ |
| AI-07 | Previsualización de estilos | DALL-E genera 1-4 imágenes del perro con estilos de corte (Teddy Bear, Puppy Cut, Lion Cut, Breed Standard) | ✅ |

### 4.4 Panel de Administración

| ID | Requisito | Descripción | Estado |
|---|---|---|---|
| AD-01 | Dashboard | KPIs: total citas, clientes, mascotas, ingresos. Últimas 5 citas. | ✅ |
| AD-02 | Gestión de citas | Tabla con filtros por estado. Workflow: pendiente → confirmada → en_progreso → completada → cancelada. | ✅ |
| AD-03 | Detalle de cita | Modal de cobro con precio real, notas de seguimiento, fecha de completado | ✅ |
| AD-04 | Gestión de clientes | Lista de clientes con badge de opt-in WhatsApp. Vista detalle con mascotas e historial. | ✅ |
| AD-05 | Perfil de mascota | Foto, raza, tipo de pelo, edad, peso, notas especiales, historial de servicios con análisis IA | ✅ |
| AD-06 | Gestión de productos | CRUD de productos (shampoo, acondicionador, herramienta, accesorio, tratamiento). Stock, precio, activo/inactivo. | ✅ |
| AD-07 | CMS - Hero | Editar título, subtítulo, CTAs de la landing | ✅ |
| AD-08 | CMS - Contacto | Editar teléfono, email, dirección | ✅ |
| AD-09 | CMS - Horarios | Editar horarios (lunes-viernes, sábado, domingo) | ✅ |
| AD-10 | Gestión de servicios | CRUD de los 6 servicios de la landing. Icono, nombre, descripción, precio, badge, imagen. | ✅ |
| AD-11 | Gestión de reseñas | CRUD de reseñas. Nombre, mascota, comentario, rating, activo/inactivo. | ✅ |
| AD-12 | Form Builder | Editor drag-and-drop del formulario de citas. Campos, secciones, servicios, preview en vivo. | ✅ |
| AD-13 | Configuración | Conteo de imágenes DALL-E (1-4), ubicación del salón (lat/lng/radio) | ✅ |
| AD-14 | Notificaciones | Panel de configuración de notificaciones (placeholder) | 🚧 |
| AD-15 | Autenticación | Login con email/contraseña via Supabase Auth. Protección de rutas admin. | ✅ |

### 4.5 Notificaciones

| ID | Requisito | Descripción | Estado |
|---|---|---|---|
| NF-01 | Confirmación por email | Resend envía email de confirmación al crear cita | 🚧 |
| NF-02 | Recordatorio WhatsApp | Twilio envía recordatorio 24h antes de la cita | 🚧 |
| NF-03 | Webhook WhatsApp entrante | Endpoint para recibir mensajes de WhatsApp (POST) | 🚧 |
| NF-04 | Plantillas WhatsApp | Mensajes pre-aprobados para confirmaciones y recordatorios | 🚧 |

### 4.6 API y Webhooks

| ID | Requisito | Descripción | Estado |
|---|---|---|---|
| API-01 | GET /api/form-config | Endpoint público que devuelve la configuración del formulario y servicios habilitados | ✅ |
| API-02 | GET /api/salon-location | Endpoint público que devuelve lat/lng/radio del salón | ✅ |
| API-03 | POST /api/webhooks/whatsapp | Webhook entrante de Twilio para mensajes WhatsApp | 🚧 |

---

## 5. Requisitos No Funcionales

| ID | Categoría | Requisito |
|---|---|---|
| NF-01 | Rendimiento | Lighthouse score >90 en Performance, Accessibility, Best Practices, SEO |
| NF-02 | Disponibilidad | 99.5% uptime (Netlify + Supabase SLA) |
| NF-03 | Seguridad | Row Level Security en todas las tablas Supabase. Autenticación requerida para panel admin. |
| NF-04 | Escalabilidad | Arquitectura serverless (Netlify Edge Functions + Supabase). Escala horizontalmente sin cambios. |
| NF-05 | Offline | PWA con service worker. Landing page funciona offline. |
| NF-06 | SEO | Server-side rendering (Next.js App Router). Meta tags, Open Graph, structured data. |
| NF-07 | Responsive | Mobile-first. Funciona en iOS, Android, y desktop (Chrome, Firefox, Safari). |
| NF-08 | Costo IA | <$0.02 USD por análisis de mascota. Imágenes redimensionadas a 512px antes de enviar. |
| NF-09 | Accesibilidad | WCAG 2.1 AA. Contraste adecuado, navegación por teclado, screen reader friendly. |

---

## 6. Arquitectura Técnica

### 6.1 Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Next.js (App Router) + React + Tailwind CSS | 16 / 19 / 4 |
| UI Components | shadcn/ui (Radix primitives) | latest |
| 3D | React Three Fiber + Drei + GSAP | 9 / latest / 3.15 |
| Backend | Next.js Server Actions + API Routes | 16 |
| Base de Datos | Supabase PostgreSQL | latest |
| Autenticación | Supabase Auth (email/password) | via @supabase/ssr |
| Almacenamiento | Supabase Storage (fotos mascotas) | latest |
| IA | OpenAI GPT-4o Vision + DALL-E | SDK v6 |
| Email | Resend | v6 |
| WhatsApp | Twilio (twilio-node) | latest |
| Forms | React Hook Form + Zod | v7 / v4 |
| Validación | Zod | v4 |
| Hosting | Netlify | via @netlify/plugin-nextjs |
| Testing | Playwright | latest |

### 6.2 Estructura del Proyecto

```
app/
├── (public)/page.tsx          # Landing page
├── (auth)/login/page.tsx      # Admin login
├── (admin)/                   # Panel admin (protegido)
│   ├── dashboard/
│   ├── appointments/
│   ├── customers/[id]/
│   ├── products/
│   ├── services/
│   ├── reviews/
│   ├── cms/
│   ├── form-builder/
│   └── settings/
├── actions/                   # Server Actions
│   ├── appointments.ts
│   ├── products.ts
│   ├── analyze-pet.ts
│   ├── generate-grooming.ts
│   ├── landing-config.ts
│   └── tracking.ts
├── api/                       # API Routes (solo webhooks externos)
│   ├── webhooks/whatsapp/
│   ├── form-config/
│   └── salon-location/
components/
├── landing/                   # Hero, Services, Testimonials, Footer
├── forms/                     # AppointmentForm, LoginForm, CustomerForm
├── layout/                    # AdminSidebar, Navbar
├── 3d/                        # DogModel, SceneCanvas (lazy-loaded)
└── ui/                        # shadcn/ui components
lib/
├── ai/                        # analyze-pet.ts, generate-grooming.ts
├── supabase/                  # client.ts, server.ts, middleware.ts
├── schemas/                   # Zod schemas (appointment, customer, pet)
├── types/                     # TypeScript types (form-config)
├── hooks/                     # useGeolocation, useFormConfig
└── utils.ts                   # cn, formatCurrency, formatDate, getInitials
```

### 6.3 Base de Datos (6 tablas)

| Tabla | Propósito | RLS |
|---|---|---|
| `profiles` | Perfiles de usuarios admin/staff (FK a auth.users) | Lectura: authenticated. Escritura: propio perfil. |
| `customers` | Clientes (dueños de mascotas) | Lectura: authenticated. Inserción: pública. |
| `pets` | Mascotas (FK a customers) | Lectura: authenticated. Inserción: pública. |
| `appointments` | Citas (FK a pets, customers). Incluye ai_analysis JSONB. | Lectura: authenticated. Inserción: pública. |
| `products` | Inventario de productos | Lectura: pública. Escritura: authenticated. |
| `landing_config` | CMS key-value (JSONB). Hero, servicios, reseñas, contacto, form config, ubicación. | Lectura: pública. Escritura: authenticated. |

### 6.4 Flujo de Agendamiento

```
Cliente accede a landing page
  → Llena datos personales (nombre, email, teléfono)
  → Geolocalización: ¿dentro del radio del salón?
  → Datos de mascota (nombre, raza, edad, peso)
  → Sube foto de la mascota
  → Compresión de imagen en cliente
  → Server Action: upload a Supabase Storage
  → Server Action: GPT-4o Vision analiza foto
  → Server Action: DALL-E genera previews de estilos
  → Cliente ve diagnóstico IA + previsualizaciones
  → Selecciona tipo de servicio
  → Elige fecha y hora
  → Confirma cita
  → Server Action: crea customer (upsert), pet, appointment
  → Respuesta: confirmación en pantalla
  → (Pendiente) Resend envía email de confirmación
  → (Pendiente) Twilio envía recordatorio 24h antes
```

### 6.5 Flujo de Administración

```
Admin hace login (email/password via Supabase Auth)
  → Dashboard: KPIs (total citas, clientes, ingresos) + últimas 5 citas
  → Citas: tabla con filtros por estado
    → Confirmar → Iniciar → Cobrar (modal con precio real + notas) → Completar
    → Cancelar (en cualquier punto)
  → Clientes: lista con detalle (datos, mascotas, historial IA)
  → Productos: CRUD (nombre, precio, stock, categoría, activo/inactivo)
  → CMS: editar hero, contacto, horarios
  → Servicios: editar servicios de la landing
  → Reseñas: gestionar testimonios
  → Form Builder: configurar campos, secciones, servicios del formulario
  → Configuración: ubicación salón, conteo imágenes IA
```

---

## 7. Matriz de Trazabilidad Funcionalidad → Acción/Componente

| Funcionalidad | Server Action | Componente Principal | Tabla(s) |
|---|---|---|---|
| Agendar cita | `createAppointmentAction` | `AppointmentForm.tsx` | customers, pets, appointments |
| Analizar mascota (IA) | `analyzePetAction` | `AppointmentForm.tsx` (bloque IA) | — |
| Generar preview grooming | `generateGroomingPreviewAction` | `AppointmentForm.tsx` (bloque IA) | — |
| Ver dashboard | — (Server Component) | `app/(admin)/dashboard/page.tsx` | appointments, customers, pets |
| Gestionar citas | `updateAppointmentStatusAction`, `completeAppointmentAction` | `AppointmentsTracker.tsx` | appointments |
| Gestionar clientes | — (queries directos) | `app/(admin)/customers/` | customers, pets, appointments |
| CRUD productos | `createProductAction`, `updateProductAction`, `deleteProductAction`, `toggleProductActiveAction` | `ProductsManager.tsx` | products |
| CMS landing | `updateConfigAction`, `getAllConfigAction` | `CmsEditor.tsx`, `ServicesManager.tsx`, `ReviewsManager.tsx`, `FormBuilderEditor.tsx` | landing_config |
| Configuración global | `updateConfigAction` | `app/(admin)/settings/` | landing_config |

---

## 8. KPIs y Métricas

| Métrica | Fuente | Frecuencia |
|---|---|---|
| Tasa de conversión landing → cita | appointments.created_at | Semanal |
| Tasa de no-show | appointments.status = 'cancelled' + inasistencias | Semanal |
| Ticket promedio | appointments.actual_price (avg) | Mensual |
| Tiempo promedio de agendamiento | Analytics / observabilidad | Mensual |
| Servicios más solicitados | appointments.service_type (count) | Mensual |
| Clientes recurrentes | customers con >1 appointment | Mensual |
| Uso de IA | conteo de ai_analysis no nulos | Mensual |
| ROI de IA | (tickets con upsell IA - tickets sin IA) - costo OpenAI | Mensual |

---

## 9. Roadmap

| Fase | Entregables | Estado |
|---|---|---|
| **MVP** | Landing + formulario multi-step + análisis IA (Vision) + previsualización IA (DALL-E) + panel admin (citas, clientes, mascotas, productos, CMS, form builder, servicios, reseñas, configuración) + Supabase + PWA | ✅ Completado |
| **Fase 2** | Notificaciones: email (Resend) + WhatsApp (Twilio) — confirmaciones automáticas y recordatorios 24h antes | 🚧 En desarrollo |
| **Fase 3** | Pasarela de pagos (Stripe/MercadoPago). Cobro en el formulario de agendamiento. Pagos por adelantado para reducir no-shows adicionales. | 📋 Planeado |
| **Fase 4** | App móvil PWA completa + programa de fidelización (puntos por visita, recompensas, referidos). Soporte multi-sucursal (mismo código, diferentes ubicaciones). | 📋 Planeado |

---

## 10. Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Costo de API OpenAI excede presupuesto | Alto | Media | Imágenes redimensionadas a 512px. Prompts optimizados. Límite configurable de imágenes DALL-E (1-4). Monitoreo de costos. |
| Clientes no adoptan flujo digital | Alto | Media | Código QR en local físico. Campaña WhatsApp/Instagram. Video demo del diagnóstico IA. |
| Dependencia de Supabase | Medio | Baja | PostgreSQL estándar. Backup automático. Migrable a cualquier proveedor PostgreSQL. |
| Competencia copia la funcionalidad IA | Medio | Media | Ventaja de primer movimiento. Calidad de prompts y dataset propios como moat. La IA es commodity, la experiencia integrada no. |
| Errores en diagnóstico IA | Bajo | Media | El diagnóstico es una recomendación, no un diagnóstico médico. Disclaimer en UI. Supervisión humana final. |
| WhatsApp Business API rechaza plantillas | Medio | Media | Plantillas pre-aprobadas siguiendo guidelines de Meta. Plan B: solo email. |

---

## 11. Glosario

| Término | Definición |
|---|---|
| **Grooming** | Acicalamiento/cuidado estético de mascotas |
| **No-show** | Cliente que agenda una cita y no se presenta sin cancelar |
| **Upsell** | Venta de un servicio de mayor valor al originalmente solicitado |
| **Coat type / Tipo de pelo** | Clasificación del pelaje: corto, medio, largo, rizado, doble capa |
| **RLS** | Row Level Security — seguridad a nivel de fila en PostgreSQL/Supabase |
| **Server Action** | Función asíncrona ejecutada en el servidor, invocada desde el cliente en Next.js |
| **PWA** | Progressive Web App — aplicación web instalable con funcionalidad offline |
| **JSONB** | Tipo de dato en PostgreSQL para almacenar JSON binario con indexación |
| **CMS** | Content Management System — sistema para gestionar contenido sin código |
| **Form Builder** | Constructor visual de formularios (drag-and-drop) |

---

## 12. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner | — | — | — |
| Tech Lead | — | — | — |
| Stakeholder | — | — | — |

---

_Documento generado el 30 de abril de 2026._
