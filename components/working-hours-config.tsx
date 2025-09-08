"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Clock, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WorkingHoursService } from "@/lib/services-extended"

interface WorkingDay {
  dayOfWeek: number
  dayName: string
  isWorking: boolean
  startTime: string
  endTime: string
}

// Sistema argentino: Lunes = 0, Martes = 1, ..., Sábado = 5
const DAYS_OF_WEEK = [
  { value: 0, name: "Lunes" },
  { value: 1, name: "Martes" },
  { value: 2, name: "Miércoles" },
  { value: 3, name: "Jueves" },
  { value: 4, name: "Viernes" },
  { value: 5, name: "Sábado" },
]

export function WorkingHoursConfig() {
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  // Cargar configuración actual
  useEffect(() => {
    loadWorkingHours()
  }, [])

  const loadWorkingHours = async () => {
    try {
      setLoading(true)
      const data = await WorkingHoursService.getAll()
      
      // Crear array con todos los días de la semana
      const allDays = DAYS_OF_WEEK.map(day => {
        const existingDay = data.find(d => d.day_of_week === day.value)
        return {
          dayOfWeek: day.value,
          dayName: day.name,
          isWorking: existingDay?.is_working || false,
          startTime: existingDay?.start_time || "09:00",
          endTime: existingDay?.end_time || "18:00"
        }
      })
      
      setWorkingDays(allDays)
    } catch (error) {
      console.error('Error cargando horarios:', error)
      toast.error('Error al cargar la configuración de horarios')
    } finally {
      setLoading(false)
    }
  }

  const updateWorkingDay = (dayOfWeek: number, field: keyof WorkingDay, value: any) => {
    setWorkingDays(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const updatedDay = { ...day, [field]: value }
        
        // Si se está activando el día y no tiene horas válidas, asignar horas por defecto
        if (field === 'isWorking' && value === true) {
          if (!updatedDay.startTime || updatedDay.startTime === '') {
            updatedDay.startTime = '09:00'
          }
          if (!updatedDay.endTime || updatedDay.endTime === '') {
            updatedDay.endTime = '18:00'
          }
        }
        
        console.log(`🔄 Actualizando ${day.dayName}:`, updatedDay)
        return updatedDay
      }
      return day
    }))
  }

  const saveWorkingHours = async () => {
    try {
      setSaving(true)
      
      // Guardar cada día de la semana
      console.log('🔄 Estado actual de workingDays:', workingDays)
      
      const savePromises = workingDays.map(day => {
        console.log(`💾 Guardando ${day.dayName}:`, {
          dayOfWeek: day.dayOfWeek,
          isWorking: day.isWorking,
          startTime: day.startTime,
          endTime: day.endTime,
          willSaveStartTime: day.isWorking ? day.startTime : undefined,
          willSaveEndTime: day.isWorking ? day.endTime : undefined
        })
        
        return WorkingHoursService.updateWorkingHours(
          day.dayOfWeek,
          day.isWorking,
          day.isWorking ? day.startTime : undefined,
          day.isWorking ? day.endTime : undefined
        )
      })
      
      // Ejecutar todas las operaciones en paralelo
      await Promise.all(savePromises)
      
      // Recargar los datos para asegurar sincronización
      await loadWorkingHours()
      
      toast.success('Horarios de trabajo actualizados correctamente')
    } catch (error) {
      console.error('Error guardando horarios:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Mostrar más detalles del error
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar horarios'
      toast.error(`Error al guardar: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración de Horarios
          </CardTitle>
          <CardDescription>
            Configura los días y horarios de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Configuración de Horarios
        </CardTitle>
        <CardDescription>
          Configura los días y horarios de trabajo para las reservas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {workingDays.map((day) => (
          <div 
            key={day.dayOfWeek} 
            className={`p-4 border rounded-lg transition-all ${
              day.isWorking 
                ? 'bg-primary/5 border-primary/20 shadow-sm' 
                : 'bg-card border-border hover:border-primary/30'
            }`}
          >
            {/* Header del día - Responsive */}
            <div className="flex items-center justify-between mb-3 cursor-pointer"
                 onClick={() => updateWorkingDay(day.dayOfWeek, 'isWorking', !day.isWorking)}>
              <div className="flex items-center gap-3">
                <Label className={`text-sm font-medium min-w-[80px] sm:min-w-[100px] ${
                  day.isWorking ? 'text-primary font-semibold' : 'text-foreground'
                }`}>
                  {day.dayName}
                </Label>
                <Switch
                  checked={day.isWorking}
                  onCheckedChange={(checked) => updateWorkingDay(day.dayOfWeek, 'isWorking', checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {!day.isWorking && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">
                  Activar
                </Badge>
              )}
            </div>
            
            {/* Horarios - Stack en móvil, inline en desktop */}
            {day.isWorking && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ml-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`start-${day.dayOfWeek}`} className="text-sm min-w-[50px]">
                    Desde:
                  </Label>
                  <Input
                    id={`start-${day.dayOfWeek}`}
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateWorkingDay(day.dayOfWeek, 'startTime', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-28 sm:w-32"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`end-${day.dayOfWeek}`} className="text-sm min-w-[50px]">
                    Hasta:
                  </Label>
                  <Input
                    id={`end-${day.dayOfWeek}`}
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateWorkingDay(day.dayOfWeek, 'endTime', e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-28 sm:w-32"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={saveWorkingHours} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
