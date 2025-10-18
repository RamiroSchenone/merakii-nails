"use client"

import { useState, useEffect } from "react"
import { PortfolioService } from "@/lib/services"
import { PortfolioItem } from "@/lib/database.types"

export function PortfolioTest() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🧪 Probando conexión a Supabase...')
      const data = await PortfolioService.getAll()
      console.log('✅ Conexión exitosa:', data)
      
      setItems(data)
    } catch (err) {
      console.error('❌ Error de conexión:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Probando conexión...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold mb-2">Error de Conexión</h3>
          <p className="text-red-600">{error}</p>
        </div>
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-green-800 font-semibold mb-2">✅ Conexión Exitosa</h3>
        <p className="text-green-600">Se encontraron {items.length} items en el portfolio</p>
      </div>
      
      {items.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Items encontrados:</h4>
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <h5 className="font-medium">{item.title}</h5>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-500">ID: {item.id}</p>
              {item.image_url && (
                <p className="text-xs text-blue-600">Imagen: {item.image_url}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
