"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PortfolioService } from "@/lib/services"
import { PortfolioItem } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { PortfolioGridSkeleton } from "@/components/skeletons"
import { ImageModal } from "@/components/image-modal"
import { AnimatedOnScroll, HoverCard, fadeInUp } from "@/components/animated-elements"

// Componente de portfolio con lazy loading de imágenes
export function PortfolioGridSupabaseLazy() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null)
  const [visibleItems, setVisibleItems] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Cargar datos inmediatamente
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

    loadData()
  }, [])

  // Configurar Intersection Observer para lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id')
            if (itemId) {
              setVisibleImages(prev => new Set([...prev, itemId]))
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
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
        <AnimatedOnScroll animation={fadeInUp} delay={0.1}>
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map((tag, index) => (
              <AnimatedOnScroll key={tag} animation={fadeInUp} delay={0.2 + index * 0.1}>
                <Badge
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105",
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-primary/10 hover:shadow-md"
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              </AnimatedOnScroll>
            ))}
          </div>
        </AnimatedOnScroll>
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, index) => {
          const isImageLoaded = imagesLoaded.has(item.id)
          const isImageVisible = visibleImages.has(item.id)
          
          return (
            <AnimatedOnScroll key={item.id} animation={fadeInUp} delay={0.3 + index * 0.1}>
              <HoverCard scale={1.05} shadow={true}>
                <div
                  className="group relative overflow-hidden rounded-lg bg-card border border-border cursor-pointer transition-all duration-300 hover:shadow-xl"
                  onClick={() => openImageModal(item)}
                  data-item-id={item.id}
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el)
                    }
                  }}
                >
              {/* Skeleton mientras carga la imagen */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse z-10">
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50"></div>
                </div>
              )}
              
              {/* Imagen real - solo cargar si es visible */}
              <div className="relative w-full h-64">
                {isImageVisible && (
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-opacity duration-300"
                    style={{ opacity: isImageLoaded ? 1 : 0 }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onLoad={() => handleImageLoad(item.id)}
                    onError={() => handleImageLoad(item.id)}
                    loading="lazy"
                  />
                )}
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
              </HoverCard>
            </AnimatedOnScroll>
          )
        })}
      </div>

      {/* Botón de cargar más */}
      {filteredItems.length > visibleItems && (
        <AnimatedOnScroll animation={fadeInUp} delay={0.5}>
          <div className="text-center">
            <Button onClick={loadMore} variant="outline" size="lg" className="hover:scale-105 transition-transform duration-300">
              Ver más trabajos
            </Button>
          </div>
        </AnimatedOnScroll>
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
