"use client"

import { useState, useEffect } from "react"
import { DashboardStatsService } from "@/lib/services-extended"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

interface Stat {
  stat_key: string
  stat_value: number
  stat_name: string
  last_updated: string
}

export function DashboardStatsTest() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await DashboardStatsService.getAll()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error cargando estadísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const formatPrice = (priceInPesos: number) => {
    return `$${priceInPesos.toLocaleString('es-AR')}`
  }

  const getStatValue = (key: string) => {
    const stat = stats.find(s => s.stat_key === key)
    return stat ? stat.stat_value : 0
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Prueba de Estadísticas del Dashboard
            <Button 
              onClick={loadStats} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Recargar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800">Reservas Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {loading ? '...' : getStatValue('pending_reservations')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800">Reservas Confirmadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {loading ? '...' : getStatValue('confirmed_reservations')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-800">Servicios Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {loading ? '...' : getStatValue('active_services')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800">Ingresos del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-900">
                  {loading ? '...' : formatPrice(getStatValue('monthly_revenue'))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos Raw de Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.map((stat, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Clave:</span>
                      <br />
                      <code className="text-blue-600">{stat.stat_key}</code>
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span>
                      <br />
                      <span className="text-green-600 font-bold">{stat.stat_value}</span>
                    </div>
                    <div>
                      <span className="font-medium">Nombre:</span>
                      <br />
                      <span>{stat.stat_name}</span>
                    </div>
                    <div>
                      <span className="font-medium">Actualizado:</span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(stat.last_updated).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {stats.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron estadísticas
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Total de estadísticas:</strong> {stats.length}</p>
          <p><strong>Estado de carga:</strong> {loading ? 'Cargando...' : 'Completado'}</p>
          <p><strong>Error:</strong> {error || 'Ninguno'}</p>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">Claves esperadas por el admin:</p>
            <ul className="text-blue-700 mt-1 space-y-1">
              <li>• <code>pending_reservations</code> - Reservas Pendientes</li>
              <li>• <code>confirmed_reservations</code> - Reservas Confirmadas</li>
              <li>• <code>active_services</code> - Servicios Activos</li>
              <li>• <code>monthly_revenue</code> - Ingresos del Mes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
