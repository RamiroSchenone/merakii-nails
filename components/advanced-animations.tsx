"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Componente para efectos de partículas avanzados
interface ParticleProps {
  x: number
  y: number
  delay: number
  duration: number
}

function Particle({ x, y, delay, duration }: ParticleProps) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-primary/30 rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, -100, 0],
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  )
}

export function AdvancedParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          delay={particle.delay}
          duration={particle.duration}
        />
      ))}
    </div>
  )
}

// Componente para efectos de ondas
export function RippleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-primary/20 rounded-full"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

// Componente para efectos de gradiente animado
export function AnimatedGradient() {
  return (
    <motion.div
      className="absolute inset-0 opacity-30"
      style={{
        background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)",
        backgroundSize: "400% 400%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

// Componente para efectos de texto flotante
interface FloatingTextProps {
  text: string
  className?: string
}

export function FloatingText({ text, className = "" }: FloatingTextProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.div>
  )
}

// Componente para efectos de carga con progreso
interface ProgressLoaderProps {
  progress: number
  size?: number
  strokeWidth?: number
}

export function ProgressLoader({ 
  progress, 
  size = 40, 
  strokeWidth = 4 
}: ProgressLoaderProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-primary"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
