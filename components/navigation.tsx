"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { User } from "lucide-react"

const navItems = [
  { href: "/", label: "Inicio", ariaLabel: "Ir a la página de inicio" },
  { href: "/portfolio", label: "Mis Trabajos", ariaLabel: "Ver nuestros trabajos y portfolio" },
  { href: "/reservas", label: "Reservas", ariaLabel: "Hacer una reserva" },
  { href: "/admin", label: "Admin", icon: User, ariaLabel: "Acceder al panel de administración" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigation = async (href: string) => {
    if (href === pathname) return
    
    setIsNavigating(true)
    
    // Prefetch la página para carga más rápida
    router.prefetch(href)
    
    // Navegar después de un pequeño delay para mostrar loading
    setTimeout(() => {
      router.push(href)
      setIsNavigating(false)
    }, 100)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border" role="navigation" aria-label="Navegación principal">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => handleNavigation("/")}
              className="text-xl font-bold text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Merakii Nails - Ir a la página de inicio"
            >
              Merakii Nails
            </button>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1" role="menubar">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  role="none"
                >
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 relative",
                      "hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    disabled={isNavigating}
                    role="menuitem"
                    aria-label={item.ariaLabel}
                    aria-current={isActive ? "page" : undefined}
                    tabIndex={0}
                  >
                    {item.icon ? (
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      item.label
                    )}
                    {isNavigating && (
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Loading Bar */}
      {isNavigating && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.3 }}
          role="progressbar"
          aria-label="Cargando página"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </nav>
  )
}