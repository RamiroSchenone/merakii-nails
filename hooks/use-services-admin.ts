"use client"

import { useState, useEffect } from "react"
import { ServicesService } from "@/lib/services-extended"
import { Service } from "@/lib/database.types"

// Hook específico para administración de servicios (incluye inactivos)
export function useServicesAdmin() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ServicesService.getAllForAdmin()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error cargando servicios:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshServices = async () => {
    await loadServices()
  }

  const addService = async (serviceData: any) => {
    try {
      const newService = await ServicesService.create(serviceData)
      setServices(prev => [...prev, newService])
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando servicio')
      throw err
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  return {
    services,
    loading,
    error,
    refreshServices,
    addService,
    updateService,
    deleteService
  }
}
