"use client"

import { useRef, useEffect, useState } from "react"
import { useInView } from "framer-motion"

// Hook para optimizar animaciones basado en preferencias del usuario
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook para animaciones optimizadas
export function useOptimizedAnimation() {
  const prefersReducedMotion = useReducedMotion()

  const getAnimationProps = (baseAnimation: any) => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.1 }
      }
    }
    return baseAnimation
  }

  return { getAnimationProps, prefersReducedMotion }
}

// Hook para lazy loading de imágenes con intersection observer
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      options
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src, options])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return {
    imgRef,
    imageSrc,
    isLoaded,
    handleLoad
  }
}

// Hook para prefetch de rutas
export function usePrefetch() {
  const prefetchedRoutes = useRef(new Set<string>())

  const prefetchRoute = (href: string) => {
    if (!prefetchedRoutes.current.has(href)) {
      // Prefetch solo en conexiones rápidas
      if ('connection' in navigator && (navigator as any).connection?.effectiveType === '4g') {
        import('next/router').then(({ default: router }) => {
          router.prefetch(href)
          prefetchedRoutes.current.add(href)
        })
      }
    }
  }

  return { prefetchRoute }
}

// Hook para detectar si el usuario está en mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

// Hook para performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }))
        frameCount = 0
        lastTime = currentTime
      }

      // Memory usage (si está disponible)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
        }))
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    animationId = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return metrics
}

// Hook para animaciones basadas en scroll
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')

  useEffect(() => {
    let lastScrollY = window.scrollY

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down')
      } else {
        setScrollDirection('up')
      }
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [])

  return { scrollY, scrollDirection }
}
