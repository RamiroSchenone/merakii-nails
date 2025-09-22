'use client'

import { useEffect, useState } from 'react'
import { initializeApp } from '@/lib/app-init'

interface AppInitializerProps {
  children: React.ReactNode
}

export function AppInitializer({ children }: AppInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La inicialización tardó demasiado')), 10000)
        )
        
        const initPromise = initializeApp()
        
        await Promise.race([initPromise, timeoutPromise])
        
        setIsInitialized(true)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('appInitialized'))
        }
      } catch (err) {
        console.error('Error inicializando la app:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setIsInitialized(true)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('appInitialized'))
        }
      }
    }

    init()
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn('La aplicación se ejecutará sin autenticación automática:', error)
  }

  return <>{children}</>
}
