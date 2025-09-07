import { supabase } from './supabase'

// Configuración del bucket de portfolio
const PORTFOLIO_BUCKET = 'portfolio-images'

export class StorageService {
  /**
   * Subir imagen al portfolio (desde el cliente)
   */
  static async uploadPortfolioImage(file: File, fileName?: string): Promise<{ path: string; url: string }> {
    try {
      console.log('📤 Iniciando subida de imagen:', {
        fileName: fileName || file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: PORTFOLIO_BUCKET
      })

      // Generar nombre único si no se proporciona
      const finalFileName = fileName || `${Date.now()}-${file.name}`
      
      // Subir archivo
      const { data, error } = await supabase.storage
        .from(PORTFOLIO_BUCKET)
        .upload(finalFileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Error de Supabase Storage:', {
          message: error.message,
          error: (error as any).error,
          details: error
        })
        throw new Error(`Error subiendo imagen: ${error.message}`)
      }

      console.log('✅ Archivo subido exitosamente:', data.path)

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(PORTFOLIO_BUCKET)
        .getPublicUrl(data.path)

      console.log('🔗 URL pública generada:', urlData.publicUrl)

      return {
        path: data.path,
        url: urlData.publicUrl
      }
    } catch (error) {
      console.error('❌ Error en StorageService.uploadPortfolioImage:', error)
      throw error
    }
  }

  /**
   * Eliminar imagen del portfolio (desde el cliente)
   */
  static async deletePortfolioImage(imagePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(PORTFOLIO_BUCKET)
        .remove([imagePath])

      if (error) {
        throw new Error(`Error eliminando imagen: ${error.message}`)
      }
    } catch (error) {
      console.error('Error en StorageService.deletePortfolioImage:', error)
      throw error
    }
  }

  /**
   * Obtener URL pública de una imagen
   */
  static getPublicUrl(imagePath: string): string {
    const { data } = supabase.storage
      .from(PORTFOLIO_BUCKET)
      .getPublicUrl(imagePath)
    
    return data.publicUrl
  }

  /**
   * Listar todas las imágenes del portfolio
   */
  static async listPortfolioImages(): Promise<Array<{ name: string; path: string; url: string }>> {
    try {
      const { data, error } = await supabase.storage
        .from(PORTFOLIO_BUCKET)
        .list()

      if (error) {
        throw new Error(`Error listando imágenes: ${error.message}`)
      }

      return data.map(file => ({
        name: file.name,
        path: file.name,
        url: this.getPublicUrl(file.name)
      }))
    } catch (error) {
      console.error('Error en StorageService.listPortfolioImages:', error)
      throw error
    }
  }
}
