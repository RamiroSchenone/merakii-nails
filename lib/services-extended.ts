import { supabase } from './supabase'
import { Service, ServiceInsert, Reservation, ReservationInsert, PortfolioItem, PortfolioItemInsert, WorkingHours, WorkingHoursInsert } from './database.types'

// Servicios existentes (ya funcionan)
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

  static async getAllForAdmin(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
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
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    // Primero verificar si hay reservas que dependen de este servicio
    const { data: reservations, error: checkError } = await supabase
      .from('reservations')
      .select('id')
      .eq('service_id', id)

    if (checkError) throw checkError

    if (reservations && reservations.length > 0) {
      throw new Error(`No se puede eliminar el servicio porque tiene ${reservations.length} reserva(s) asociada(s). Primero elimina las reservas o desactiva el servicio.`)
    }

    // Si no hay reservas, proceder con la eliminación
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Servicio para estadísticas del dashboard
export class DashboardStatsService {
  static async getAll(): Promise<any[]> {
    // Calcular estadísticas dinámicamente en lugar de usar tabla estática
    const stats = await this.calculateDynamicStats()
    return stats
  }

  static async getByKey(key: string): Promise<any | null> {
    const stats = await this.calculateDynamicStats()
    return stats.find(stat => stat.stat_key === key) || null
  }

  static async updateStat(key: string, value: number): Promise<any> {
    // Ya no necesitamos actualizar estadísticas estáticas
    // Las estadísticas se calculan dinámicamente
    return { stat_key: key, stat_value: value }
  }

  private static async calculateDynamicStats(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // 1. Reservas Activas (pendientes desde hoy en adelante)
    const { data: activeReservations, error: activeError } = await supabase
      .from('reservations')
      .select('id')
      .eq('status', 'pending')
      .gte('appointment_date', today)

    if (activeError) throw activeError

    // 2. Servicios Activos
    const { data: activeServices, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('is_active', true)

    if (servicesError) throw servicesError

    // 3. Clientes Únicos (por email)
    const { data: uniqueCustomers, error: customersError } = await supabase
      .from('reservations')
      .select('customer_email')
      .not('customer_email', 'is', null)

    if (customersError) throw customersError

    // Contar clientes únicos por email
    const uniqueCustomerEmails = new Set(
      uniqueCustomers?.map(customer => customer.customer_email.trim().toLowerCase()) || []
    )

    // 4. Ingresos del mes actual (solo reservas completadas)
    const { data: completedReservations, error: revenueError } = await supabase
      .from('reservations')
      .select('total_price, appointment_date')
      .eq('status', 'completed')
      .gte('appointment_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('appointment_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)

    if (revenueError) throw revenueError

    // Calcular ingresos totales del mes
    const monthlyRevenue = completedReservations?.reduce((total, reservation) => {
      return total + (reservation.total_price || 0)
    }, 0) || 0

    return [
      {
        stat_key: 'reservations_today',
        stat_value: activeReservations?.length || 0,
        stat_name: 'Reservas Activas',
        last_updated: new Date().toISOString()
      },
      {
        stat_key: 'active_services',
        stat_value: activeServices?.length || 0,
        stat_name: 'Servicios Activos',
        last_updated: new Date().toISOString()
      },
      {
        stat_key: 'total_customers',
        stat_value: uniqueCustomerEmails.size,
        stat_name: 'Clientes Únicos',
        last_updated: new Date().toISOString()
      },
      {
        stat_key: 'monthly_revenue',
        stat_value: monthlyRevenue,
        stat_name: 'Ingresos del Mes',
        last_updated: new Date().toISOString()
      }
    ]
  }
}

// Servicio para configuración del sitio
export class SiteConfigService {
  static async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .order('key')

    if (error) throw error
    return data || []
  }

  static async getByKey(key: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', key)
      .single()

    if (error) throw error
    return data
  }

  static async updateConfig(key: string, value: string): Promise<any> {
    const { data, error } = await supabase
      .from('site_config')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Servicio para horarios de trabajo
export class WorkingHoursService {
  static async getAll(): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week')

    if (error) throw error
    return data || []
  }

  static async getByDay(dayOfWeek: number): Promise<WorkingHours | null> {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .single()

    if (error) throw error
    return data
  }

  static async updateWorkingHours(dayOfWeek: number, isWorking: boolean, startTime?: string, endTime?: string): Promise<WorkingHours | null> {
    if (!isWorking) {
      // Si el día está desactivado, eliminar el registro
      const { error } = await supabase
        .from('working_hours')
        .delete()
        .eq('day_of_week', dayOfWeek)
      
      if (error) throw error
      return null
    } else {
      // Mapear número del día al nombre
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const dayName = dayNames[dayOfWeek]

      // Si el día está activado, crear o actualizar el registro
      const workingHoursData: WorkingHoursInsert = {
        day_of_week: dayOfWeek,
        day_name: dayName,
        is_working: isWorking,
        start_time: startTime || null,
        end_time: endTime || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('working_hours')
        .upsert(workingHoursData)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}

// Servicio para obtener horarios disponibles dinámicamente
export class TimeSlotsService {
  static async getTimeSlotsWithStatus(date: string): Promise<{ time: string, isOccupied: boolean }[]> {
    try {
      // Verificar si está en cache
      const cacheKey = `working_hours_${date}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
      
      // Obtener horarios de trabajo usando la misma lógica del calendario
      const workingHours = await WorkingHoursService.getAll()
      const appointmentDate = new Date(date)
      const dayOfWeek = appointmentDate.getDay()
      
      // Buscar el día de trabajo
      const workingDay = workingHours.find(day => 
        day.day_of_week === dayOfWeek && day.is_working
      )
      
      if (!workingDay) {
        // Temporal: generar horarios básicos para días de trabajo si no hay configuración
        if (dayOfWeek === 5 || dayOfWeek === 6) { // Viernes o Sábado
          const tempSlots = []
          for (let hour = 9; hour < 18; hour++) {
            tempSlots.push(`${hour.toString().padStart(2, '0')}:00`)
          }
          
          // Obtener reservas existentes para la fecha
          const { data: reservations, error: reservationsError } = await supabase
            .from('reservations')
            .select(`
              appointment_time,
              services(duration)
            `)
            .eq('appointment_date', date)
            .in('status', ['pending', 'confirmed'])
          
          if (reservationsError) {
            console.error('Error obteniendo reservas:', reservationsError)
          }
          
          // Crear conjunto de horarios ocupados
          const occupiedTimes = new Set<string>()
          
          if (reservations && reservations.length > 0) {
            reservations.forEach(reservation => {
              const serviceDuration = (reservation.services as any)?.duration || 60
              const slotsNeeded = Math.ceil(serviceDuration / 60)
              
              // Bloquear todos los slots necesarios
              for (let i = 0; i < slotsNeeded; i++) {
                const slotTime = this.addHoursToTime(reservation.appointment_time, i)
                occupiedTimes.add(slotTime)
              }
            })
          }
          
          const result = tempSlots.map(time => ({
            time,
            isOccupied: occupiedTimes.has(time)
          }))
          
          return result
        }
        
        return []
      }
      
      // Generar horarios de 1 hora
      const timeSlots = this.generateHourSlots(workingDay.start_time || '09:00', workingDay.end_time || '18:00')
      
      // Obtener reservas existentes para la fecha
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          appointment_time,
          services(duration)
        `)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])
      
      if (reservationsError) {
        console.error('Error obteniendo reservas:', reservationsError)
      }
      
      // Crear conjunto de horarios ocupados
      const occupiedTimes = new Set<string>()
      
      if (reservations && reservations.length > 0) {
        reservations.forEach(reservation => {
          const serviceDuration = (reservation.services as any)?.duration || 60
          const slotsNeeded = Math.ceil(serviceDuration / 60)
          
          // Bloquear todos los slots necesarios
          for (let i = 0; i < slotsNeeded; i++) {
            const slotTime = this.addHoursToTime(reservation.appointment_time, i)
            occupiedTimes.add(slotTime)
          }
        })
      }
      
      // Crear resultado final con estado de ocupación
      const result = timeSlots.map(time => ({
        time,
        isOccupied: occupiedTimes.has(time)
      }))
      
      // Guardar en cache por 1 hora
      localStorage.setItem(cacheKey, JSON.stringify(result))
      setTimeout(() => localStorage.removeItem(cacheKey), 60 * 60 * 1000)
      
      return result
      
    } catch (error) {
      console.error('Error generando horarios:', error)
      return []
    }
  }

  static async getAvailableTimeSlots(date: string): Promise<string[]> {
    const slotsWithStatus = await this.getTimeSlotsWithStatus(date)
    return slotsWithStatus.filter(slot => !slot.isOccupied).map(slot => slot.time)
  }

  static async getAllTimeSlotsWithOccupied(date: string): Promise<{ allSlots: string[], occupiedSlots: string[] }> {
    const slotsWithStatus = await this.getTimeSlotsWithStatus(date)
    
    const allSlots = slotsWithStatus.map(slot => slot.time)
    const occupiedSlots = slotsWithStatus.filter(slot => slot.isOccupied).map(slot => slot.time)
    
    return {
      allSlots,
      occupiedSlots
    }
  }

  private static generateHourSlots(startTime: string, endTime: string): string[] {
    const slots: string[] = []
    const startMinutes = this.timeToMinutes(startTime)
    const endMinutes = this.timeToMinutes(endTime)
    
    // Generar turnos de 1 hora (60 minutos)
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
      slots.push(this.minutesToTime(minutes))
    }
    
    return slots
  }

  private static addHoursToTime(time: string, hoursToAdd: number): string {
    const minutes = this.timeToMinutes(time)
    const newMinutes = minutes + (hoursToAdd * 60)
    return this.minutesToTime(newMinutes)
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

// Re-exportar servicios existentes para compatibilidad
export { ReservationsService, PortfolioService, MercadoPagoTokensService } from './services'
