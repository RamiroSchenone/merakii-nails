"use client"

import { useServicesContext } from "@/contexts/services-context"

// Hook personalizado para manejar servicios con cache y actualizaciones
export function useServices() {
  const context = useServicesContext()
  return {
    services: context.services,
    loading: context.loading,
    error: context.error,
    refreshServices: context.refreshServices,
    addService: context.addService,
    updateService: context.updateService,
    deleteService: context.deleteService
  }
}

// Hook para estadísticas del dashboard
export function useDashboardStats() {
  const context = useServicesContext()
  return {
    stats: context.stats,
    statsLoading: context.statsLoading,
    refreshStats: context.refreshStats
  }
}
