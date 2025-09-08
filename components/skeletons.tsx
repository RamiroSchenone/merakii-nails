"use client"

import { cn } from "@/lib/utils"

// Skeleton base
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton para cards de servicios
export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 h-64 flex flex-col">
      <div className="space-y-4 flex-1">
        {/* Título */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Descripción */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      
      {/* Footer con precio y botón */}
      <div className="flex items-center justify-between mt-auto">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// Skeleton para formulario de reservas
export function BookingFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Paso 1: Selección de servicio */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      </div>
      
      {/* Paso 2: Selección de fecha */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex justify-center">
          <Skeleton className="h-80 w-80 rounded-lg" />
        </div>
      </div>
      
      {/* Paso 3: Selección de hora */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      
      {/* Paso 4: Información del cliente */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para grid de portfolio
export function PortfolioGridSkeleton() {
  return (
    <div className="space-y-8">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      
      {/* Grid de imágenes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Botón Load More */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// Skeleton para página principal
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-16 w-96" />
          <Skeleton className="mx-auto h-6 w-80" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center space-y-4">
            <Skeleton className="mx-auto h-8 w-64" />
            <Skeleton className="mx-auto h-5 w-48" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
