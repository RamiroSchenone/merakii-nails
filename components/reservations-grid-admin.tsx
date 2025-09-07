"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Clock, User, Mail, Phone, Search, Filter, RefreshCw } from "lucide-react"
import { ReservationsService } from "@/lib/services"
import { Reservation, Service } from "@/lib/database.types"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useDashboardStats } from "@/hooks/use-services"

type ReservationWithService = Reservation & { service: Service }

export function ReservationsGridAdmin() {
  const [reservations, setReservations] = useState<ReservationWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const toast = useToast()
  const { refreshStats } = useDashboardStats()

  // Cargar reservas
  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await ReservationsService.getAll()
      setReservations(data)
    } catch (error) {
      console.error('Error cargando reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado de reserva
  const updateReservationStatus = async (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    const loadingToast = toast.loading('Actualizando estado de la reserva...')
    
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la reserva')
      }

      toast.dismiss(loadingToast)
      toast.success('Estado de reserva actualizado correctamente')
      
      // Recargar datos de reservas y estadísticas
      await Promise.all([
        loadReservations(),
        refreshStats() // Actualizar estadísticas del dashboard
      ])
    } catch (error) {
      console.error('Error actualizando estado:', error)
      toast.dismiss(loadingToast)
      toast.error(`Error al actualizar el estado: ${error.message}`)
    }
  }

  // Confirmar reserva (pasa a FINALIZADA)
  const confirmReservation = async (id: string) => {
    if (confirm('¿Confirmar que esta reserva se realizó exitosamente?')) {
      await updateReservationStatus(id, 'completed')
    }
  }

  // Cancelar reserva (pasa a CANCELADA)
  const cancelReservation = async (id: string) => {
    if (confirm('¿Cancelar esta reserva? Se mantendrá el registro para trazabilidad.')) {
      await updateReservationStatus(id, 'cancelled')
    }
  }

  // Determinar estado automático basado en fecha
  const getAutomaticStatus = (reservation: Reservation): string => {
    // Si ya está cancelada o completada, mantener ese estado
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return reservation.status
    }
    
    // Si está pendiente o confirmada, verificar si ya pasó la fecha
    const appointmentDate = new Date(reservation.appointment_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (appointmentDate < today) {
      return 'completed' // Pasa automáticamente a completada si ya pasó la fecha
    }
    
    return reservation.status
  }

  // Obtener color del badge según estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmada'
      case 'completed':
        return 'Finalizada'
      case 'cancelled':
        return 'Cancelada'
      default:
        return status
    }
  }

  // Filtrar reservas
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.service.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const automaticStatus = getAutomaticStatus(reservation)
    const matchesStatus = statusFilter === 'all' || automaticStatus === statusFilter
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true
      const appointmentDate = new Date(reservation.appointment_date)
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          return appointmentDate.toDateString() === today.toDateString()
        case 'tomorrow':
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          return appointmentDate.toDateString() === tomorrow.toDateString()
        case 'week':
          const weekFromNow = new Date(today)
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          return appointmentDate >= today && appointmentDate <= weekFromNow
        case 'past':
          return appointmentDate < today
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // Formatear precio
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Gestión de Reservas
          </CardTitle>
          <CardDescription>
            Administra todas las reservas de tu estudio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o servicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            
            {/* Filtro de estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="completed">Finalizada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filtro de fecha */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="tomorrow">Mañana</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="past">Pasadas</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Botón refrescar */}
            <Button 
              onClick={loadReservations} 
              variant="outline" 
              size="sm"
              className="rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grilla de reservas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredReservations.map((reservation, index) => {
            const automaticStatus = getAutomaticStatus(reservation)
            
            return (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`rounded-xl border-border transition-shadow ${
                  automaticStatus === 'cancelled' || automaticStatus === 'completed' 
                    ? 'opacity-60 bg-muted/20' 
                    : 'hover:shadow-md'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
                      <Badge className={`${getStatusBadgeColor(automaticStatus)} border`}>
                        {getStatusText(automaticStatus)}
                      </Badge>
                    </div>
                    <CardDescription>{reservation.service.name}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Información del cliente */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{reservation.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{reservation.customer_phone}</span>
                      </div>
                    </div>
                    
                    {/* Fecha y hora */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(reservation.appointment_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{reservation.appointment_time}</span>
                      </div>
                    </div>
                    
                    {/* Precio */}
                    <div className="text-lg font-semibold text-primary">
                      {formatPrice(reservation.total_price)}
                    </div>
                    
                    {/* Notas */}
                    {reservation.notes && (
                      <div className="text-sm text-muted-foreground bg-muted/20 p-2 rounded-lg">
                        <strong>Notas:</strong> {reservation.notes}
                      </div>
                    )}
                    
                    {/* Acciones */}
                    <div className="flex gap-2 pt-2">
                      {automaticStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => confirmReservation(reservation.id)}
                            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700"
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelReservation(reservation.id)}
                            className="flex-1 rounded-xl"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {automaticStatus === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => confirmReservation(reservation.id)}
                            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                          >
                            Finalizar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelReservation(reservation.id)}
                            className="flex-1 rounded-xl"
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                      {(automaticStatus === 'completed' || automaticStatus === 'cancelled') && (
                        <div className="flex-1 text-center text-sm text-muted-foreground py-2">
                          {automaticStatus === 'completed' ? '✅ Reserva finalizada' : '❌ Reserva cancelada'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      
      {/* Mensaje si no hay reservas */}
      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'No se encontraron reservas con los filtros aplicados'
                : 'Aún no tienes reservas registradas'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
