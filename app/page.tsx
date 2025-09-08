"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Instagram, MessageCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useServices } from "@/hooks/use-services"
import { ServiceLegends } from "@/components/service-legends"

export default function HomePage() {
  const { services, loading } = useServices()

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Estudio profesional de uñas
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl font-bold text-balance text-foreground md:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Uñas impecables, <span className="text-primary">sin vueltas</span>
          </motion.h1>

          <motion.p
            className="mb-8 text-lg text-muted md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Transformamos tus uñas en obras de arte. Diseños únicos, técnicas profesionales y la mejor atención
            personalizada.
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button asChild size="lg" className="rounded-2xl">
              <Link href="/reservas">Reservar Cita</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold text-foreground">Nuestros Servicios</h2>
            <p className="text-muted">Elige el tratamiento perfecto para ti</p>
          </motion.div>

          {loading ? (
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
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No hay servicios disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="rounded-2xl border-border bg-card transition-all hover:shadow-lg hover:shadow-primary/10 h-64 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">{service.name}</CardTitle>
                      <ServiceLegends service={service} className="mt-1" />
                      <CardDescription className="flex items-center gap-2 text-muted">
                        <Clock className="h-4 w-4" />
                        {formatDuration(service.duration)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted">{service.description}</p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-bold text-primary">{formatPrice(service.price)}</span>
                      <Button asChild size="sm" className="rounded-xl">
                        <Link href="/reservas">Reservar</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Disclaimer de precios */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-muted-foreground italic max-w-2xl mx-auto">
              * Los precios son aproximados y están sujetos a modificaciones por diseño y/o otras particularidades propias del mismo servicio
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h3
            className="mb-4 text-xl font-semibold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Conecta con nosotros
          </motion.h3>
          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" size="lg" className="rounded-2xl bg-transparent">
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp
            </Button>
            <Button variant="outline" size="lg" className="rounded-2xl bg-transparent">
              <Instagram className="mr-2 h-5 w-5" />
              Instagram
            </Button>
          </motion.div>
          <motion.p
            className="mt-6 text-sm text-muted"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            © 2024 Nail Studio. Todos los derechos reservados.
          </motion.p>
        </div>
      </footer>
    </div>
  )
}
