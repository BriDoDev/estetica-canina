-- ============================================================
-- Paws & Glow — Supabase Database Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE public.customers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  whatsapp_opt_in  BOOLEAN NOT NULL DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers are viewable by authenticated users"
  ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert customers"
  ON public.customers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can update customers"
  ON public.customers FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- PETS
-- ============================================================
CREATE TABLE public.pets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  breed         TEXT,
  age_years     SMALLINT CHECK (age_years >= 0 AND age_years <= 30),
  weight_kg     DECIMAL(5, 2) CHECK (weight_kg > 0),
  coat_type     TEXT CHECK (coat_type IN ('short', 'medium', 'long', 'curly', 'double')),
  special_notes TEXT,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pets are viewable by authenticated users"
  ON public.pets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert pets"
  ON public.pets FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can update pets"
  ON public.pets FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE public.appointments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id            UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_type      TEXT NOT NULL CHECK (service_type IN (
                      'bath', 'haircut', 'bath_haircut',
                      'nail_trim', 'ear_cleaning', 'full_grooming'
                    )),
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                      'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
                    )),
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_minutes  SMALLINT NOT NULL DEFAULT 60,
  price             DECIMAL(10, 2),
  notes             TEXT,
  pet_photo_url     TEXT,
  ai_analysis       JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments are viewable by authenticated users"
  ON public.appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert appointments"
  ON public.appointments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Authenticated users can update appointments"
  ON public.appointments FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  price            DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category         TEXT NOT NULL CHECK (category IN (
                     'shampoo', 'conditioner', 'tool', 'accessory', 'treatment'
                   )),
  stock_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url        TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Only authenticated users can manage products"
  ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- LANDING CONFIG (CMS)
-- ============================================================
CREATE TABLE public.landing_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT NOT NULL UNIQUE,
  value       JSONB NOT NULL,
  label       TEXT,
  updated_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.landing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing config is viewable by everyone"
  ON public.landing_config FOR SELECT USING (TRUE);
CREATE POLICY "Only authenticated users can manage landing config"
  ON public.landing_config FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED: Landing Config defaults
-- ============================================================
INSERT INTO public.landing_config (key, value, label) VALUES
  ('hero_title', '"Tu mascota merece brillar"', 'Título principal del hero'),
  ('hero_subtitle', '"Estética canina de alto nivel con IA"', 'Subtítulo del hero'),
  ('contact_phone', '"+52 55 0000 0000"', 'Teléfono de contacto'),
  ('contact_email', '"hola@pawsandglow.mx"', 'Correo de contacto'),
  ('business_hours', '{"weekdays": "9:00 - 19:00", "saturday": "9:00 - 17:00", "sunday": "Cerrado"}', 'Horarios de atención');

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_pets
  BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_landing_config
  BEFORE UPDATE ON public.landing_config FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ## Additional Seeds — landing_config default data
-- ============================================================

INSERT INTO public.landing_config (key, value, label)
VALUES (
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
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label)
VALUES (
  'reviews',
  '[
    {"id":"1","name":"Sofía Ramírez","pet":"Dueña de Coco (Poodle)","comment":"Increíble servicio. El análisis de IA detectó que Coco necesitaba un tratamiento especial para su pelo rizado. ¡Quedó hermoso!","rating":5,"active":true},
    {"id":"2","name":"Carlos Mendoza","pet":"Dueño de Thor (Golden Retriever)","comment":"Agendé la cita en minutos y me avisaron por WhatsApp. El resultado fue espectacular. 100% recomendado.","rating":5,"active":true},
    {"id":"3","name":"Laura Vega","pet":"Dueña de Luna (Shih Tzu)","comment":"La experiencia completa es excelente. El equipo es muy profesional y Luna siempre sale feliz y hermosa.","rating":5,"active":true}
  ]'::jsonb,
  'Reseñas'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label)
VALUES (
  'hero',
  '{"title":"Tu mascota merece brillar ✨","subtitle":"Estética canina de alto nivel con diagnóstico por inteligencia artificial.","ctaPrimary":"Agendar cita","ctaSecondary":"Ver servicios"}'::jsonb,
  'Hero'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label)
VALUES (
  'contact',
  '{"phone":"+52 55 1234 5678","email":"hola@pawsandglow.mx","address":""}'::jsonb,
  'Contacto'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label)
VALUES (
  'hours',
  '{"weekdays":"Lun–Vie: 9:00–19:00","saturday":"Sáb: 9:00–17:00","sunday":"Dom: Cerrado"}'::jsonb,
  'Horarios'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label) VALUES
  ('services', '[{"id":"1","name":"Baño Profundo","description":"Limpieza profunda con productos premium","price":"Desde $250","badge":"Popular","icon":"🛁","active":true},{"id":"2","name":"Corte Profesional","description":"Corte personalizado según la raza","price":"Desde $350","badge":null,"icon":"✂️","active":true},{"id":"3","name":"Grooming Completo","description":"Baño, corte, uñas, oídos y más","price":"Desde $550","badge":"Recomendado","icon":"✨","active":true},{"id":"4","name":"Cuidado Especial","description":"Tratamientos dermatológicos para pelo dañado","price":"Desde $400","badge":"IA Diagnóstico","icon":"❤️","active":true},{"id":"5","name":"Deslanado","description":"Remoción del pelo muerto para doble capa","price":"Desde $450","badge":null,"icon":"💨","active":true},{"id":"6","name":"Spa Canino","description":"Aromaterapia, masaje relajante y más","price":"Desde $700","badge":"Premium","icon":"⭐","active":true}]', 'Servicios de la landing'),
  ('reviews', '[{"id":"1","name":"María García","rating":5,"comment":"¡Increíble servicio! Max salió hermoso y muy feliz. La tecnología de IA para analizar su pelo fue impresionante.","date":"2024-01-15","active":true},{"id":"2","name":"Carlos Rodríguez","rating":5,"comment":"Profesionales de verdad. Mi Golden quedó perfecto y el proceso fue muy relajante para él.","date":"2024-02-03","active":true},{"id":"3","name":"Ana López","rating":5,"comment":"El análisis con IA detectó que Bella necesitaba un tratamiento especial. Quedó increíble.","date":"2024-02-20","active":true}]', 'Reseñas de clientes'),
  ('grooming_image_count', '1', 'Número de imágenes de corte generadas por IA (1-4)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label)
VALUES (
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
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.landing_config (key, value, label)
VALUES (
  'salon_location',
  '{"lat":19.1862,"lng":-98.9477,"radiusKm":1.5,"name":"San Salvador Cuauhtenco"}'::jsonb,
  'Ubicación del local y radio de cobertura'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Storage Bucket setup (run via Supabase Dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
--
-- CREATE POLICY "Anyone can upload pet photos"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos');
-- CREATE POLICY "Pet photos are publicly readable"
--   ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
