// Utilitário para otimização de imagens para web

export interface ImageOptimizerOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Redimensiona e comprime uma imagem para otimização web
 * @param file Arquivo de imagem
 * @param options Opções de otimização
 * @returns Promise com a imagem otimizada como base64 ou Blob
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizerOptions = {}
): Promise<{ dataUrl: string; blob: Blob; size: number; originalSize: number }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calcular novas dimensões mantendo aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        
        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'))
          return
        }
        
        // Configurar alta qualidade de renderização
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Se for PNG, preservar transparência (não limpar canvas)
        // Para JPEG/WebP, o fundo será branco por padrão
        const isPNG = file.type === 'image/png'
        const usePNG = isPNG || format === 'png'
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Determinar formato de saída
        let outputMimeType = `image/${format}`
        let outputQuality: number | undefined = quality
        
        // Se for PNG original, usar PNG (preserva transparência melhor)
        if (usePNG) {
          outputMimeType = 'image/png'
          outputQuality = undefined // PNG não suporta quality parameter
        } else if (file.type === 'image/webp' || format === 'webp') {
          outputMimeType = 'image/webp'
        } else {
          outputMimeType = 'image/jpeg'
        }
        
        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao converter imagem'))
              return
            }
            
            // Converter blob para data URL
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                dataUrl: reader.result as string,
                blob,
                size: blob.size,
                originalSize: file.size
              })
            }
            reader.onerror = () => reject(new Error('Erro ao ler blob'))
            reader.readAsDataURL(blob)
          },
          outputMimeType,
          outputQuality
        )
      }
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Valida se o arquivo é uma imagem válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB.'
    }
  }
  
  return { valid: true }
}

/**
 * Converte bytes para formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

