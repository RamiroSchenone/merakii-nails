export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          name: string
          description: string
          duration: number // en minutos
          price: number // en centavos
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          duration: number
          price: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          duration?: number
          price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_email: string
          customer_phone: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          total_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          tags: string[]
          is_featured: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url: string
          tags: string[]
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          tags?: string[]
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      mercado_pago_tokens: {
        Row: {
          id: string
          user_id: string
          access_token: string
          refresh_token: string
          scope: string | null
          expires_in: number | null
          token_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          refresh_token: string
          scope?: string | null
          expires_in?: number | null
          token_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          refresh_token?: string
          scope?: string | null
          expires_in?: number | null
          token_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      working_hours: {
        Row: {
          id: string
          day_of_week: number
          day_name: string
          is_working: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          day_name: string
          is_working: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          day_name?: string
          is_working?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
}

// Tipos de ayuda para usar en la aplicación
export type Service = Database['public']['Tables']['services']['Row']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']

export type Reservation = Database['public']['Tables']['reservations']['Row']
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']

export type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row']
export type PortfolioItemInsert = Database['public']['Tables']['portfolio_items']['Insert']
export type PortfolioItemUpdate = Database['public']['Tables']['portfolio_items']['Update']

export type MercadoPagoToken = Database['public']['Tables']['mercado_pago_tokens']['Row']
export type MercadoPagoTokenInsert = Database['public']['Tables']['mercado_pago_tokens']['Insert']
export type MercadoPagoTokenUpdate = Database['public']['Tables']['mercado_pago_tokens']['Update']

export type WorkingHours = Database['public']['Tables']['working_hours']['Row']
export type WorkingHoursInsert = Database['public']['Tables']['working_hours']['Insert']
export type WorkingHoursUpdate = Database['public']['Tables']['working_hours']['Update']
