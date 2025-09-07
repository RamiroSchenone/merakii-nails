"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Image as ImageIcon, Upload } from "lucide-react"
import { PortfolioService } from "@/lib/services-extended"
import { PortfolioItem } from "@/lib/database.types"
import { ImageUpload } from "@/components/image-upload"

export function PortfolioManagementAdmin() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    tags: "",
    is_featured: false,
    display_order: 0
  })

  // Cargar items del portfolio
  const loadPortfolioItems = async () => {
    try {
      setLoading(true)
      const items = await PortfolioService.getAll()
      setPortfolioItems(items)
    } catch (error) {
      console.error('Error cargando portfolio:', error)
      alert('Error al cargar el portfolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolioItems()
  }, [])

  // Filtrar items por término de búsqueda
  const filteredItems = portfolioItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Abrir diálogo para agregar nuevo item
  const openAddDialog = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      tags: "",
      is_featured: false,
      display_order: portfolioItems.length
    })
    setIsAddDialogOpen(true)
  }

  // Abrir diálogo para editar item
  const openEditDialog = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || "",
      image_url: item.image_url || "",
      tags: item.tags?.join(", ") || "",
      is_featured: item.is_featured,
      display_order: item.display_order
    })
    setIsEditDialogOpen(true)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const itemData = {
        title: formData.title,
        description: formData.description || '',
        image_url: formData.image_url || '',
        tags: tagsArray,
        is_featured: formData.is_featured,
        display_order: formData.display_order
      }

      if (editingItem) {
        await PortfolioService.update(editingItem.id, itemData)
      } else {
        await PortfolioService.create(itemData)
      }

      await loadPortfolioItems()
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Error guardando item:', error)
      alert('Error al guardar el item del portfolio')
    }
  }

  // Eliminar item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item del portfolio?')) {
      return
    }

    try {
      await PortfolioService.delete(id)
      await loadPortfolioItems()
    } catch (error) {
      console.error('Error eliminando item:', error)
      alert('Error al eliminar el item del portfolio')
    }
  }

  // Toggle featured status
  const toggleFeatured = async (item: PortfolioItem) => {
    try {
      await PortfolioService.update(item.id, { is_featured: !item.is_featured })
      await loadPortfolioItems()
    } catch (error) {
      console.error('Error actualizando featured status:', error)
      alert('Error al actualizar el estado destacado')
    }
  }

  // Manejar subida de imagen
  const handleImageUploaded = (imageUrl: string, imagePath: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }))
    setIsUploadDialogOpen(false)
  }

  // Abrir diálogo de subida de imagen
  const openUploadDialog = () => {
    setIsUploadDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Cargando portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Portfolio</h2>
          <p className="text-muted">Administra los trabajos mostrados en el portfolio</p>
        </div>
        <Button onClick={openAddDialog} className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Trabajo
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar trabajos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Grid de items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="rounded-2xl border-border bg-card transition-all hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-card-foreground">{item.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={item.is_featured ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-800 border-gray-200"}
                      >
                        {item.is_featured ? "Destacado" : "Normal"}
                      </Badge>
                      <Badge variant="outline">
                        Orden: {item.display_order}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Imagen */}
                  {item.image_url && (
                    <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(item)}
                      className="flex-1 rounded-xl"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={item.is_featured ? "outline" : "default"}
                      onClick={() => toggleFeatured(item)}
                      className="rounded-xl"
                    >
                      {item.is_featured ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
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

      {/* Mensaje cuando no hay items */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? "No se encontraron trabajos" : "No hay trabajos en el portfolio"}
          </h3>
          <p className="text-muted mb-4">
            {searchTerm ? "Intenta con otros términos de búsqueda" : "Agrega tu primer trabajo al portfolio"}
          </p>
          {!searchTerm && (
            <Button onClick={openAddDialog} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Trabajo
            </Button>
          )}
        </div>
      )}

      {/* Diálogo para agregar/editar */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setEditingItem(null)
        }
      }}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Trabajo" : "Agregar Nuevo Trabajo"}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Modifica los detalles del trabajo" : "Completa la información del nuevo trabajo"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nombre del trabajo"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Orden de Visualización</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el trabajo realizado..."
                rows={3}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de la Imagen</Label>
              <div className="flex gap-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="rounded-xl flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={openUploadDialog}
                  className="rounded-xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir
                </Button>
              </div>
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separados por comas)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="manicure, francesa, elegante"
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_featured">Marcar como destacado</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setEditingItem(null)
                }}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingItem ? "Actualizar" : "Crear"} Trabajo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para subir imagen */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Subir Imagen</DialogTitle>
            <DialogDescription>
              Selecciona una imagen para el portfolio
            </DialogDescription>
          </DialogHeader>
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            onCancel={() => setIsUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
