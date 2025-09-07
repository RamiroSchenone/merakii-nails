"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PortfolioItem {
  id: number
  title: string
  description: string
  imageUrl: string
  tags: string[]
}

interface ImageModalProps {
  item: PortfolioItem
  onClose: () => void
}

export function ImageModal({ item, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-background/80 text-foreground hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="grid gap-0 md:grid-cols-2">
            {/* Image */}
            <motion.div 
              className="aspect-[3/4] md:aspect-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
            </motion.div>

            {/* Content */}
            <motion.div 
              className="flex flex-col justify-center p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="mb-4 text-2xl font-bold text-card-foreground">{item.title}</h2>
              <p className="mb-6 text-muted leading-relaxed">{item.description}</p>

              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-card-foreground">Categorías</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <Badge variant="secondary" className="rounded-full">
                        {tag}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button className="rounded-xl" onClick={onClose}>
                  Cerrar
                </Button>
                <Button variant="outline" className="rounded-xl bg-transparent">
                  Reservar este estilo
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
