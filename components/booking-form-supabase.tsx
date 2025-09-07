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
import { CheckCircle, Clock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ServicesService, ReservationsService, TimeSlotsService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"
import { useServices, useDashboardStats } from "@/hooks/use-services"
import { useWorkingHours } from "@/hooks/use-working-hours"
import { BookingFormSkeleton } from "@/components/skeletons"

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

export function BookingFormSupabase() {
  const { services, loading: loadingServices } = useServices()
  const { refreshStats } = useDashboardStats()
  const { getWorkingDaysArray } = useWorkingHours()
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [timeSlots, setTimeSlots] = useState<{ time: string, isOccupied: boolean }[]>([])

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (bookingData.date) {
        try {
          const dateString = bookingData.date.toISOString().split('T')[0]
          
          // Obtener horarios con estado directamente
          const slotsWithStatus = await TimeSlotsService.getTimeSlotsWithStatus(dateString)
          setTimeSlots(slotsWithStatus)
        } catch (error) {
          console.error('Error cargando horarios:', error)
          setTimeSlots([])
        }
      }
    }

    loadTimeSlots()
  }, [bookingData.date])

  // Mostrar skeleton mientras cargan los servicios
  if (loadingServices) {
    return <BookingFormSkeleton />
  }

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    setBookingData((prev) => ({ ...prev, service }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setBookingData((prev) => ({ ...prev, date }))
  }

  const handleTimeSelect = (time: string) => {
    setBookingData((prev) => ({ ...prev, time }))
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

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`
  }

  const formatDuration = (durationInMinutes: number) => {
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}min`
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
              <p><strong>Servicio:</strong> {bookingData.service?.name}</p>
              <p><strong>Fecha:</strong> {bookingData.date?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Hora:</strong> {bookingData.time}</p>
              <p><strong>Cliente:</strong> {bookingData.customerInfo?.name}</p>
              <p><strong>Total:</strong> {formatPrice(bookingData.service?.price || 0)}</p>
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
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={cn("h-0.5 w-12", step < currentStep ? "bg-primary" : "bg-muted")}
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
              {services.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md",
                    bookingData.service?.id === service.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-transparent hover:border-primary/50",
                  )}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <h3 className="text-lg font-semibold text-card-foreground">{service.name}</h3>
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
            <div className="flex justify-center">
              <SimpleCalendar
                selected={bookingData.date}
                onSelect={handleDateSelect}
                workingDays={getWorkingDaysArray()}
              />
            </div>
          )}

          {/* Step 3: Time Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot) => {
                  const isSelected = bookingData.time === slot.time
                  const isAvailable = !slot.isOccupied
                  
                  return (
                    <div
                      key={slot.time}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : isAvailable
                          ? "border-border bg-transparent hover:border-primary/50"
                          : "border-muted bg-muted/20 opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => isAvailable ? handleTimeSelect(slot.time) : null}
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
            <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" name="name" placeholder="Tu nombre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+54 9 11 1234 5678" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea id="notes" name="notes" placeholder="Alguna preferencia o detalle adicional" />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                {isLoading ? "Confirmando..." : "Confirmar Reserva"}
              </Button>
            </form>
          )}
        </CardContent>

        {/* Navigation Buttons */}
        <div className="flex justify-between p-6 pt-0">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}
          {currentStep < 4 && (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="rounded-xl ml-auto"
              disabled={
                (currentStep === 1 && !bookingData.service) ||
                (currentStep === 2 && !bookingData.date) ||
                (currentStep === 3 && !bookingData.time)
              }
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}