"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ServicesService, DashboardStatsService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"
import { isAppInitialized } from "@/lib/app-init"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false) // Flag para evitar cargas múltiples

  const loadServices = async () => {
    if (isDataLoaded) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await ServicesService.getAll()
      setServices(data)
      setIsDataLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error cargando servicios:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (stats.length > 0) return
    
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
    setIsDataLoaded(false)
    await loadServices()
  }

  const refreshStats = async () => {
    setStats([])
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
    const handleAppInitialized = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      loadServices()
      loadStats()
    }

    if (isAppInitialized()) {
      handleAppInitialized()
    } else {
      if (typeof window !== 'undefined') {
        window.addEventListener('appInitialized', handleAppInitialized)
        
        return () => {
          window.removeEventListener('appInitialized', handleAppInitialized)
        }
      }
    }
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
