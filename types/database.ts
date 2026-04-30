export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'staff'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'staff'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'staff'
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          whatsapp_opt_in: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          whatsapp_opt_in?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          phone?: string
          whatsapp_opt_in?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          id: string
          customer_id: string
          name: string
          breed: string | null
          age_years: number | null
          weight_kg: number | null
          coat_type: 'short' | 'medium' | 'long' | 'curly' | 'double' | null
          special_notes: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          name: string
          breed?: string | null
          age_years?: number | null
          weight_kg?: number | null
          coat_type?: 'short' | 'medium' | 'long' | 'curly' | 'double' | null
          special_notes?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          customer_id?: string
          name?: string
          breed?: string | null
          age_years?: number | null
          weight_kg?: number | null
          coat_type?: 'short' | 'medium' | 'long' | 'curly' | 'double' | null
          special_notes?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pets_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          }
        ]
      }
      appointments: {
        Row: {
          id: string
          pet_id: string
          customer_id: string
          service_type: 'bath' | 'haircut' | 'bath_haircut' | 'nail_trim' | 'ear_cleaning' | 'full_grooming' | 'special_care' | 'deshedding' | 'spa_canine'
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_at: string
          duration_minutes: number
          price: number | null
          notes: string | null
          pet_photo_url: string | null
          ai_analysis: Json | null
          actual_price: number | null
          completed_at: string | null
          tracking_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          customer_id: string
          service_type: 'bath' | 'haircut' | 'bath_haircut' | 'nail_trim' | 'ear_cleaning' | 'full_grooming' | 'special_care' | 'deshedding' | 'spa_canine'
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_at: string
          duration_minutes?: number
          price?: number | null
          notes?: string | null
          pet_photo_url?: string | null
          ai_analysis?: Json | null
          actual_price?: number | null
          completed_at?: string | null
          tracking_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          pet_id?: string
          customer_id?: string
          service_type?: 'bath' | 'haircut' | 'bath_haircut' | 'nail_trim' | 'ear_cleaning' | 'full_grooming' | 'special_care' | 'deshedding' | 'spa_canine'
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_at?: string
          duration_minutes?: number
          price?: number | null
          notes?: string | null
          pet_photo_url?: string | null
          ai_analysis?: Json | null
          actual_price?: number | null
          completed_at?: string | null
          tracking_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_pet_id_fkey'
            columns: ['pet_id']
            isOneToOne: false
            referencedRelation: 'pets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: 'shampoo' | 'conditioner' | 'tool' | 'accessory' | 'treatment'
          stock_quantity: number
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: 'shampoo' | 'conditioner' | 'tool' | 'accessory' | 'treatment'
          stock_quantity?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          category?: 'shampoo' | 'conditioner' | 'tool' | 'accessory' | 'treatment'
          stock_quantity?: number
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      landing_config: {
        Row: {
          id: string
          key: string
          value: Json
          label: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          label?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          label?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
