"use client"

import { useState, useEffect } from "react"
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
      const data = await PortfolioService.getAll()
      setPortfolioItems(data)
    } catch (err) {
      setError('Error al cargar el portfolio')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar skeleton mientras carga
  if (loading) {
    return <PortfolioGridSkeleton />
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

  if (error) {
    return (
      <div className="text-center text-destructive py-12">
        <p>{error}</p>
        <Button onClick={loadPortfolioItems} className="mt-4">Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1 text-sm rounded-full transition-colors",
              selectedTags.includes(tag)
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
            )}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Portfolio Grid */}
      {displayedItems.length === 0 && !loading ? (
        <div className="text-center text-muted-foreground py-12">
          <p>No hay trabajos en el portfolio que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer rounded-xl overflow-hidden shadow-lg border border-border"
              onClick={() => openImageModal(item)}
            >
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {visibleItems < filteredItems.length && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMore} variant="secondary" className="rounded-xl">
            Cargar Más
          </Button>
        </div>
      )}

      {/* Simple Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeImageModal}>
          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image_url || "/placeholder.svg"}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{selectedImage.title}</h3>
              <p className="text-gray-300">{selectedImage.description}</p>
            </div>
            <Button 
              onClick={closeImageModal} 
              className="mt-4 bg-white text-black hover:bg-gray-200"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}