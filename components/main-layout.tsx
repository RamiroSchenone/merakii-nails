"use client"

import { ReactNode } from "react"

interface MainLayoutProps {
  children: ReactNode
  showBackButton?: boolean
  backHref?: string
  title?: string
  subtitle?: string
}

export function MainLayout({ 
  children, 
  showBackButton = false, 
  backHref = "/", 
  title, 
  subtitle 
}: MainLayoutProps) {
  return (
    <>
      {/* Header de página (opcional) */}
      {showBackButton && (
        <header className="border-b border-border px-4 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-4">
              <a 
                href={backHref}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </a>
              {title && (
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                  {subtitle && <p className="text-muted">{subtitle}</p>}
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* Contenido de la página */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </div>
    </>
  )
}
