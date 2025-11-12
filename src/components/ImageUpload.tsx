import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { optimizeImage, validateImageFile, formatFileSize } from '@/lib/imageOptimizer'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Imagem de Destaque',
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragActive, setDragActive] = useState(false)

  // Atualizar preview quando value mudar externamente
  useEffect(() => {
    if (value) {
      setPreview(value)
    } else {
      setPreview(null)
    }
  }, [value])

  const handleFileSelect = async (file: File) => {
    // Validar arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Arquivo inválido')
      return
    }

    setUploading(true)

    try {
      // Otimizar imagem
      const optimized = await optimizeImage(file, {
        maxWidth,
        maxHeight,
        quality
      })

      // Atualizar preview e valor
      setPreview(optimized.dataUrl)
      onChange(optimized.dataUrl)

      // Mostrar feedback de otimização
      const compression = ((1 - optimized.size / optimized.originalSize) * 100).toFixed(1)
      toast.success(
        `Imagem otimizada! ${compression}% de compressão (${formatFileSize(optimized.originalSize)} → ${formatFileSize(optimized.size)})`
      )
    } catch (error: any) {
      console.error('Erro ao processar imagem:', error)
      toast.error(error.message || 'Erro ao processar imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    if (url) {
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* Upload por arquivo */}
      <div className="space-y-2">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            <div className="space-y-4">
              <div className="relative inline-block max-w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-lg shadow-md mx-auto"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Trocar Imagem
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-600">Otimizando imagem...</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Arraste uma imagem aqui ou{' '}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        clique para selecionar
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WebP ou GIF (máx. 10MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Ou usar URL */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Ou</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-url">Ou use URL da Imagem</Label>
        <Input
          id="image-url"
          type="url"
          value={value.startsWith('data:') ? '' : value}
          onChange={handleUrlChange}
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={uploading}
        />
        {value && !value.startsWith('data:') && value.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            <span>URL válida</span>
          </div>
        )}
      </div>

      {preview && value.startsWith('data:') && (
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Dica:</strong> Imagem otimizada para web.
            <span className="block mt-1">
              Tamanho: ~{formatFileSize(Math.round((value.length * 3) / 4))}
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

