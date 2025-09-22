import { supabase, supabaseAdmin } from './supabase'

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
      const client = await supabase()
      const { data, error } = await client.storage
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
      const client2 = await supabase()
      const { data: urlData } = client2.storage
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
      const client = await supabase()
      const { error } = await client.storage
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
  static async getPublicUrl(imagePath: string): Promise<string> {
    const client = await supabase()
    const { data } = client.storage
      .from(PORTFOLIO_BUCKET)
      .getPublicUrl(imagePath)
    
    return data.publicUrl
  }

  /**
   * Listar todas las imágenes del portfolio
   */
  static async listPortfolioImages(): Promise<Array<{ name: string; path: string; url: string }>> {
    try {
      const client = await supabase()
      const { data, error } = await client.storage
        .from(PORTFOLIO_BUCKET)
        .list()

      if (error) {
        throw new Error(`Error listando imágenes: ${error.message}`)
      }

      const filesWithUrls = await Promise.all(
        data.map(async file => ({
          name: file.name,
          path: file.name,
          url: await this.getPublicUrl(file.name)
        }))
      )

      return filesWithUrls
    } catch (error) {
      console.error('Error en StorageService.listPortfolioImages:', error)
      throw error
    }
  }
}
