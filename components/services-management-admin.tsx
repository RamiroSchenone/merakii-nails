"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Clock, Search, RefreshCw } from "lucide-react"
import { Service } from "@/lib/database.types"
import { motion, AnimatePresence } from "framer-motion"
import { useServicesAdmin } from "@/hooks/use-services-admin"

export function ServicesManagementAdmin() {
  const { services, loading, refreshServices, addService, updateService, deleteService } = useServicesAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 60,
    price: 25000,
    is_active: true,
    has_retiro: false,
    has_diseno: false
  })

  // Opciones de duración en incrementos de 30 minutos
  const durationOptions = [
    { value: 30, label: "0:30hs" },
    { value: 60, label: "1:00hs" },
    { value: 90, label: "1:30hs" },
    { value: 120, label: "2:00hs" },
    { value: 150, label: "2:30hs" },
    { value: 180, label: "3:00hs" },
    { value: 210, label: "3:30hs" },
    { value: 240, label: "4:00hs" },
  ]

  // Abrir diálogo para nuevo servicio
  const openNewServiceDialog = () => {
    setEditingService(null)
    setFormData({
      name: "",
      description: "",
      duration: 60,
      price: 25000,
      is_active: true,
      has_retiro: false,
      has_diseno: false
    })
    setIsDialogOpen(true)
  }

  // Abrir diálogo para editar servicio
  const openEditServiceDialog = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      is_active: service.is_active,
      has_retiro: service.has_retiro || false,
      has_diseno: service.has_diseno || false
    })
    setIsDialogOpen(true)
  }

  // Guardar servicio
  const saveService = async () => {
    try {
      if (editingService) {
        // Actualizar servicio existente
        await updateService(editingService.id, formData)
      } else {
        // Crear nuevo servicio
        await addService(formData)
      }
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error guardando servicio:', error)
      alert('Error al guardar el servicio')
    }
  }

  // Eliminar servicio
  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return
    }
    
    try {
      await deleteService(id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al eliminar servicio: ${errorMessage}`)
    }
  }

  // Filtrar servicios
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Formatear precio
  const formatPrice = (priceInPesos: number) => {
    return `$${priceInPesos.toLocaleString('es-AR')}`
  }

  // Formatear duración
  const formatDuration = (durationInMinutes: number) => {
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}hs aprox.`
    } else if (hours > 0) {
      return `${hours}:00hs aprox.`
    } else {
      return `${minutes}min aprox.`
    }
  }

  // Generar leyendas del servicio
  const getServiceLegends = (service: Service): string[] => {
    const legends: string[] = []
    if (service.has_retiro) legends.push("Incluye retiro")
    if (service.has_diseno) legends.push("Incluye diseño")
    return legends
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón agregar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Gestión de Servicios
              </CardTitle>
              <CardDescription>
                Administra los servicios disponibles en tu estudio
              </CardDescription>
            </div>
            <Button onClick={openNewServiceDialog} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button 
              onClick={refreshServices} 
              variant="outline" 
              size="sm"
              className="rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grilla de servicios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`rounded-xl border-border hover:shadow-md transition-shadow h-52 flex flex-col ${
                !service.is_active ? 'opacity-60' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {getServiceLegends(service).length > 0 && (
                        <p className="text-xs italic text-muted-foreground mt-1">
                          {getServiceLegends(service).join(" • ")}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant={service.is_active ? "default" : "secondary"}
                      className={service.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {service.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Duración y precio */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <span>{formatPrice(service.price)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditServiceDialog(service)}
                      className="flex-1 rounded-xl"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteService(service.id)}
                      className="rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Mensaje si no hay servicios */}
      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay servicios</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'No se encontraron servicios con el término de búsqueda'
                : 'Aún no tienes servicios registrados'
              }
            </p>
            {!searchTerm && (
              <Button onClick={openNewServiceDialog} className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Servicio
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo para crear/editar servicio */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Servicio" : "Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription>
              {editingService 
                ? "Modifica los datos del servicio" 
                : "Agrega un nuevo servicio a tu catálogo"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Servicio</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Manicura Clásica"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el servicio..."
                className="rounded-xl"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración aproximada</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Precio (pesos argentinos)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="25000"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Características del servicio */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Características incluidas</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_retiro"
                  checked={formData.has_retiro}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_retiro: !!checked })}
                />
                <Label htmlFor="has_retiro" className="text-sm">
                  Incluye retiro de uñas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_diseno"
                  checked={formData.has_diseno}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_diseno: !!checked })}
                />
                <Label htmlFor="has_diseno" className="text-sm">
                  Incluye diseño personalizado
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              onClick={saveService}
              className="rounded-xl"
            >
              {editingService ? "Actualizar" : "Crear"} Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
