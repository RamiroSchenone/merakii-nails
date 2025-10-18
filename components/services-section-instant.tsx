"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { AnimatedOnScroll, HoverCard, fadeInUp } from "@/components/animated-elements"
import { ServiceLegends } from "@/components/service-legends"
import { useState, useEffect } from "react"
import { ServicesService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"

// Componente de servicios que se carga instantáneamente
function ServicesSectionInstant() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cargar servicios inmediatamente sin delays
    const loadServices = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await ServicesService.getAll()
        setServices(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando servicios')
        console.error('Error cargando servicios:', err)
      } finally {
        setLoading(false)
      }
    }

    // Cargar inmediatamente
    loadServices()
  }, [])

  // Formatear precio
  const formatPrice = (priceInPesos: number) => {
    return `$${priceInPesos.toLocaleString('es-AR')}`
  }

  // Formatear duración
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

  // Mostrar skeleton solo si está cargando Y no hay servicios
  if (loading && services.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 h-6 w-3/5 bg-muted animate-pulse rounded"></div>
            <div className="mb-4 h-4 w-1/5 bg-muted animate-pulse rounded"></div>
            <div className="mb-4 h-16 w-full bg-muted animate-pulse rounded"></div>
            <div className="flex items-center justify-between">
              <div className="h-8 w-1/4 bg-muted animate-pulse rounded"></div>
              <div className="h-9 w-1/4 bg-muted animate-pulse rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error cargando servicios: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  if (services.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No hay servicios disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <AnimatedOnScroll key={service.id} delay={index * 0.1}>
          <HoverCard scale={1.02} shadow={true}>
            <Card className="rounded-2xl border-border bg-card h-64 flex flex-col">
              <CardHeader>
                <CardTitle className="text-card-foreground">{service.name}</CardTitle>
                <ServiceLegends service={service} className="mt-1" />
                <CardDescription className="flex items-center gap-2 text-muted">
                  <Clock className="h-4 w-4" />
                  {formatDuration(service.duration)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4',
                  maxHeight: '4.2em'
                }}>{service.description}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between mt-auto">
                <span className="text-2xl font-bold text-primary">{formatPrice(service.price)}</span>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/reservas">Reservar</Link>
                </Button>
              </CardFooter>
            </Card>
          </HoverCard>
        </AnimatedOnScroll>
      ))}
    </div>
  )
}

export { ServicesSectionInstant }
