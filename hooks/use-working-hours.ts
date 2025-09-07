"use client"

import { useState, useEffect } from "react"
import { WorkingHoursService } from "@/lib/services-extended"

interface WorkingDay {
  day_of_week: number
  is_working: boolean
  start_time: string
  end_time: string
}

export function useWorkingHours() {
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([])
  const [loading, setLoading] = useState(true)

  const loadWorkingHours = async () => {
    try {
      setLoading(true)
      const data = await WorkingHoursService.getAll()
      setWorkingDays(data)
    } catch (error) {
      console.error('Error cargando horarios de trabajo:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkingHours()
  }, [])

  // Obtener días de trabajo como array de números
  const getWorkingDaysArray = () => {
    return workingDays
      .filter(day => day.is_working)
      .map(day => day.day_of_week)
  }

  return {
    workingDays,
    loading,
    getWorkingDaysArray,
    refreshWorkingHours: loadWorkingHours
  }
}
