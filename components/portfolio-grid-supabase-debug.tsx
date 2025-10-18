"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PortfolioService } from "@/lib/services"
import { PortfolioItem } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { PortfolioGridSkeleton } from "@/components/skeletons"

export function PortfolioGridSupabase() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(null)
  const [visibleItems, setVisibleItems] = useState(6)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPortfolioItems()
  }, [])

  const loadPortfolioItems = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando items del portfolio...')
      
      const data = await PortfolioService.getAll()
      console.log('✅ Items cargados:', data)
      
      setPortfolioItems(data)
    } catch (err) {
      console.error('❌ Error cargando portfolio:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los trabajos')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar skeleton mientras carga
  if (loading) {
    return <PortfolioGridSkeleton />
  }

  // Mostrar error si hay uno
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar el portfolio</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={loadPortfolioItems} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  // Si no hay items
  if (portfolioItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No hay trabajos disponibles</h3>
        <p className="text-muted-foreground">Pronto agregaremos nuevos trabajos al portfolio.</p>
      </div>
    )
  }

  const allTags = Array.from(new Set(portfolioItems.flatMap((item) => item.tags || [])))

  const filteredItems = portfolioItems.filter(
    (item) => selectedTags.length === 0 || selectedTags.some((tag) => (item.tags || []).includes(tag)),
  )

  const displayedItems = filteredItems.slice(0, visibleItems)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const loadMore = () => {
    setVisibleItems(prev => prev + 6)
  }

  const openImageModal = (item: PortfolioItem) => {
    setSelectedImage(item)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  return (
    <div className="space-y-8">
      {/* Filtros de tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTags.length === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTags([])}
            className="rounded-full"
          >
            Todos
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {/* Grid de trabajos */}
      {displayedItems.length === 0 && !loading ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No hay trabajos que coincidan con los filtros.</h3>
          <p className="text-muted-foreground">Intenta seleccionar diferentes categorías.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg border border-border"
              onClick={() => openImageModal(item)}
            >
              <div className="relative w-full h-64">
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.description}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón Load More */}
      {filteredItems.length > visibleItems && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline" className="rounded-xl">
            Ver más trabajos
          </Button>
        </div>
      )}

      {/* Simple Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-[90vh] bg-card rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeImageModal}
              className="absolute right-4 top-4 z-10 rounded-full bg-background/80 text-foreground hover:bg-background"
            >
              ✕
            </Button>
            
            <div className="p-6">
              <div className="relative w-full h-96 mb-4">
                <Image
                  src={selectedImage.image_url || "/placeholder.svg"}
                  alt={selectedImage.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
              <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
              <p className="text-muted-foreground mt-2">{selectedImage.description}</p>
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedImage.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
