"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ServicesService, DashboardStatsService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"

interface ServicesContextType {
  services: Service[]
  loading: boolean
  error: string | null
  stats: any[]
  statsLoading: boolean
  refreshServices: () => Promise<void>
  refreshStats: () => Promise<void>
  addService: (serviceData: any) => Promise<Service>
  updateService: (id: string, updates: any) => Promise<Service>
  deleteService: (id: string) => Promise<void>
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false) // Cambiar a false para no bloquear navegación
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(false) // Cambiar a false para no bloquear navegación

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServicesService.getAll()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error cargando servicios:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const data = await DashboardStatsService.getAll()
      setStats(data)
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const refreshServices = async () => {
    await loadServices()
  }

  const refreshStats = async () => {
    await loadStats()
  }

  const addService = async (serviceData: any) => {
    try {
      const newService = await ServicesService.create(serviceData)
      setServices(prev => [...prev, newService])
      await loadStats() // Recargar estadísticas
      return newService
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando servicio')
      throw err
    }
  }

  const updateService = async (id: string, updates: any) => {
    try {
      const updatedService = await ServicesService.update(id, updates)
      setServices(prev => prev.map(s => s.id === id ? updatedService : s))
      await loadStats() // Recargar estadísticas
      return updatedService
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando servicio')
      throw err
    }
  }

  const deleteService = async (id: string) => {
    try {
      await ServicesService.delete(id)
      setServices(prev => prev.filter(s => s.id !== id))
      await loadStats() // Recargar estadísticas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando servicio')
      throw err
    }
  }

  useEffect(() => {
    loadServices()
    loadStats()
  }, [])

  return (
    <ServicesContext.Provider value={{
      services,
      loading,
      error,
      stats,
      statsLoading,
      refreshServices,
      refreshStats,
      addService,
      updateService,
      deleteService
    }}>
      {children}
    </ServicesContext.Provider>
  )
}

export function useServicesContext() {
  const context = useContext(ServicesContext)
  if (context === undefined) {
    throw new Error('useServicesContext must be used within a ServicesProvider')
  }
  return context
}
