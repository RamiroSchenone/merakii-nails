"use client"

import { useState, useEffect } from "react"
import { TimeSlotsService } from "@/lib/services-extended"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TimeSlotsTest() {
  const [testDate, setTestDate] = useState("2024-01-15") // Lunes
  const [serviceDuration, setServiceDuration] = useState(120) // 2 horas
  const [timeSlots, setTimeSlots] = useState<{ time: string, isOccupied: boolean }[]>([])
  const [loading, setLoading] = useState(false)

  const loadTimeSlots = async () => {
    setLoading(true)
    try {
      const slots = await TimeSlotsService.getTimeSlotsWithStatus(testDate, serviceDuration)
      setTimeSlots(slots)
    } catch (error) {
      console.error("Error cargando horarios:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTimeSlots()
  }, [testDate, serviceDuration])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Horarios Dinámicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha (Lunes)</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duración del Servicio (minutos)</label>
              <select
                value={serviceDuration}
                onChange={(e) => setServiceDuration(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                <option value={60}>1 hora (60 min)</option>
                <option value={90}>1.5 horas (90 min)</option>
                <option value={120}>2 horas (120 min)</option>
                <option value={180}>3 horas (180 min)</option>
                <option value={240}>4 horas (240 min)</option>
              </select>
            </div>
          </div>
          
          <Button onClick={loadTimeSlots} disabled={loading}>
            {loading ? "Cargando..." : "Recargar Horarios"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Horarios Disponibles ({serviceDuration} minutos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-center font-medium ${
                    slot.isOccupied
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-green-100 text-green-800 border border-green-200"
                  }`}
                >
                  <div className="text-sm">{slot.time}</div>
                  <div className="text-xs mt-1">
                    {slot.isOccupied ? "Ocupado" : "Disponible"}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {timeSlots.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No hay horarios disponibles para esta fecha
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Fecha:</strong> {testDate} (Lunes)</p>
          <p><strong>Duración:</strong> {serviceDuration} minutos ({serviceDuration / 60} horas)</p>
          <p><strong>Horarios generados:</strong> {timeSlots.length}</p>
          <p><strong>Disponibles:</strong> {timeSlots.filter(s => !s.isOccupied).length}</p>
          <p><strong>Ocupados:</strong> {timeSlots.filter(s => s.isOccupied).length}</p>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">Ejemplo:</p>
            <p className="text-blue-700">
              Si trabajas de 10:00 a 18:00 y el servicio dura {serviceDuration} minutos,
              deberías ver turnos cada {serviceDuration} minutos desde las 10:00.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
