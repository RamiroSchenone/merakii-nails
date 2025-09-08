"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { StorageService } from "@/lib/storage"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imagePath: string) => void
  onCancel: () => void
}

export function ImageUpload({ onImageUploaded, onCancel }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de archivo no soportado: ${file.type}\n\nTipos permitidos: JPG, PNG, WebP, GIF`)
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB')
        return
      }

      setSelectedFile(file)
      setFileName(file.name.replace(/\.[^/.]+$/, "")) // Remover extensión
      
      // Crear preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const loadingToast = toast.loading('Subiendo imagen...')

    try {
      setUploading(true)
      
      console.log('🚀 Iniciando proceso de subida...')
      
      // Generar nombre único
      const timestamp = Date.now()
      const fileExtension = selectedFile.name.split('.').pop()
      const finalFileName = `${fileName || 'trabajo'}-${timestamp}.${fileExtension}`
      
      console.log('📝 Nombre del archivo:', finalFileName)
      
      // Subir imagen
      const { path, url } = await StorageService.uploadPortfolioImage(selectedFile, finalFileName)
      
      console.log('✅ Subida completada:', { path, url })
      
      // Mostrar éxito
      toast.dismiss(loadingToast)
      toast.success('¡Imagen subida exitosamente!')
      
      // Notificar al componente padre
      onImageUploaded(url, path)
      
      // Limpiar estado
      setSelectedFile(null)
      setPreviewUrl(null)
      setFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error)
      toast.dismiss(loadingToast)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al subir la imagen: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onCancel()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Subir Imagen del Trabajo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de archivo */}
        <div className="space-y-2">
          <Label htmlFor="image-upload">Seleccionar Imagen</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="rounded-xl"
          />
          <p className="text-sm text-muted-foreground">
            Formatos: JPG, PNG, WebP, GIF. Máximo 5MB
          </p>
        </div>

        {/* Preview de imagen */}
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-2"
          >
            <Label>Vista Previa</Label>
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewUrl(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Nombre personalizado */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="file-name">Nombre del archivo (opcional)</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nombre personalizado..."
              className="rounded-xl"
            />
          </motion.div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 rounded-xl"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir Imagen
              </>
            )}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="rounded-xl"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}