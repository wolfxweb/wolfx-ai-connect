import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Wand2, Calendar, AlertCircle, CheckCircle2, Brain, Image as ImageIcon, Save } from 'lucide-react'
import { toast } from 'sonner'
import { generatePostContent, suggestThemes, isChatGPTConfigured, ContentGenerationOptions, GeneratedContent } from '@/lib/chatgpt'
import { generatePostContentWithPerplexity, suggestThemesWithPerplexity, isPerplexityConfigured } from '@/lib/perplexity'
import { Category } from '@/lib/supabase'
import { autoSavePostAsDraft } from '@/lib/postAutoSave'
import { useAuth } from '@/contexts/AuthContext'
import { Switch } from '@/components/ui/switch'
import { generateImageWithDALL_E } from '@/lib/imageGenerator'

interface ContentGeneratorProps {
  onContentGenerated: (content: GeneratedContent) => void
  onCategoryChange?: (categoryId: string) => void
  categories: Category[]
  selectedCategory?: string
  onAutoSave?: (postId: string) => void // Callback quando post for salvo automaticamente
}

export default function ContentGenerator({
  onContentGenerated,
  onCategoryChange,
  categories,
  selectedCategory,
  onAutoSave
}: ContentGeneratorProps) {
  const { user } = useAuth()
  const [theme, setTheme] = useState('')
  const [suggestedThemes, setSuggestedThemes] = useState<string[]>([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [savingPost, setSavingPost] = useState(false)
  const [tone, setTone] = useState<'formal' | 'informal' | 'professional' | 'casual'>('professional')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [scheduledGeneration, setScheduledGeneration] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [categoryId, setCategoryId] = useState(selectedCategory || '')
  const [configured, setConfigured] = useState(false)
  const [aiProvider, setAiProvider] = useState<'chatgpt' | 'perplexity'>('chatgpt')
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true) // Salvar automaticamente por padrão

  useEffect(() => {
    // Verificar qual provider está configurado
    const chatgptConfigured = isChatGPTConfigured()
    const perplexityConfigured = isPerplexityConfigured()
    
    // Selecionar o primeiro disponível, ou ChatGPT por padrão
    if (chatgptConfigured) {
      setAiProvider('chatgpt')
      setConfigured(true)
    } else if (perplexityConfigured) {
      setAiProvider('perplexity')
      setConfigured(true)
    } else {
      setConfigured(false)
    }
    
    if (selectedCategory) {
      setCategoryId(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadSuggestedThemes()
  }, [categoryId, aiProvider])

  const loadSuggestedThemes = async () => {
    setLoadingThemes(true)
    try {
      const category = categories.find(c => c.id === categoryId)
      const themes = aiProvider === 'perplexity'
        ? await suggestThemesWithPerplexity(category?.name)
        : await suggestThemes(category?.name)
      setSuggestedThemes(themes)
    } catch (error: any) {
      console.error('Erro ao carregar temas:', error)
      toast.error('Erro ao carregar sugestões de temas')
    } finally {
      setLoadingThemes(false)
    }
  }

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme)
  }

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error('Por favor, insira ou selecione um tema')
      return
    }

    if (!configured) {
      const errorMsg = aiProvider === 'perplexity'
        ? 'Perplexity não está configurado. Configure VITE_PERPLEXITY_API_KEY no arquivo .env'
        : 'ChatGPT não está configurado. Configure VITE_OPENAI_API_KEY no arquivo .env'
      toast.error(errorMsg)
      return
    }

    if (!categoryId) {
      toast.error('Por favor, selecione uma categoria')
      return
    }

    if (autoSaveEnabled && !user?.id) {
      toast.error('Você precisa estar logado para salvar posts automaticamente')
      return
    }

    setGenerating(true)
    setGeneratingImage(false)
    setSavingPost(false)

    try {
      const category = categories.find(c => c.id === categoryId)
      const options: ContentGenerationOptions = {
        theme: theme.trim(),
        category: category?.name || '',
        tone,
        length,
        language: 'pt-BR'
      }

      // Gerar conteúdo
      const content = aiProvider === 'perplexity'
        ? await generatePostContentWithPerplexity(options)
        : await generatePostContent(options)
      
      onContentGenerated(content)
      toast.success(`Conteúdo gerado com sucesso usando ${aiProvider === 'perplexity' ? 'Perplexity AI' : 'ChatGPT'}!`)

      // Se auto-save estiver habilitado, gerar imagem e salvar post
      if (autoSaveEnabled && user?.id && categoryId) {
        setGeneratingImage(true)
        
        try {
          // Primeiro, gerar a imagem
          let imageDataUrl = ''
          let imageError: string | null = null
          
          try {
            const imageOptions = {
              title: content.title,
              excerpt: content.excerpt,
              content: content.content,
              category: category?.name
            }
            
            console.log('🎨 Gerando imagem para post...')
            const imageResult = await generateImageWithDALL_E(imageOptions)
            
            if (imageResult && imageResult.imageDataUrl) {
              imageDataUrl = imageResult.imageDataUrl
              console.log('✅ Imagem gerada com sucesso, tamanho:', imageDataUrl.length)
            } else {
              console.warn('⚠️ Imagem gerada mas sem dataUrl')
              imageError = 'Imagem gerada mas sem dados'
            }
          } catch (imgError: any) {
            console.error('❌ Erro ao gerar imagem:', imgError)
            imageError = imgError.message || 'Erro desconhecido ao gerar imagem'
            // Continuar sem imagem, mas avisar o usuário
          } finally {
            setGeneratingImage(false)
          }
          
          // Agora salvar o post com a imagem (se foi gerada)
          setSavingPost(true)
          
          try {
            // Criar objeto com imagem incluída (type-safe)
            const contentWithImage: GeneratedContent & { featured_image?: string } = {
              ...content,
              featured_image: imageDataUrl || undefined // Adicionar imagem ao conteúdo
            }
            
            const result = await autoSavePostAsDraft(
              contentWithImage,
              user.id,
              categoryId,
              category?.name,
              false // Não gerar imagem, já foi gerada (ou falhou)
            )
            
            if (imageDataUrl) {
              toast.success(`Post salvo como rascunho com imagem gerada! ID: ${result.postId}`)
            } else if (imageError) {
              toast.warning(`Post salvo como rascunho, mas imagem não foi gerada: ${imageError}`)
            } else {
              toast.success(`Post salvo como rascunho! ID: ${result.postId}`)
            }
            
            // Chamar callback se fornecido
            if (onAutoSave) {
              onAutoSave(result.postId)
            }
          } catch (saveError: any) {
            console.error('❌ Erro ao salvar post:', saveError)
            toast.error(`Erro ao salvar post: ${saveError.message}`)
            throw saveError // Re-throw para que o erro seja tratado no catch externo
          } finally {
            setSavingPost(false)
          }
        } catch (error: any) {
          console.error('❌ Erro no processo de salvamento:', error)
          toast.error(`Erro ao processar post: ${error.message}`)
          setGeneratingImage(false)
          setSavingPost(false)
        }
      }
    } catch (error: any) {
      console.error('Erro ao gerar conteúdo:', error)
      toast.error(error.message || 'Erro ao gerar conteúdo')
    } finally {
      setGenerating(false)
      setGeneratingImage(false)
      setSavingPost(false)
    }
  }

  const handleScheduleGeneration = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Por favor, selecione data e hora para agendamento')
      return
    }

    if (!theme.trim()) {
      toast.error('Por favor, insira ou selecione um tema')
      return
    }

    if (!configured) {
      const errorMsg = aiProvider === 'perplexity'
        ? 'Perplexity não está configurado. Configure VITE_PERPLEXITY_API_KEY no arquivo .env'
        : 'ChatGPT não está configurado. Configure VITE_OPENAI_API_KEY no arquivo .env'
      toast.error(errorMsg)
      return
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      toast.error('A data e hora devem ser futuras')
      return
    }

    // Armazenar agendamento no localStorage
    // Nota: Em produção, isso deveria ser feito no backend com cron jobs
    const scheduledJob = {
      id: `schedule_${Date.now()}`,
      theme: theme.trim(),
      categoryId,
      tone,
      length,
      aiProvider, // Salvar o provider de IA usado
      scheduledDateTime: scheduledDateTime.toISOString(),
      createdAt: now.toISOString()
    }

    try {
      const existingJobs = JSON.parse(localStorage.getItem('scheduledContentJobs') || '[]')
      existingJobs.push(scheduledJob)
      localStorage.setItem('scheduledContentJobs', JSON.stringify(existingJobs))
      
      toast.success(`Geração agendada para ${scheduledDateTime.toLocaleString('pt-BR')}`)
      toast.info('Nota: O agendamento funcionará apenas enquanto a aplicação estiver aberta. Para agendamentos persistentes, use um backend com cron jobs.')
      
      // Configurar timeout para geração agendada
      const delay = scheduledDateTime.getTime() - now.getTime()
      setTimeout(async () => {
        try {
          setGenerating(true)
          const category = categories.find(c => c.id === scheduledJob.categoryId)
          const options: ContentGenerationOptions = {
            theme: scheduledJob.theme,
            category: category?.name || '',
            tone: scheduledJob.tone,
            length: scheduledJob.length,
            language: 'pt-BR'
          }
          const content = scheduledJob.aiProvider === 'perplexity'
            ? await generatePostContentWithPerplexity(options)
            : await generatePostContent(options)
          onContentGenerated(content)
          toast.success(`Conteúdo gerado conforme agendado usando ${scheduledJob.aiProvider === 'perplexity' ? 'Perplexity AI' : 'ChatGPT'}!`)
          
          // Remover job processado
          const updatedJobs = JSON.parse(localStorage.getItem('scheduledContentJobs') || '[]')
          const filteredJobs = updatedJobs.filter((j: any) => j.id !== scheduledJob.id)
          localStorage.setItem('scheduledContentJobs', JSON.stringify(filteredJobs))
        } catch (error: any) {
          console.error('Erro ao gerar conteúdo agendado:', error)
          toast.error(error.message || 'Erro ao gerar conteúdo agendado')
        } finally {
          setGenerating(false)
        }
      }, delay)
    } catch (error) {
      console.error('Erro ao agendar geração:', error)
      toast.error('Erro ao agendar geração')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle>Gerador de Conteúdo com IA</CardTitle>
        </div>
        <CardDescription>
          Gere conteúdo completo para seu post usando inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de Provider de IA */}
        <div className="space-y-2">
          <Label htmlFor="ai-provider">Provedor de IA</Label>
          <Select 
            value={aiProvider} 
            onValueChange={(value: 'chatgpt' | 'perplexity') => {
              setAiProvider(value)
              const newConfigured = value === 'perplexity' 
                ? isPerplexityConfigured() 
                : isChatGPTConfigured()
              setConfigured(newConfigured)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chatgpt" disabled={!isChatGPTConfigured()}>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>ChatGPT (OpenAI)</span>
                  {!isChatGPTConfigured() && <span className="text-xs text-muted-foreground">(não configurado)</span>}
                </div>
              </SelectItem>
              <SelectItem value="perplexity" disabled={!isPerplexityConfigured()}>
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Perplexity AI</span>
                  {!isPerplexityConfigured() && <span className="text-xs text-muted-foreground">(não configurado)</span>}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {aiProvider === 'perplexity' && isPerplexityConfigured() && (
            <p className="text-xs text-muted-foreground">
              Perplexity AI usa informações atualizadas da internet para gerar conteúdo mais preciso e atualizado.
            </p>
          )}
        </div>

        {!configured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {aiProvider === 'perplexity' 
                ? <>Perplexity não está configurado. Configure <code className="text-xs">VITE_PERPLEXITY_API_KEY</code> no arquivo <code className="text-xs">.env</code></>
                : <>ChatGPT não está configurado. Configure <code className="text-xs">VITE_OPENAI_API_KEY</code> no arquivo <code className="text-xs">.env</code></>
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={categoryId} 
            onValueChange={(value) => {
              setCategoryId(value)
              if (onCategoryChange) {
                onCategoryChange(value)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Tema do Post</Label>
          <div className="flex space-x-2">
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Digite o tema ou selecione uma sugestão"
            />
            <Button
              type="button"
              variant="outline"
              onClick={loadSuggestedThemes}
              disabled={loadingThemes}
            >
              {loadingThemes ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {suggestedThemes.length > 0 && (
          <div className="space-y-2">
            <Label>Sugestões de Temas</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedThemes.map((suggestedTheme, index) => (
                <Badge
                  key={index}
                  variant={theme === suggestedTheme ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleThemeSelect(suggestedTheme)}
                >
                  {suggestedTheme}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tono</Label>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="informal">Informal</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Tamanho</Label>
            <Select value={length} onValueChange={(value: any) => setLength(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Curto (300-500 palavras)</SelectItem>
                <SelectItem value="medium">Médio (800-1200 palavras)</SelectItem>
                <SelectItem value="long">Longo (1500-2000 palavras)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opção de salvamento automático */}
        {user && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 flex-1">
              <Switch
                id="auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
              <div className="flex-1">
                <Label htmlFor="auto-save" className="cursor-pointer font-medium text-sm">
                  Salvar automaticamente como rascunho
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gerar imagem e salvar post automaticamente após gerar conteúdo
                </p>
              </div>
            </div>
            {autoSaveEnabled && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 ml-2">
                <ImageIcon className="h-3 w-3" />
                <span>+ Imagem</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="schedule"
              checked={scheduledGeneration}
              onChange={(e) => setScheduledGeneration(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="schedule" className="cursor-pointer">
              Agendar geração de conteúdo
            </Label>
          </div>

          {scheduledGeneration && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Data</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Hora</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-4">
          <Button
            type="button"
            onClick={scheduledGeneration ? handleScheduleGeneration : handleGenerate}
            disabled={generating || generatingImage || savingPost || !theme.trim() || !configured || !categoryId || (autoSaveEnabled && !user?.id)}
            className="flex-1"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando conteúdo...
              </>
            ) : generatingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando imagem...
              </>
            ) : savingPost ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando post...
              </>
            ) : scheduledGeneration ? (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Geração
              </>
            ) : autoSaveEnabled ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Gerar e Salvar
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </div>

        {configured && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-xs">
              O conteúdo gerado incluirá: título, resumo, conteúdo completo, SEO title, meta description, keywords e tags.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

