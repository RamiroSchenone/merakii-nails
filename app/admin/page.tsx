"use client"

import { useState, useEffect } from "react"
import { ReservationsGridAdmin, ServicesManagementAdmin, PortfolioManagementAdmin, WorkingHoursConfig } from "@/components/lazy-components"
import { AdminAuth } from "@/components/admin-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, CalendarDays, Clock, Users, DollarSign, Image as ImageIcon } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-services"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'portfolio' | 'config'>('reservations')
  const { stats, statsLoading } = useDashboardStats()

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_authenticated')
    if (adminSession === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthSuccess = () => {
    localStorage.setItem('admin_authenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
  }

  // Si no está autenticado, mostrar el formulario de login
  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={handleAuthSuccess} />
  }

  // Función para obtener una estadística por clave
  const getStatValue = (key: string) => {
    const stat = stats.find(s => s.stat_key === key)
    return stat ? stat.stat_value : 0
  }

  // Función para formatear precio
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver al inicio
              </a>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-muted">Gestiona tu estudio de uñas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl bg-transparent"
                onClick={() => setActiveTab('config')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="rounded-xl"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : getStatValue('reservations_today')}
                </div>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : getStatValue('active_services')}
                </div>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : getStatValue('total_customers')}
                </div>
                <p className="text-xs text-muted-foreground">Únicos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : formatPrice(getStatValue('monthly_revenue'))}
                </div>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'reservations' ? 'default' : 'outline'}
              onClick={() => setActiveTab('reservations')}
              className="rounded-xl"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Reservas
            </Button>
            <Button
              variant={activeTab === 'services' ? 'default' : 'outline'}
              onClick={() => setActiveTab('services')}
              className="rounded-xl"
            >
              <Clock className="h-4 w-4 mr-2" />
              Servicios
            </Button>
            <Button
              variant={activeTab === 'portfolio' ? 'default' : 'outline'}
              onClick={() => setActiveTab('portfolio')}
              className="rounded-xl"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
            <Button
              variant={activeTab === 'config' ? 'default' : 'outline'}
              onClick={() => setActiveTab('config')}
              className="rounded-xl"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'reservations' && <ReservationsGridAdmin />}
          {activeTab === 'services' && <ServicesManagementAdmin />}
          {activeTab === 'portfolio' && <PortfolioManagementAdmin />}
          {activeTab === 'config' && <WorkingHoursConfig />}
        </div>
      </div>
    </div>
  )
}
