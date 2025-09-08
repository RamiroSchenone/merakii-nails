"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SimpleCalendar } from "@/components/ui/simple-calendar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ChevronLeft, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
// Animaciones simples con CSS transitions
import { ServicesService, ReservationsService, TimeSlotsService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"
import { useServices, useDashboardStats } from "@/hooks/use-services"
import { useWorkingHours } from "@/hooks/use-working-hours"
import { BookingFormSkeleton } from "@/components/skeletons"
import { ServiceLegends } from "@/components/service-legends"

interface BookingData {
  service?: Service
  date?: Date
  time?: string
  customerInfo?: {
    name: string
    email: string
    phone: string
    notes: string
  }
}

// Variantes de animación para los pasos (temporalmente comentadas)
// const stepVariants = {
//   hidden: { 
//     opacity: 0, 
//     x: 50,
//     scale: 0.95
//   },
//   visible: { 
//     opacity: 1, 
//     x: 0,
//     scale: 1,
//     transition: {
//       duration: 0.4,
//       ease: "easeOut"
//     }
//   },
//   exit: { 
//     opacity: 0, 
//     x: -50,
//     scale: 0.95,
//     transition: {
//       duration: 0.3,
//       ease: "easeIn"
//     }
//   }
// }

// // Variantes para elementos del formulario
// const formElementVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { 
//     opacity: 1, 
//     y: 0,
//     transition: {
//       duration: 0.3,
//       ease: "easeOut"
//     }
//   }
// }

// // Variantes para los botones de progreso
// const progressVariants = {
//   inactive: { scale: 1, opacity: 0.6 },
//   active: { 
//     scale: 1.1, 
//     opacity: 1,
//     transition: {
//       duration: 0.2,
//       ease: "easeOut"
//     }
//   },
//   completed: { 
//     scale: 1.05, 
//     opacity: 1,
//     transition: {
//       duration: 0.2,
//       ease: "easeOut"
//     }
//   }
// }

export function BookingFormSupabase() {
  const { services, loading: loadingServices } = useServices()
  const { refreshStats } = useDashboardStats()
  const { getWorkingDaysArray } = useWorkingHours()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [timeSlots, setTimeSlots] = useState<{ time: string, isOccupied: boolean }[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)

  // Cargar horarios disponibles cuando se selecciona una fecha o servicio
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (bookingData.date) {
        try {
          setLoadingTimeSlots(true)
          
          // Parche: usar fecha local para evitar problemas de zona horaria
          const year = bookingData.date.getFullYear()
          const month = (bookingData.date.getMonth() + 1).toString().padStart(2, '0')
          const day = bookingData.date.getDate().toString().padStart(2, '0')
          const dateString = `${year}-${month}-${day}`
          
          console.log('📅 Fecha seleccionada:', {
            originalDate: bookingData.date,
            dateString: dateString,
            dayOfWeek: bookingData.date.getDay(),
            dayName: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][bookingData.date.getDay()]
          })
          
          // Obtener horarios con estado y loading, considerando la duración del servicio seleccionado
          const serviceDuration = bookingData.service?.duration
          const { slots, isLoading } = await TimeSlotsService.getTimeSlotsWithStatusAndLoading(dateString, serviceDuration)
          
          // Solo actualizar si no está cargando para evitar sobresalto
          if (!isLoading) {
            setTimeSlots(slots)
          }
        } catch (error) {
          console.error('Error cargando horarios:', error)
          setTimeSlots([])
        } finally {
          setLoadingTimeSlots(false)
        }
      }
    }

    loadTimeSlots()
  }, [bookingData.date, bookingData.service])

  // Mostrar skeleton mientras cargan los servicios
  if (loadingServices) {
    return <BookingFormSkeleton />
  }

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    setBookingData((prev) => ({ ...prev, service }))
    // Avanzar automáticamente al paso 2 (selección de fecha)
    setCurrentStep(2)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setBookingData((prev) => ({ ...prev, date }))
    // Avanzar automáticamente al paso 3 (selección de horario) si se selecciona una fecha
    if (date) {
      setCurrentStep(3)
    }
  }

  const handleTimeSelect = (time: string) => {
    setBookingData((prev) => ({ ...prev, time }))
    // Avanzar automáticamente al paso 4 (información del cliente)
    setCurrentStep(4)
  }

  const handleCustomerInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const customerInfo = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        notes: formData.get("notes") as string,
      }

      const reservationData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        service_id: bookingData.service!.id,
        appointment_date: bookingData.date!.toISOString().split('T')[0],
        appointment_time: bookingData.time!,
        notes: customerInfo.notes || null,
        total_price: bookingData.service!.price,
        status: 'pending' as const
      }

      await ReservationsService.create(reservationData)

      // Actualizar estadísticas del dashboard
      await refreshStats()

      setBookingData((prev) => ({ ...prev, customerInfo }))
      setIsSuccess(true)
    } catch (error) {
      console.error("Error al crear la reserva:", error)
      alert("Hubo un error al procesar tu reserva. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (priceInPesos: number) => {
    return `$${priceInPesos.toLocaleString('es-AR')}`
  }

  const formatDuration = (durationInMinutes: number) => {
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}hs aprox.`
    } else if (hours > 0) {
      return `${hours}:00hs aprox.`
    } else {
      return `${minutes}min aprox.`
    }
  }

  if (isSuccess) {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-md rounded-2xl border-border bg-card text-center p-8">
          <CardHeader className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-primary" />
            <CardTitle className="text-3xl font-bold text-card-foreground">¡Reserva Confirmada!</CardTitle>
            <CardDescription className="text-muted">
              Tu cita ha sido agendada exitosamente. Recibirás un correo de confirmación pronto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-card-foreground">Detalles de tu reserva:</p>
            <div className="text-left text-muted-foreground space-y-2">
              <div>
                <p><strong>Servicio:</strong> {bookingData.service?.name}</p>
                {bookingData.service && <ServiceLegends service={bookingData.service} className="ml-16 mt-1" />}
              </div>
              <p><strong>Fecha:</strong> {bookingData.date?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> {bookingData.time}</p>
              <p><strong>Cliente:</strong> {bookingData.customerInfo?.name}</p>
              <p><strong>Total:</strong> {formatPrice(bookingData.service?.price || 0)}</p>
            </div>
            
            {/* Disclaimer de precios en confirmación */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
              <p className="text-xs text-amber-800 italic text-center">
                <strong>Recordatorio:</strong> Los precios son aproximados y están sujetos a modificaciones por diseño y/o otras particularidades propias del mismo servicio
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              ¡Gracias por elegirnos!
            </p>
            <div>
              <Button onClick={() => (window.location.href = "/")} className="rounded-xl">
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps - Responsive */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className="flex items-center transition-all duration-300 ease-out"
          >
            <div
              className={cn(
                "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ease-out transform hover:scale-110",
                step <= currentStep ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <span className="transition-all duration-200">
                {step}
              </span>
            </div>
            {step < 4 && (
              <div
                className={cn(
                  "h-0.5 w-8 sm:w-12 transition-all duration-500 ease-out",
                  step < currentStep ? "bg-primary shadow-sm" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="rounded-2xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            {currentStep === 1 && (
              <>
                <Sparkles className="h-5 w-5" />
                Selecciona tu Servicio
              </>
            )}
            {currentStep === 2 && "Elige la Fecha"}
            {currentStep === 3 && (
              <>
                <Clock className="h-5 w-5" />
                Horarios
              </>
            )}
            {currentStep === 4 && "Información Personal"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Elige el tratamiento que deseas realizar"}
            {currentStep === 2 && "Selecciona el día que prefieres para tu cita"}
            {currentStep === 3 && "Elige el horario que mejor te convenga"}
            {currentStep === 4 && "Completa tus datos para confirmar la reserva"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg",
                    bookingData.service?.id === service.id
                      ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                      : "border-border bg-transparent hover:border-primary/50 hover:bg-primary/5",
                  )}
                  onClick={() => handleServiceSelect(service.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="text-lg font-semibold text-card-foreground">{service.name}</h3>
                  <ServiceLegends service={service} className="mt-1" />
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">{formatPrice(service.price)}</span>
                    <Badge variant="secondary" className="flex items-center gap-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      {formatDuration(service.duration)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Date Selection */}
          {currentStep === 2 && (
            <div className="flex justify-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="transition-all duration-300 ease-out transform hover:scale-[1.02]">
                <SimpleCalendar
                  selected={bookingData.date}
                  onSelect={handleDateSelect}
                  workingDays={getWorkingDaysArray()}
                />
              </div>
            </div>
          )}

          {/* Step 3: Time Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {bookingData.service && (
                <div className="text-center p-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    <strong>{bookingData.service.name}</strong> durará {formatDuration(bookingData.service.duration)}
                    <ServiceLegends service={bookingData.service} className="block mt-1" />
                    {bookingData.service.duration > 60 && (
                      <span className="block text-xs mt-1">
                        Ocupará {Math.ceil(bookingData.service.duration / 60)} turno{Math.ceil(bookingData.service.duration / 60) > 1 ? 's' : ''} consecutivo{Math.ceil(bookingData.service.duration / 60) > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {loadingTimeSlots ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Cargando horarios...</h3>
                  <p className="text-muted-foreground">
                    Verificando disponibilidad para la fecha seleccionada.
                  </p>
                </div>
              ) : timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => {
                  const isSelected = bookingData.time === slot.time
                  const isAvailable = !slot.isOccupied
                  
                  return (
                    <div
                      key={slot.time}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                          : isAvailable
                          ? "border-border bg-transparent hover:border-primary/50 hover:bg-primary/5"
                          : "border-muted bg-muted/20 opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => isAvailable ? handleTimeSelect(slot.time) : null}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-card-foreground">
                            {slot.time}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isAvailable ? "Disponible" : "Ocupado"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay horarios disponibles</h3>
                  <p className="text-muted-foreground">
                    No hay horarios configurados para la fecha seleccionada.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Customer Information */}
          {currentStep === 4 && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
                <div className="space-y-2 animate-in fade-in-50 slide-in-from-left-4 duration-300" style={{ animationDelay: '100ms' }}>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" name="name" placeholder="Tu nombre" required className="transition-all duration-200 focus:scale-[1.02]" />
                </div>
                <div className="space-y-2 animate-in fade-in-50 slide-in-from-left-4 duration-300" style={{ animationDelay: '200ms' }}>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required className="transition-all duration-200 focus:scale-[1.02]" />
                </div>
                <div className="space-y-2 animate-in fade-in-50 slide-in-from-left-4 duration-300" style={{ animationDelay: '300ms' }}>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+54 9 11 1234 5678" required className="transition-all duration-200 focus:scale-[1.02]" />
                </div>
                <div className="space-y-2 animate-in fade-in-50 slide-in-from-left-4 duration-300" style={{ animationDelay: '400ms' }}>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Alguna preferencia o detalle adicional" className="transition-all duration-200 focus:scale-[1.02]" />
                </div>
              
                {/* Disclaimer de precios */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-300" style={{ animationDelay: '500ms' }}>
                  <p className="text-xs text-amber-800 italic text-center">
                    <strong>Importante:</strong> Los precios son aproximados y están sujetos a modificaciones por diseño y/o otras particularidades propias del mismo servicio
                  </p>
                </div>
                
                <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300" style={{ animationDelay: '600ms' }}>
                  <Button 
                    type="submit" 
                    className="w-full rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Confirmando..." : "Confirmar Reserva"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>

        {/* Navigation: Solo mostrar botón "Anterior" cuando sea necesario */}
        {currentStep > 1 && (
          <div className="flex justify-start p-6 pt-0 animate-in fade-in-50 slide-in-from-left-4 duration-300">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}