"use client"

import { motion, useInView, useAnimation } from "framer-motion"
import { useRef, useEffect, useState } from "react"

// Animaciones predefinidas para mejor performance
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Componente para animaciones cuando entra en viewport
interface AnimatedOnScrollProps {
  children: React.ReactNode
  animation?: any
  delay?: number
  className?: string
}

export function AnimatedOnScroll({ 
  children, 
  animation = fadeInUp, 
  delay = 0,
  className = ""
}: AnimatedOnScrollProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start({
        ...animation.animate,
        transition: { ...animation.transition, delay }
      })
    }
  }, [isInView, controls, animation, delay])

  return (
    <motion.div
      ref={ref}
      initial={animation.initial}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Componente para hover effects mejorados
interface HoverCardProps {
  children: React.ReactNode
  className?: string
  scale?: number
  shadow?: boolean
}

export function HoverCard({ 
  children, 
  className = "", 
  scale = 1.05,
  shadow = true 
}: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale,
        ...(shadow && { 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
        })
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {children}
    </motion.div>
  )
}

// Componente para animaciones de carga mejoradas
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}

// Componente para efectos de partículas sutiles
export function FloatingElements() {
  // Valores fijos para evitar problemas de hidratación
  const fixedPositions = [
    { left: 15, top: 20 },
    { left: 85, top: 30 },
    { left: 25, top: 70 },
    { left: 75, top: 80 },
    { left: 45, top: 15 },
    { left: 60, top: 90 }
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {fixedPositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + (i * 0.3),
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// Componente para transiciones de página suaves
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}

// Componente para efectos de escritura
interface TypewriterProps {
  text: string
  speed?: number
  className?: string
}

export function Typewriter({ text, speed = 50, className = "" }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-1"
      >
        |
      </motion.span>
    </span>
  )
}
