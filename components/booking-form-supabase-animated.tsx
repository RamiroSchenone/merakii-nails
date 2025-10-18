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
import { ServicesService, ReservationsService, TimeSlotsService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"
import { useServices, useDashboardStats } from "@/hooks/use-services"
import { useWorkingHours } from "@/hooks/use-working-hours"
import { BookingFormSkeleton } from "@/components/skeletons"
import { ServiceLegends } from "@/components/service-legends"
import { AnimatedOnScroll, HoverCard, fadeInUp } from "@/components/animated-elements"

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

export function BookingFormSupabaseAnimated() {
  const { services, loading: loadingServices } = useServices()
  const { refreshStats } = useDashboardStats()
  const { workingHours } = useWorkingHours()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({})
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (bookingData.date && bookingData.service) {
      loadAvailableTimes()
    }
  }, [bookingData.date, bookingData.service])

  const loadAvailableTimes = async () => {
    try {
      setIsLoading(true)
      const timeSlotsData = await TimeSlotsService.getTimeSlotsWithStatus(
        bookingData.date!.toISOString().split('T')[0],
        bookingData.service!.duration
      )
      // Extraer solo los horarios disponibles (no ocupados)
      const availableTimes = timeSlotsData
        .filter(slot => !slot.isOccupied)
        .map(slot => slot.time)
      setAvailableTimes(availableTimes)
    } catch (error) {
      console.error("Error cargando horarios:", error)
      setAvailableTimes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setBookingData((prev) => ({ ...prev, service }))
    setCurrentStep(2)
  }

  const handleDateSelect = (date: Date) => {
    setBookingData((prev) => ({ ...prev, date }))
    setCurrentStep(3)
  }

  const handleTimeSelect = (time: string) => {
    setBookingData((prev) => ({ ...prev, time }))
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
      <AnimatedOnScroll animation={fadeInUp}>
        <div className="flex justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">¡Reserva Confirmada!</CardTitle>
              <CardDescription>
                Tu cita ha sido agendada exitosamente. Te enviaremos un recordatorio por email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-left">
                <h4 className="font-semibold mb-2">Detalles de tu reserva:</h4>
                <p><strong>Servicio:</strong> {bookingData.service?.name}</p>
                <p><strong>Fecha:</strong> {bookingData.date?.toLocaleDateString('es-AR')}</p>
                <p><strong>Hora:</strong> {bookingData.time}</p>
                <p><strong>Precio:</strong> {formatPrice(bookingData.service?.price || 0)}</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </AnimatedOnScroll>
    )
  }

  if (loadingServices) {
    return <BookingFormSkeleton />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Indicador de progreso */}
      <AnimatedOnScroll animation={fadeInUp} delay={0.1}>
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                  step <= currentStep
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={cn(
                    "h-1 w-8 transition-all duration-300",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </AnimatedOnScroll>

      {/* Paso 1: Selección de servicio */}
      {currentStep === 1 && (
        <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Selecciona tu servicio
              </CardTitle>
              <CardDescription>
                Elige el tratamiento perfecto para ti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <AnimatedOnScroll key={service.id} animation={fadeInUp} delay={0.3 + index * 0.1}>
                    <HoverCard scale={1.02} shadow={true}>
                      <Card 
                        className="cursor-pointer transition-all duration-300 hover:shadow-lg"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <CardHeader>
                          <CardTitle className="text-card-foreground">{service.name}</CardTitle>
                          <ServiceLegends service={service} className="mt-1" />
                          <CardDescription className="flex items-center gap-2 text-muted">
                            <Clock className="h-4 w-4" />
                            {formatDuration(service.duration)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.4',
                            maxHeight: '4.2em'
                          }}>{service.description}</p>
                        </CardContent>
                        <CardContent className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{formatPrice(service.price)}</span>
                          <Button size="sm" className="rounded-xl">
                            Seleccionar
                          </Button>
                        </CardContent>
                      </Card>
                    </HoverCard>
                  </AnimatedOnScroll>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedOnScroll>
      )}

      {/* Paso 2: Selección de fecha */}
      {currentStep === 2 && (
        <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Selecciona una fecha</CardTitle>
              <CardDescription>
                Servicio: {bookingData.service?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SimpleCalendar
                onSelect={handleDateSelect}
                workingDays={workingHours}
                disabledDates={[]}
              />
            </CardContent>
            <CardContent className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            </CardContent>
          </Card>
        </AnimatedOnScroll>
      )}

      {/* Paso 3: Selección de hora */}
      {currentStep === 3 && (
        <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Selecciona una hora</CardTitle>
              <CardDescription>
                {bookingData.service?.name} - {bookingData.date?.toLocaleDateString('es-AR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableTimes.map((time, index) => (
                    <AnimatedOnScroll key={time} animation={fadeInUp} delay={0.3 + index * 0.05}>
                      <Button
                        variant="outline"
                        className="h-12 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    </AnimatedOnScroll>
                  ))}
                </div>
              )}
            </CardContent>
            <CardContent className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            </CardContent>
          </Card>
        </AnimatedOnScroll>
      )}

      {/* Paso 4: Información del cliente */}
      {currentStep === 4 && (
        <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Información de contacto</CardTitle>
              <CardDescription>
                Completa tus datos para confirmar la reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <AnimatedOnScroll animation={fadeInUp} delay={0.3}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="Tu nombre completo"
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                  </AnimatedOnScroll>
                  
                  <AnimatedOnScroll animation={fadeInUp} delay={0.4}>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                  </AnimatedOnScroll>
                </div>

                <AnimatedOnScroll animation={fadeInUp} delay={0.5}>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      required
                      placeholder="+54 9 11 1234-5678"
                      className="transition-all duration-300 focus:scale-105"
                    />
                  </div>
                </AnimatedOnScroll>

                <AnimatedOnScroll animation={fadeInUp} delay={0.6}>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Alguna preferencia especial o comentario..."
                      className="transition-all duration-300 focus:scale-105"
                    />
                  </div>
                </AnimatedOnScroll>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <AnimatedOnScroll animation={fadeInUp} delay={0.7}>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="hover:scale-105 transition-transform duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Procesando...
                        </>
                      ) : (
                        'Confirmar Reserva'
                      )}
                    </Button>
                  </AnimatedOnScroll>
                </div>
              </form>
            </CardContent>
          </Card>
        </AnimatedOnScroll>
      )}
    </div>
  )
}
