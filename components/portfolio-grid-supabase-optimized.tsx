"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PortfolioService } from "@/lib/services"
import { PortfolioItem } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { PortfolioGridSkeleton } from "@/components/skeletons"
import { ImageModal } from "@/components/image-modal"

// Componente de portfolio ultra-optimizado
export function PortfolioGridSupabaseOptimized() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null)
  const [visibleItems, setVisibleItems] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Cargar datos inmediatamente sin bloquear el render
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await PortfolioService.getAll()
        setPortfolioItems(data)
      } catch (err) {
        setError('Error al cargar los trabajos')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    // Cargar inmediatamente
    loadData()
  }, [])

  // Manejar carga de imágenes individuales
  const handleImageLoad = (itemId: string) => {
    setImagesLoaded(prev => new Set([...prev, itemId]))
  }

  const allTags = Array.from(new Set(portfolioItems.flatMap((item) => item.tags)))

  const filteredItems = portfolioItems.filter(
    (item) => selectedTags.length === 0 || selectedTags.some((tag) => item.tags.includes(tag)),
  )

  const displayedItems = filteredItems.slice(0, visibleItems)

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
    setVisibleItems(6)
  }

  const loadMore = () => {
    setVisibleItems((prev) => prev + 6)
  }

  const openImageModal = (item: PortfolioItem) => {
    setSelectedImage(item)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar el portfolio</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  // Si no hay items y no está cargando
  if (portfolioItems.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay trabajos disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Filtros de tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10"
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item) => {
          const isImageLoaded = imagesLoaded.has(item.id)
          
          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg bg-card border border-border cursor-pointer transition-transform hover:scale-105"
              onClick={() => openImageModal(item)}
            >
              {/* Skeleton mientras carga la imagen */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse z-10">
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50"></div>
                </div>
              )}
              
              {/* Imagen real */}
              <div className="relative w-full h-64">
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-opacity duration-300"
                  style={{ opacity: isImageLoaded ? 1 : 0 }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageLoad(item.id)} // Marcar como cargada aunque falle
                />
              </div>

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
                <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-white/90 line-clamp-2">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-white/20 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Badge de destacado */}
              {item.is_featured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-primary-foreground">
                    Destacado
                  </Badge>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Botón de cargar más */}
      {filteredItems.length > visibleItems && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline" size="lg">
            Ver más trabajos
          </Button>
        </div>
      )}

      {/* Modal de imagen */}
      {selectedImage && (
        <ImageModal
          item={selectedImage}
          isOpen={!!selectedImage}
          onClose={closeImageModal}
        />
      )}
    </div>
  )
}
