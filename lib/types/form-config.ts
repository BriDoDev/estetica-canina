export interface FormFieldConfig {
  id: string
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'datetime'
  name: string
  label: string
  placeholder?: string
  required: boolean
  section: 'customer' | 'pet' | 'service'
  order: number
  visible: boolean
  width: 'full' | 'half' | 'third'
  options?: { value: string; label: string }[]
}

export interface FormConfig {
  sections: {
    customer: { title: string; visible: boolean }
    pet: { title: string; visible: boolean }
    service: { title: string; visible: boolean }
  }
  fields: FormFieldConfig[]
  enabledServiceIds: string[]
}

export const CORE_FIELD_IDS = ['customerName', 'customerEmail', 'customerPhone', 'scheduledAt', 'petName']

export const DEFAULT_FORM_CONFIG: FormConfig = {
  sections: {
    customer: { title: 'Tus datos de contacto', visible: true },
    pet: { title: 'Datos de tu mascota', visible: true },
    service: { title: 'Selecciona el servicio', visible: true },
  },
  fields: [
    { id: 'customerName', type: 'text', name: 'customerName', label: 'Nombre completo', placeholder: 'María García López', required: true, section: 'customer', order: 1, visible: true, width: 'full' },
    { id: 'customerEmail', type: 'email', name: 'customerEmail', label: 'Correo electrónico', placeholder: 'maria@ejemplo.com', required: true, section: 'customer', order: 2, visible: true, width: 'full' },
    { id: 'customerPhone', type: 'tel', name: 'customerPhone', label: 'Teléfono / WhatsApp', placeholder: '+52 55 1234 5678', required: true, section: 'customer', order: 3, visible: true, width: 'full' },
    { id: 'whatsappOptIn', type: 'checkbox', name: 'whatsappOptIn', label: 'Recibir recordatorios por WhatsApp', required: false, section: 'customer', order: 4, visible: true, width: 'full' },
    { id: 'petName', type: 'text', name: 'petName', label: 'Nombre de la mascota', placeholder: 'Max', required: true, section: 'pet', order: 1, visible: true, width: 'half' },
    { id: 'petBreed', type: 'text', name: 'petBreed', label: 'Raza', placeholder: 'Golden Retriever', required: false, section: 'pet', order: 2, visible: true, width: 'half' },
    { id: 'petAgeYears', type: 'number', name: 'petAgeYears', label: 'Edad (años)', placeholder: '3', required: false, section: 'pet', order: 3, visible: true, width: 'third' },
    { id: 'petWeightKg', type: 'number', name: 'petWeightKg', label: 'Peso (kg)', placeholder: '8.5', required: false, section: 'pet', order: 4, visible: true, width: 'third' },
    { id: 'coatType', type: 'select', name: 'coatType', label: 'Tipo de pelo', required: false, section: 'pet', order: 5, visible: true, width: 'third', options: [{ value: 'short', label: 'Pelo corto' }, { value: 'medium', label: 'Pelo mediano' }, { value: 'long', label: 'Pelo largo' }, { value: 'curly', label: 'Pelo rizado' }, { value: 'double', label: 'Doble capa' }] },
    { id: 'notes', type: 'textarea', name: 'notes', label: 'Notas especiales', placeholder: 'Alergias, comportamiento especial...', required: false, section: 'pet', order: 6, visible: true, width: 'full' },
    { id: 'scheduledAt', type: 'datetime', name: 'scheduledAt', label: 'Fecha y hora', required: true, section: 'service', order: 1, visible: true, width: 'full' },
  ],
  enabledServiceIds: ['1', '2', '3', '4', '5', '6'],
}
