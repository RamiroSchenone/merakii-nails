"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Instagram, MessageCircle, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { AnimatedOnScroll, HoverCard, FloatingElements, fadeInUp } from "@/components/animated-elements"

// Lazy load de componentes pesados
const ServicesSection = dynamic(
  () => import("@/components/services-section-instant").then(mod => ({ default: mod.ServicesSectionInstant })),
  { 
    ssr: false,
    loading: () => (
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
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center overflow-hidden" aria-labelledby="hero-title">
        <FloatingElements />
        <div className="mx-auto max-w-4xl relative z-10">
          <AnimatedOnScroll animation={fadeInUp} delay={0}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-muted" role="banner">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              Estudio profesional de uñas
            </div>
          </AnimatedOnScroll>

          <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
            <h1 id="hero-title" className="mb-6 text-4xl font-bold text-balance text-foreground md:text-6xl">
              Uñas impecables, <span className="text-primary">sin vueltas</span>
            </h1>
          </AnimatedOnScroll>

          <AnimatedOnScroll animation={fadeInUp} delay={0.4}>
            <p className="mb-8 text-lg text-muted md:text-xl">
              Transformamos tus uñas en obras de arte. Diseños únicos, técnicas profesionales y la mejor atención
              personalizada.
            </p>
          </AnimatedOnScroll>

          <AnimatedOnScroll animation={fadeInUp} delay={0.6}>
            <div className="flex justify-center">
              <HoverCard scale={1.05}>
                <Button asChild size="lg" className="rounded-2xl" aria-label="Reservar una cita para tratamiento de uñas">
                  <Link href="/reservas">Reservar Cita</Link>
                </Button>
              </HoverCard>
            </div>
          </AnimatedOnScroll>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 py-16" aria-labelledby="services-title">
        <div className="mx-auto max-w-6xl">
          <AnimatedOnScroll animation={fadeInUp}>
            <div className="mb-12 text-center">
              <h2 id="services-title" className="mb-4 text-3xl font-bold text-foreground">Nuestros Servicios</h2>
              <p className="text-muted">Elige el tratamiento perfecto para ti</p>
            </div>
          </AnimatedOnScroll>

          <Suspense fallback={
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
          }>
            <ServicesSection />
          </Suspense>
          
          {/* Disclaimer de precios */}
          <AnimatedOnScroll animation={fadeInUp} delay={0.3}>
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground italic max-w-2xl mx-auto">
                * Los precios son aproximados y están sujetos a modificaciones por diseño y/o otras particularidades propias del mismo servicio
              </p>
            </div>
          </AnimatedOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8" role="contentinfo">
        <div className="mx-auto max-w-4xl text-center">
          <AnimatedOnScroll animation={fadeInUp}>
            <h3 className="mb-4 text-xl font-semibold text-foreground">
              Conecta con nosotros
            </h3>
          </AnimatedOnScroll>
          <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-2xl bg-transparent hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-300"
                asChild
                aria-label="Contactar por WhatsApp"
              >
                <a 
                  href="https://wa.me/5493417458728?text=¡Hola!%20%20Me%20encantaría%20agendar%20una%20cita%20para%20darme%20un%20tratamiento%20de%20uñas.%20¿Podrías%20ayudarme%20con%20la%20disponibilidad?%20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  WhatsApp
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-2xl bg-transparent hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-all duration-300"
                asChild
                aria-label="Seguir en Instagram"
              >
                <a 
                  href="https://www.instagram.com/merakiinails.iw/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-5 w-5" aria-hidden="true" />
                  Instagram
                </a>
              </Button>
            </div>
          </AnimatedOnScroll>
          <AnimatedOnScroll animation={fadeInUp} delay={0.4}>
            <p className="mt-6 text-sm text-muted">
              © 2024 Nail Studio. Todos los derechos reservados.
            </p>
          </AnimatedOnScroll>
        </div>
      </footer>
    </div>
  )
}