# Paws & Glow — Documentación para Stakeholders

## Resumen Ejecutivo

**Paws & Glow** es la primera plataforma de estética canina en México que combina **inteligencia artificial** con un flujo de atención completamente digital. Los dueños de mascotas agendan citas, suben fotos de sus perros, y reciben un diagnóstico automático del tipo de pelaje con recomendaciones personalizadas — todo desde una landing page o un código QR. El negocio gana eficiencia operativa, trazabilidad total, y un diferenciador de mercado imposible de ignorar.

---

## Problema que Resuelve

### Antes de Paws & Glow (Procesos Manuales)

| Proceso                    | Dolor                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Agendamiento**           | Llamadas telefónicas o mensajes de WhatsApp desorganizados. Dobles reservas, información incompleta, pérdida de citas. |
| **Registro de mascotas**   | Papel o notas del celular. Sin historial de servicios, condiciones médicas, o preferencias.                            |
| **Selección de servicios** | El cliente no sabe qué necesita su perro. El staff tiene que adivinar sin ver al animal.                               |
| **Confirmaciones**         | Llamar uno por uno para confirmar. Consume horas del staff cada semana.                                                |
| **Recordatorios**          | Inexistentes. Alto índice de no-shows (~30% en el sector).                                                             |
| **Marketing**              | Boca a boca solamente. Sin sistema para capturar reseñas, mostrar servicios premium, o hacer upsell.                   |

### Después de Paws & Glow

| Proceso                        | Solución Digital                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Agendamiento autoservicio**  | Formulario inteligente 24/7. El cliente elige fecha, servicio, y sube foto de su mascota en 2 minutos.                                                                                                             |
| **Diagnóstico IA**             | 🧠 **Diferenciador clave.** OpenAI Vision analiza la foto del perro y recomienda: baño profundo, corte específico, tratamiento dermatológico, o deslanado. Esto convierte la visita en una consulta personalizada. |
| **Perfil completo de mascota** | Base de datos con historial: raza, edad, peso, tipo de pelo, fotos anteriores, notas especiales.                                                                                                                   |
| **Confirmaciones automáticas** | Email + WhatsApp automáticos al crear la cita. Recordatorio 24h antes.                                                                                                                                             |
| **Dashboard de gestión**       | Vista de calendario con todas las citas, filtros por estado, gestión de clientes y productos.                                                                                                                      |
| **CMS para marketing**         | Control total sobre landing page: hero, servicios, reseñas y formularios. Sin depender de un desarrollador.                                                                                                        |

---

## Propuesta de Valor

### Para el Dueño de Mascota

- 🐶 Agenda en 2 minutos, 24/7
- 📸 **Subes una foto y la IA te dice qué necesita tu perro** — sin ser experto
- 💬 Confirmaciones y recordatorios por WhatsApp
- 💳 Transparencia de precios por servicio

### Para el Negocio (Estética Canina)

- ⏱️ **Reducción de ~10 horas/semana** en llamadas y mensajes de coordinación
- 📉 **No-shows bajan de ~30% a <10%** con recordatorios automáticos
- 🧠 **IA como ventaja competitiva** — ningún competidor local ofrece esto
- 📊 **Datos y métricas** de ocupación, servicios más vendidos, clientes frecuentes
- 🛒 **Upsell automatizado**: la IA recomienda servicios premium basados en el estado real del pelaje (no en lo que el cliente cree que necesita)

---

## KPIs de Impacto Esperados

| Métrica                        | Antes               | Después (proyectado) |
| ------------------------------ | ------------------- | -------------------- |
| Tiempo por agendamiento        | 8-15 min (teléfono) | 2 min (autoservicio) |
| Tasa de no-show                | ~30%                | <10%                 |
| Ticket promedio                | $350 MXN            | $550 MXN (upsell IA) |
| Reseñas capturadas/mes         | 0-2                 | 15-30                |
| Citas fuera de horario laboral | 0%                  | ~40%                 |

---

## Roadmap

| Fase             | Entregable                                                  | Estado           |
| ---------------- | ----------------------------------------------------------- | ---------------- |
| **MVP (Actual)** | Landing + Formulario de citas + IA + Panel Admin + Supabase | ✅ Producción    |
| **Fase 2**       | WhatsApp Business API integrada + Recordatorios automáticos | 🚧 En desarrollo |
| **Fase 3**       | Pasarela de pagos (Stripe/MercadoPago)                      | 📋 Planeado      |
| **Fase 4**       | App móvil PWA completa + Fidelización (puntos/recompensas)  | 📋 Planeado      |

---

## Riesgos y Mitigaciones

| Riesgo                         | Mitigación                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Costo de IA (OpenAI)**       | Tokens optimizados: imágenes redimensionadas a 512px, prompts concisos. Costo estimado: ~$0.02 USD por análisis.                |
| **Adopción de clientes**       | Código QR en el local físico, campaña de WhatsApp, video de social media mostrando el diagnóstico IA en acción.                 |
| **Dependencia de Supabase**    | Es PostgreSQL estándar. Migrable a cualquier proveedor PostgreSQL. Backup automático incluido en plan Pro.                      |
| **Competencia copiando la IA** | Ventaja de primer movimiento. La calidad del dataset de entrenamiento y los prompts propios son el moat, no solo la tecnología. |

---

## Conclusión

Paws & Glow no es "otra página de estética canina". Es una plataforma que **reemplaza 6 procesos manuales por uno digital**, añade **inteligencia artificial como diferenciador permanente**, y está diseñada para escalar de un local a múltiples sucursales sin cambios de arquitectura.

El retorno de inversión no está en el software — está en las horas de staff que se liberan, los no-shows que se eliminan, y los tickets de $550 que reemplazan a los de $350.

---

_Generado por Kurama 🍥 — 2026-04-29_
