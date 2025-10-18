"use client"

import { useState, useEffect } from "react"
import { AdminAuth } from "@/components/admin-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, CalendarDays, Clock, Users, DollarSign, Image as ImageIcon, LogOut } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-services"
import { AnimatedOnScroll, HoverCard, fadeInUp } from "@/components/animated-elements"
import dynamic from "next/dynamic"

// Lazy load components con skeletons optimizados
const ReservationsGridAdmin = dynamic(
  () => import("@/components/reservations-grid-admin").then(mod => ({ default: mod.ReservationsGridAdmin })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
)

const ServicesManagementAdmin = dynamic(
  () => import("@/components/services-management-admin").then(mod => ({ default: mod.ServicesManagementAdmin })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
)

const PortfolioManagementAdmin = dynamic(
  () => import("@/components/portfolio-management-admin").then(mod => ({ default: mod.PortfolioManagementAdmin })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
)

const WorkingHoursConfig = dynamic(
  () => import("@/components/working-hours-config").then(mod => ({ default: mod.WorkingHoursConfig })),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
)

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'portfolio' | 'config'>('reservations')
  const [isLoading, setIsLoading] = useState(true)
  const { stats, statsLoading } = useDashboardStats()

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      // Pequeño delay para mostrar la página inmediatamente
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const adminSession = localStorage.getItem('admin_authenticated')
      if (adminSession === 'true') {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const handleAuthSuccess = () => {
    localStorage.setItem('admin_authenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
  }

  // Mostrar loading inicial muy breve
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
  const formatPrice = (priceInPesos: number) => {
    return `$${priceInPesos.toLocaleString('es-AR')}`
  }

  const tabs = [
    { id: 'reservations', label: 'Reservas', icon: CalendarDays },
    { id: 'services', label: 'Servicios', icon: Settings },
    { id: 'portfolio', label: 'Portfolio', icon: ImageIcon },
    { id: 'config', label: 'Horarios', icon: Clock }
  ] as const

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AnimatedOnScroll animation={fadeInUp} delay={0.1}>
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-muted-foreground mt-1">Gestiona tu negocio de uñas</p>
              </div>
              <HoverCard scale={1.05}>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="hover:bg-destructive hover:text-destructive-foreground transition-colors duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </HoverCard>
            </div>
          </div>
        </div>
      </AnimatedOnScroll>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <AnimatedOnScroll animation={fadeInUp} delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <HoverCard scale={1.02} shadow={true}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Reservas Pendientes
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      getStatValue('pending_reservations')
                    )}
                  </div>
                </CardContent>
              </Card>
            </HoverCard>

            <HoverCard scale={1.02} shadow={true}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Reservas Confirmadas
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      getStatValue('confirmed_reservations')
                    )}
                  </div>
                </CardContent>
              </Card>
            </HoverCard>

            <HoverCard scale={1.02} shadow={true}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Ingresos del Mes
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                    ) : (
                      formatPrice(getStatValue('monthly_revenue'))
                    )}
                  </div>
                </CardContent>
              </Card>
            </HoverCard>

            <HoverCard scale={1.02} shadow={true}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Servicios Activos
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      getStatValue('active_services')
                    )}
                  </div>
                </CardContent>
              </Card>
            </HoverCard>
          </div>
        </AnimatedOnScroll>

        {/* Navigation Tabs */}
        <AnimatedOnScroll animation={fadeInUp} delay={0.3}>
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab, index) => (
                <AnimatedOnScroll key={tab.id} animation={fadeInUp} delay={0.4 + index * 0.1}>
                  <HoverCard scale={1.05}>
                    <Button
                      variant={activeTab === tab.id ? 'default' : 'outline'}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-xl w-full sm:w-auto transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'shadow-lg scale-105' 
                          : 'hover:shadow-md hover:scale-105'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  </HoverCard>
                </AnimatedOnScroll>
              ))}
            </div>
          </div>
        </AnimatedOnScroll>

        {/* Tab Content */}
        <AnimatedOnScroll animation={fadeInUp} delay={0.5}>
          <div className="min-h-[400px]">
            {activeTab === 'reservations' && <ReservationsGridAdmin />}
            {activeTab === 'services' && <ServicesManagementAdmin />}
            {activeTab === 'portfolio' && <PortfolioManagementAdmin />}
            {activeTab === 'config' && <WorkingHoursConfig />}
          </div>
        </AnimatedOnScroll>
      </div>
    </div>
  )
}