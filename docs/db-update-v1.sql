-- ============================================================
-- Paws & Glow v1.0.0 — Production DB Update
-- Ejecutar en Supabase SQL Editor (NO destructivo — solo ALTER)
-- ============================================================

-- 1. Agregar nuevos tipos de servicio (if not exists via re-create constraint)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_service_type_check;

ALTER TABLE public.appointments ADD CONSTRAINT appointments_service_type_check CHECK (
  service_type IN (
    'bath', 'haircut', 'bath_haircut',
    'nail_trim', 'ear_cleaning', 'full_grooming',
    'special_care', 'deshedding', 'spa_canine'
  )
);

-- 2. Agregar campos de seguimiento post-cita
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS actual_price DECIMAL(10, 2);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tracking_notes TEXT;

-- 3. Actualizar seeds de servicios con los nuevos tipos
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

-- 4. Verificar estructura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
