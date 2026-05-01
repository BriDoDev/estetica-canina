# Diagramas de Secuencia — Paws & Glow

> 15 flujos completos: 4 Landing, 8 Backoffice, 3 API

---

## 🌐 LANDING (Flujos Públicos)

### FLOW-L1: Navegación de Landing Page

```mermaid
sequenceDiagram
    participant C as Cliente (Browser)
    participant N as Next.js SSR
    participant S as Supabase
    participant CDN as Google Fonts/CDN

    C->>N: GET / (landing page)
    N->>S: SELECT landing_config WHERE key='hero'
    S-->>N: { title, subtitle, ctaPrimary, ctaSecondary }
    N->>CDN: Quicksand font CSS
    CDN-->>N: font-face
    N-->>C: HTML renderizado (Hero + Services + Testimonials + Footer)
    C->>C: Intersection Observer → animaciones de scroll
    C->>C: Lazy-load 3D dog model (React Three Fiber)
```

### FLOW-L2: Creación de Cita (Appointment Full Flow)

```mermaid
sequenceDiagram
    participant C as Cliente (Browser)
    participant SA as Server Action
    participant S as Supabase DB
    participant ST as Supabase Storage
    participant AI as OpenAI Vision
    participant R as Resend Email

    C->>C: Llena formulario (customer + pet + service + date)
    C->>C: Sube foto de mascota
    C->>SA: createAppointment(formData) via Server Action
    SA->>SA: Zod validation (appointmentSchema)

    alt Datos inválidos
        SA-->>C: { error: "mensaje de validación" }
    end

    SA->>S: UPSERT customers (email, full_name, phone, whatsapp_opt_in)
    S-->>SA: customer record

    SA->>S: INSERT pets (customer_id, name, breed, age, weight, coat)
    S-->>SA: pet record

    alt Foto de mascota incluida
        SA->>ST: upload pet-photos/{petId}/{timestamp}.{ext}
        ST-->>SA: upload path
        SA->>ST: getPublicUrl(path)
        ST-->>SA: public URL
        SA->>S: UPDATE pets SET photo_url
        SA->>AI: analyzePetPhoto(base64, mimeType)
        AI-->>SA: { coatType, condition, recommendations }
    end

    SA->>S: INSERT appointments (pet_id, customer_id, service_type, scheduled_at, ai_analysis)
    S-->>SA: appointment record

    alt Email configurado
        SA->>R: send confirmation email
        R-->>SA: sent
    end

    SA->>SA: revalidatePath('/dashboard/appointments')
    SA-->>C: { appointmentId, success }
    C->>C: Mostrar pantalla de confirmación
```

### FLOW-L3: Selección de Servicio con Watch Reactivo

```mermaid
sequenceDiagram
    participant C as Cliente
    participant AF as AppointmentForm
    participant RH as React Hook Form (watch)
    participant S as Supabase

    C->>AF: Clic en servicio (ej. "Grooming Completo")
    AF->>RH: setValue('serviceType', 'full_grooming')
    RH->>AF: watch('serviceType') === 'full_grooming'
    AF->>AF: Marca botón seleccionado visualmente
    AF->>C: Muestra paso siguiente (fecha/hora)
    C->>AF: Selecciona fecha y hora
    AF->>RH: setValue('scheduledAt', date)
    C->>AF: Clic "Agendar"
    AF->>RH: handleSubmit() → trigger validation
    RH->>AF: onSubmit(data) → createAppointment(FormData)
```

### FLOW-L4: Verificación de Geolocalización (Cobertura)

```mermaid
sequenceDiagram
    participant B as Browser (navigator.geolocation)
    participant H as useGeolocation Hook
    participant API as /api/salon-location
    participant S as Supabase

    H->>B: navigator.geolocation available?

    alt No disponible
        H-->>B: status: 'unavailable', errorMsg
    end

    H->>API: GET /api/salon-location
    API->>S: SELECT landing_config WHERE key='salon_location'
    S-->>API: { lat, lng, radiusKm, name }
    API-->>H: SalonLocation JSON
    H->>B: navigator.geolocation.getCurrentPosition()
    B-->>H: { latitude, longitude }
    H->>H: haversineKm(client, salon)

    alt distance <= radiusKm
        H-->>B: status: 'in_range'
    else distance > radiusKm
        H-->>B: status: 'out_of_range', distance, errorMsg
    end
```

---

## 🔐 BACKOFFICE (Flujos Admin)

### FLOW-B1: Login (Supabase Auth)

```mermaid
sequenceDiagram
    participant A as Admin (Browser)
    participant N as Next.js /login
    participant SA as Supabase Auth
    participant MW as Middleware

    A->>N: GET /login
    N-->>A: LoginForm (email + contraseña o magic link)

    alt Email + Password
        A->>SA: supabase.auth.signInWithPassword({ email, password })
        SA-->>A: session + user
    else Magic Link
        A->>SA: supabase.auth.signInWithOtp({ email })
        SA-->>A: "Revisa tu email"
        SA->>A: Click magic link → token exchange
        SA-->>A: session + user
    end

    A->>N: redirect → /dashboard
    N->>MW: updateSession(request) — refresh token
    MW-->>N: session válida
    N->>MW: AdminLayout verifica user
    MW-->>N: user autenticado
    N-->>A: Dashboard renderizado
```

### FLOW-B2: Dashboard (Vista General)

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js SSR
    participant S as Supabase

    A->>N: GET /dashboard
    N->>S: auth.getUser() — verificar sesión

    alt No autenticado
        N-->>A: redirect /login
    end

    par Consultas paralelas
        N->>S: SELECT count(*) FROM appointments
        N->>S: SELECT count(*) FROM customers
        N->>S: SELECT count(*) FROM pets
        N->>S: SELECT appointments + pet + customer (ORDER BY scheduled_at DESC LIMIT 5)
    end

    S-->>N: counts + recent appointments
    N-->>A: Dashboard: 4 stat cards + recent appointments table
```

### FLOW-B3: Gestión de Citas (Appointments Admin)

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js /appointments
    participant SA as Server Actions
    participant S as Supabase

    A->>N: GET /appointments
    N->>S: SELECT appointments + pet + customer (ORDER BY scheduled_at)
    S-->>N: appointments list
    N-->>A: Tabla de citas con filtros y acciones

    A->>N: Cambiar estado de cita (pending → confirmed)
    N->>SA: updateAppointmentStatus(id, 'confirmed')
    SA->>S: auth.getUser() — verificar admin
    SA->>S: UPDATE appointments SET status = 'confirmed'
    S-->>SA: updated
    SA->>SA: revalidatePath('/appointments')
    N-->>A: Tabla actualizada, badge cambia a "Confirmada"

    alt Filtro por estado
        A->>N: Seleccionar filtro "Pendientes"
        N->>N: Filtrar client-side o re-fetch
        N-->>A: Solo citas pendientes
    end
```

### FLOW-B4: Gestión de Clientes

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js /customers
    participant S as Supabase

    A->>N: GET /customers
    N->>S: SELECT customers (ORDER BY created_at DESC)
    S-->>N: customers list
    N-->>A: Tabla de clientes con acciones (ver, editar, eliminar)

    A->>N: GET /customers/[id]
    N->>S: SELECT customer WHERE id = [id]
    N->>S: SELECT pets WHERE customer_id = [id]
    N->>S: SELECT appointments WHERE customer_id = [id]
    S-->>N: customer + pets + appointments
    N-->>A: Perfil completo del cliente

    A->>N: Editar cliente
    N->>A: CustomerForm (pre-filled)
    A->>N: Submit cambios
    N->>S: UPDATE customers SET ...
    S-->>N: updated
    N->>N: revalidatePath
    N-->>A: Perfil actualizado
```

### FLOW-B5: Gestión de Productos

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js /products
    participant SA as Server Action
    participant S as Supabase

    A->>N: GET /products
    N->>S: SELECT products (ORDER BY created_at DESC)
    S-->>N: products list
    N-->>A: ProductsManager: lista + formulario crear/editar

    A->>N: Crear producto (nombre, precio, categoría, stock, imagen)
    N->>SA: createProductAction(formData)
    SA->>S: INSERT products (...)
    S-->>SA: product record
    SA-->>N: success
    N-->>A: Producto agregado a la lista

    A->>N: Toggle switch (is_active ON/OFF)
    N->>SA: toggleProductActive(productId, is_active)
    SA->>S: UPDATE products SET is_active = !current
    S-->>SA: updated
    N-->>A: Switch cambia visualmente

    A->>N: Editar producto
    N->>A: Modal con formulario pre-llenado
    A->>N: Guardar cambios
    N->>SA: updateProductAction(productId, formData)
    SA->>S: UPDATE products SET ...
    N-->>A: Producto actualizado en lista
```

### FLOW-B6: CMS — Editor de Contenido

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js /cms
    participant SA as Server Action
    participant S as Supabase

    A->>N: GET /cms
    N->>S: SELECT landing_config (ORDER BY key)
    S-->>N: all config entries
    N-->>A: CmsEditor: tabs Hero, Servicios, Reseñas, Contacto, Horarios

    A->>N: Editar Hero title
    N-->>A: Textarea editable
    A->>N: Guardar cambios
    N->>SA: updateConfigAction('hero', newValue, label)
    SA->>S: auth.getUser() — verificar admin
    SA->>S: UPSERT landing_config SET value
    S-->>SA: updated
    SA->>SA: revalidatePath('/') + revalidatePath('/cms')
    N-->>A: Toast "Guardado", landing se actualiza en vivo

    A->>N: Cambiar a tab "Servicios"
    N-->>A: ServicesManager: CRUD de servicios
    A->>N: Activar/desactivar servicio, editar nombre/precio
    N->>SA: updateConfigAction('services', newServicesArray)
    SA->>S: UPSERT landing_config
    N-->>A: Landing refleja cambios inmediatos
```

### FLOW-B7: Form Builder — Configuración de Formulario

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js /form-builder
    participant SA as Server Action
    participant S as Supabase

    A->>N: GET /form-builder
    N->>S: SELECT landing_config WHERE key='appointment_form_config'
    S-->>N: form config JSON (sections, fields, enabledServiceIds)
    N-->>A: FormBuilderEditor: drag-drop fields

    A->>N: Mover campo "petBreed" arriba de "petAgeYears"
    N->>N: Reordenar array fields
    A->>N: Guardar configuración
    N->>SA: updateConfigAction('appointment_form_config', newConfig)
    SA->>S: UPSERT landing_config
    N-->>A: Toast "Formulario actualizado"

    A->>N: Ocultar campo "petWeightKg"
    N->>N: toggle campo.visible = false
    A->>N: Guardar
    N-->>A: Landing form ahora oculta "Peso (kg)"

    A->>N: Desactivar servicio "Deslanado" de opciones
    N->>N: enabledServiceIds.splice('5')
    A->>N: Guardar
    N-->>A: Formulario muestra solo servicios activos
```

### FLOW-B8: Settings (Configuración General)

```mermaid
sequenceDiagram
    participant A as Admin
    participant N as Next.js /settings
    participant S as Supabase

    A->>N: GET /settings
    N-->>A: Settings page (general configuration)
    A->>N: Actualizar horarios, teléfono, email
    N->>S: UPDATE landing_config WHERE key IN ('contact', 'hours')
    S-->>N: updated
    N-->>A: Configuración guardada
```

---

## 🔌 API (Endpoints Externos)

### FLOW-A1: Form Config API

```mermaid
sequenceDiagram
    participant AF as AppointmentForm (Client)
    participant API as GET /api/form-config
    participant S as Supabase

    AF->>API: GET /api/form-config
    API->>S: SELECT landing_config WHERE key='appointment_form_config'
    S-->>API: form config JSON
    API-->>AF: { sections, fields, enabledServiceIds }
    AF->>AF: Renderizar formulario dinámico con campos y servicios configurados
```

### FLOW-A2: Salon Location API

```mermaid
sequenceDiagram
    participant GH as useGeolocation Hook
    participant API as GET /api/salon-location
    participant S as Supabase

    GH->>API: GET /api/salon-location
    API->>S: SELECT landing_config WHERE key='salon_location'
    S-->>API: { lat, lng, radiusKm, name }
    API-->>GH: SalonLocation JSON
    GH->>GH: Cálculo de distancia haversine
```

### FLOW-A3: WhatsApp Webhook (Inbound)

```mermaid
sequenceDiagram
    participant WA as WhatsApp (Meta API)
    participant API as POST /api/webhooks/whatsapp
    participant S as Supabase

    WA->>API: POST /api/webhooks/whatsapp (webhook payload)
    API->>API: Verificar signature (hub.verify_token)

    alt GET (verificación inicial)
        API-->>WA: hub.challenge
    end

    alt POST (mensaje entrante)
        API->>API: Parse message (text, from, timestamp)
        API->>S: Buscar cliente por teléfono
        API-->>WA: 200 OK (acknowledge)
        Note over API,WA: Procesamiento asíncrono de mensaje
    end
```

---

## 📊 Mapa de Flujos Completo

```
Paws & Glow
├── 🌐 LANDING (Público)
│   ├── FLOW-L1: Navegación landing (Hero → Services → Testimonials → Booking → Footer)
│   ├── FLOW-L2: Creación de cita completa (Customer → Pet → Service → AI → Appointment)
│   ├── FLOW-L3: Selección reactiva de servicio (React Hook Form watch)
│   └── FLOW-L4: Verificación de geolocalización (cobertura de servicio)
│
├── 🔐 BACKOFFICE (Admin autenticado)
│   ├── FLOW-B1: Login (Supabase Auth → Magic Link / Password)
│   ├── FLOW-B2: Dashboard (Stats + citas recientes)
│   ├── FLOW-B3: Gestión de citas (Lista + filtro + cambio de estado)
│   ├── FLOW-B4: Gestión de clientes (CRUD + historial mascotas/citas)
│   ├── FLOW-B5: Gestión de productos (CRUD + toggle activo)
│   ├── FLOW-B6: CMS Editor (Hero, Servicios, Reseñas, Contacto, Horarios)
│   ├── FLOW-B7: Form Builder (Configuración drag-drop del formulario de citas)
│   └── FLOW-B8: Settings (Configuración general)
│
└── 🔌 API (Endpoints externos)
    ├── FLOW-A1: GET /api/form-config → Configuración dinámica del formulario
    ├── FLOW-A2: GET /api/salon-location → Datos de ubicación del local
    └── FLOW-A3: POST /api/webhooks/whatsapp → Webhook entrante WhatsApp
```

---

_Generado por Kurama 🍥 — 2026-04-29_
