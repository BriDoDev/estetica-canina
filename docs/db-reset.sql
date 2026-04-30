-- ============================================================
-- Paws & Glow — DB Reset & Re-Seed (2026-04-29)
-- Ejecutar en Supabase SQL Editor para limpiar y regenerar.
-- ============================================================

-- 1. LIMPIAR TODOS LOS DATOS (respeta FK constraints)
DELETE FROM public.appointments;
DELETE FROM public.pets;
DELETE FROM public.customers;
DELETE FROM public.landing_config;
DELETE FROM public.products;
DELETE FROM public.profiles;

-- 2. RESET LANDING CONFIG (CMS)
INSERT INTO public.landing_config (key, value, label) VALUES
  ('hero', '{"title":"Tu mascota merece brillar ✨","subtitle":"Estética canina de alto nivel con diagnóstico por inteligencia artificial.","ctaPrimary":"Agendar cita","ctaSecondary":"Ver servicios"}'::jsonb, 'Hero'),
  ('contact', '{"phone":"+52 55 1234 5678","email":"hola@pawsandglow.mx","address":""}'::jsonb, 'Contacto'),
  ('hours', '{"weekdays":"Lun–Vie: 9:00–19:00","saturday":"Sáb: 9:00–17:00","sunday":"Dom: Cerrado"}'::jsonb, 'Horarios'),
  ('grooming_image_count', '1', 'Número de imágenes de corte generadas por IA (1-4)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 3. RESET SERVICES
INSERT INTO public.landing_config (key, value, label) VALUES (
  'services',
  '[
    {"id":"1","icon":"🛁","name":"Baño Profundo","description":"Limpieza profunda con productos premium. Incluye secado y cepillado.","price":"Desde $250","badge":"Popular","active":true},
    {"id":"2","icon":"✂️","name":"Corte Profesional","description":"Corte personalizado según la raza y preferencias del dueño.","price":"Desde $350","badge":null,"active":true},
    {"id":"3","icon":"✨","name":"Grooming Completo","description":"Baño, corte, uñas, oídos y todo lo que tu mascota necesita.","price":"Desde $550","badge":"Recomendado","active":true},
    {"id":"4","icon":"💚","name":"Cuidado Especial","description":"Tratamientos dermatológicos y mascarillas para pelo dañado.","price":"Desde $400","badge":"IA Diagnóstico","active":true},
    {"id":"5","icon":"🌀","name":"Deslanado","description":"Remoción profesional del pelo muerto para razas de doble capa.","price":"Desde $450","badge":null,"active":true},
    {"id":"6","icon":"🌟","name":"Spa Canino","description":"Experiencia premium: aromaterapia, masaje relajante y más.","price":"Desde $700","badge":"Premium","active":true}
  ]'::jsonb,
  'Servicios'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 4. RESET REVIEWS
INSERT INTO public.landing_config (key, value, label) VALUES (
  'reviews',
  '[
    {"id":"1","name":"Sofía Ramírez","pet":"Dueña de Coco (Poodle)","comment":"Increíble servicio. El análisis de IA detectó que Coco necesitaba un tratamiento especial para su pelo rizado. ¡Quedó hermoso!","rating":5,"active":true},
    {"id":"2","name":"Carlos Mendoza","pet":"Dueño de Thor (Golden Retriever)","comment":"Agendé la cita en minutos y me avisaron por WhatsApp. El resultado fue espectacular. 100% recomendado.","rating":5,"active":true},
    {"id":"3","name":"Laura Vega","pet":"Dueña de Luna (Shih Tzu)","comment":"La experiencia completa es excelente. El equipo es muy profesional y Luna siempre sale feliz y hermosa.","rating":5,"active":true}
  ]'::jsonb,
  'Reseñas'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 5. RESET SALON LOCATION
INSERT INTO public.landing_config (key, value, label) VALUES (
  'salon_location',
  '{"lat":19.1862,"lng":-98.9477,"radiusKm":1.5,"name":"San Salvador Cuauhtenco"}'::jsonb,
  'Ubicación del local y radio de cobertura'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 6. RESET APPOINTMENT FORM CONFIG (con nuevos service types)
INSERT INTO public.landing_config (key, value, label) VALUES (
  'appointment_form_config',
  '{
    "sections": {
      "customer": {"title": "Tus datos de contacto", "visible": true},
      "pet": {"title": "Datos de tu mascota", "visible": true},
      "service": {"title": "Selecciona el servicio", "visible": true}
    },
    "fields": [
      {"id":"customerName","type":"text","name":"customerName","label":"Nombre completo","placeholder":"María García López","required":true,"section":"customer","order":1,"visible":true,"width":"full"},
      {"id":"customerEmail","type":"email","name":"customerEmail","label":"Correo electrónico","placeholder":"maria@ejemplo.com","required":true,"section":"customer","order":2,"visible":true,"width":"full"},
      {"id":"customerPhone","type":"tel","name":"customerPhone","label":"Teléfono / WhatsApp","placeholder":"+52 55 1234 5678","required":true,"section":"customer","order":3,"visible":true,"width":"full"},
      {"id":"whatsappOptIn","type":"checkbox","name":"whatsappOptIn","label":"Recibir recordatorios por WhatsApp","required":false,"section":"customer","order":4,"visible":true,"width":"full"},
      {"id":"petName","type":"text","name":"petName","label":"Nombre de la mascota","placeholder":"Max","required":true,"section":"pet","order":1,"visible":true,"width":"half"},
      {"id":"petBreed","type":"text","name":"petBreed","label":"Raza","placeholder":"Golden Retriever","required":false,"section":"pet","order":2,"visible":true,"width":"half"},
      {"id":"petAgeYears","type":"number","name":"petAgeYears","label":"Edad (años)","placeholder":"3","required":false,"section":"pet","order":3,"visible":true,"width":"third"},
      {"id":"petWeightKg","type":"number","name":"petWeightKg","label":"Peso (kg)","placeholder":"8.5","required":false,"section":"pet","order":4,"visible":true,"width":"third"},
      {"id":"coatType","type":"select","name":"coatType","label":"Tipo de pelo","required":false,"section":"pet","order":5,"visible":true,"width":"third","options":[{"value":"short","label":"Pelo corto"},{"value":"medium","label":"Pelo mediano"},{"value":"long","label":"Pelo largo"},{"value":"curly","label":"Pelo rizado"},{"value":"double","label":"Doble capa"}]},
      {"id":"notes","type":"textarea","name":"notes","label":"Notas especiales","placeholder":"Alergias, comportamiento especial...","required":false,"section":"pet","order":6,"visible":true,"width":"full"},
      {"id":"scheduledAt","type":"datetime","name":"scheduledAt","label":"Fecha y hora","required":true,"section":"service","order":1,"visible":true,"width":"full"}
    ],
    "enabledServiceIds": ["1","2","3","4","5","6"]
  }'::jsonb,
  'Configuración del formulario de citas'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 7. VERIFY
SELECT key, label FROM public.landing_config ORDER BY key;
