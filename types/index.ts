import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Pet = Database['public']['Tables']['pets']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type LandingConfig = Database['public']['Tables']['landing_config']['Row']

export type ServiceType = Appointment['service_type']
export type AppointmentStatus = Appointment['status']
export type CoatType = Pet['coat_type']

export interface PetAnalysisResult {
  breed: string
  estimatedAge: string
  coatCondition: 'excellent' | 'good' | 'needs_attention' | 'poor'
  coatType: string
  recommendations: PetRecommendation[]
  urgentCare: string | null
  estimatedGroomingTime: number
  isDog?: boolean
  specialNotes?: string
}

export interface PetRecommendation {
  service: string
  priority: 'high' | 'medium' | 'low'
  description: string
  estimatedPrice: string
}

export interface GroomingStyleSuggestion {
  id: string
  name: string
  description: string
  dallePrompt: string
}

export interface AppointmentWithDetails extends Appointment {
  pet: Pet
  customer: Customer
}
