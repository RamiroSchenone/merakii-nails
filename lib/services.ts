import { supabase } from './supabase'
import { Service, ServiceInsert, Reservation, ReservationInsert, PortfolioItem, PortfolioItemInsert, MercadoPagoToken, MercadoPagoTokenInsert } from './database.types'

// Servicios
export class ServicesService {
  static async getAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(service: ServiceInsert): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<ServiceInsert>): Promise<Service> {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update service')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating service via API:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Reservas
export class ReservationsService {
  static async getAll(): Promise<(Reservation & { service: Service })[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        service:services(*)
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<(Reservation & { service: Service }) | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        service:services(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getByEmail(email: string): Promise<(Reservation & { service: Service })[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        service:services(*)
      `)
      .eq('customer_email', email)
      .order('appointment_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async create(reservation: ReservationInsert): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<ReservationInsert>): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getAvailableTimeSlots(date: string): Promise<string[]> {
    // Obtener todas las reservas para la fecha específica
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('appointment_time, service:services(duration)')
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed'])

    if (error) throw error

    // Horarios disponibles (9:00 AM - 6:30 PM cada 30 minutos)
    const allTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ]

    // Calcular horarios ocupados considerando la duración del servicio
    const occupiedSlots = new Set<string>()
    
    reservations?.forEach(reservation => {
      const startTime = reservation.appointment_time
      const duration = (reservation.service as any)?.duration || 60
      
      // Calcular slots ocupados basado en la duración
      const startMinutes = this.timeToMinutes(startTime)
      const endMinutes = startMinutes + duration
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const slot = this.minutesToTime(minutes)
        if (allTimeSlots.includes(slot)) {
          occupiedSlots.add(slot)
        }
      }
    })

    // Retornar solo los horarios disponibles
    return allTimeSlots.filter(slot => !occupiedSlots.has(slot))
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
}

// Portfolio
export class PortfolioService {
  static async getAll(): Promise<PortfolioItem[]> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getFeatured(): Promise<PortfolioItem[]> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_featured', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getByTags(tags: string[]): Promise<PortfolioItem[]> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .overlaps('tags', tags)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(item: PortfolioItemInsert): Promise<PortfolioItem> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<PortfolioItemInsert>): Promise<PortfolioItem> {
    const { data, error } = await supabase
      .from('portfolio_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Tokens de MercadoPago
export class MercadoPagoTokensService {
  static async getByUserId(userId: string): Promise<MercadoPagoToken | null> {
    const { data, error } = await supabase
      .from('mercado_pago_tokens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  }

  static async createOrUpdate(tokenData: MercadoPagoTokenInsert): Promise<MercadoPagoToken> {
    const { data, error } = await supabase
      .from('mercado_pago_tokens')
      .upsert(tokenData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteByUserId(userId: string): Promise<void> {
    const { error } = await supabase
      .from('mercado_pago_tokens')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  }
}
