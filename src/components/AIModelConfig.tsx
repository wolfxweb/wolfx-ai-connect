import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Sparkles, Loader2, Plus, Trash2, Edit2, Save, X, AlertCircle, CheckCircle2, Brain, Settings, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { getAIConfigs, createAIConfig, updateAIConfig, deleteAIConfig, getAvailableModels, AIConfig } from '@/lib/aiConfig'
import { useAuth } from '@/contexts/AuthContext'

export default function AIModelConfig() {
  const { user } = useAuth()
  const [configs, setConfigs] = useState<AIConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null)
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<AIConfig | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showNewConfigForm, setShowNewConfigForm] = useState(false)

  // Função para obter prompt padrão baseado no provider
  const getDefaultSystemPrompt = (provider: 'openai' | 'perplexity' | 'image'): string => {
    if (provider === 'openai') {
      return `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital com anos de experiência.
            Sua missão é criar conteúdo de alta qualidade, otimizado para SEO, bem estruturado, interessante e valioso para o leitor.
            IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido no formato especificado abaixo, sem nenhum texto adicional, sem explicações, sem markdown code blocks.
            O JSON deve começar diretamente com { e terminar com }.`
    } else if (provider === 'perplexity') {
      return `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital com acesso a informações atualizadas da internet.
            Sua tarefa é criar conteúdo de alta qualidade, otimizado para SEO, bem estruturado, interessante e baseado em informações recentes e relevantes.
            IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido, sem nenhum texto adicional, sem markdown code blocks, sem explicações, sem comentários.
            Use informações atualizadas e relevantes da internet quando disponíveis para enriquecer o conteúdo.
            O formato da resposta deve ser um objeto JSON válido, começando diretamente com { e terminando com }.`
    } else {
      // Provider de imagem não usa system_prompt
      return ''
    }
  }

  const getDefaultUserPromptTemplate = (provider: 'openai' | 'perplexity' | 'image'): string => {
    const codeBlockNote = provider === 'perplexity' 
      ? 'NÃO inclua markdown code blocks (```json ou ```), NÃO inclua texto antes ou depois do JSON.'
      : ''
    
    if (provider === 'openai') {
      return `Crie um post de blog completo e profissional em {language} sobre o tema: "{theme}"
{category}

INSTRUÇÕES DETALHADAS:
- Tono de escrita: {tone}
- Tamanho do conteúdo: {length}
- Otimizado para SEO (use palavras-chave estrategicamente, mas de forma natural)
- Bem estruturado com títulos H2 (##) e H3 (###) quando necessário
- Conteúdo interessante, útil, atualizado e valioso para o leitor
- Use listas, parágrafos e formatação Markdown apropriadamente
- Inclua informações práticas e acionáveis quando relevante

FORMATO DE RESPOSTA (JSON válido apenas):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO e atraente)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres, que desperte interesse)",
  "content": "Conteúdo completo do post em Markdown, com títulos (## para H2, ### para H3), listas, parágrafos bem formatados, e formatação adequada",
  "seo_title": "Título otimizado para SEO (50-60 caracteres, incluindo palavras-chave principais)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres, que resuma o conteúdo e inclua call-to-action)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
    } else if (provider === 'perplexity') {
      return `Crie um post de blog completo e profissional em {language} sobre o tema: "{theme}"
{category}

INSTRUÇÕES DETALHADAS:
- Tono de escrita: {tone}
- Tamanho do conteúdo: {length}
- Otimizado para SEO (use palavras-chave estrategicamente, mas de forma natural)
- Bem estruturado com títulos H2 (##) e H3 (###) quando necessário
- Conteúdo interessante, útil, atualizado e valioso para o leitor
- Use informações recentes e relevantes da internet para enriquecer o conteúdo
- Use listas, parágrafos e formatação Markdown apropriadamente
- Inclua informações práticas e acionáveis quando relevante

IMPORTANTE: Responda APENAS com um objeto JSON válido. ${codeBlockNote} Comece diretamente com { e termine com }.

FORMATO DE RESPOSTA (JSON válido apenas):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO e atraente)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres, que desperte interesse)",
  "content": "Conteúdo completo do post em Markdown, com títulos (## para H2, ### para H3), listas, parágrafos bem formatados, e formatação adequada",
  "seo_title": "Título otimizado para SEO (50-60 caracteres, incluindo palavras-chave principais)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres, que resuma o conteúdo e inclua call-to-action)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
    } else {
      // Provider de imagem - template de prompt para geração de imagem
      return `Crie uma imagem profissional e atraente para um post de blog sobre: "{title}". 
{excerpt}
{category}

A imagem deve ser:
- Profissional e moderna
- Visualmente atraente e chamativa
- Relacionada ao tema do post
- Adequada para uso em blog (formato horizontal, estilo editorial)
- Sem texto ou logos sobrepostos
- Estilo realista ou ilustração profissional
- Paleta de cores harmoniosa e profissional`
    }
  }

  const getDefaultImagePromptTemplate = (): string => {
    return `Crie uma imagem profissional e atraente para um post de blog sobre: "{title}". 
{excerpt}
{category}

A imagem deve ser:
- Profissional e moderna
- Visualmente atraente e chamativa
- Relacionada ao tema do post
- Adequada para uso em blog (formato horizontal, estilo editorial)
- Sem texto ou logos sobrepostos
- Estilo realista ou ilustração profissional
- Paleta de cores harmoniosa e profissional`
  }

  // Form state para nova configuração
  const [newConfig, setNewConfig] = useState<Partial<AIConfig>>({
    provider: 'openai',
    name: '',
    api_key: '',
    model: 'gpt-5', // GPT-5 como padrão
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.9,
    verbosity: 'medium', // Parâmetro específico do GPT-5
    reasoning_effort: 'medium', // Parâmetro específico do GPT-5
    system_prompt: '',
    user_prompt_template: '',
    enabled: true,
    is_default: false
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  // Atualizar prompts padrão quando o formulário for aberto pela primeira vez
  useEffect(() => {
    if (showNewConfigForm && newConfig.provider) {
      const provider = newConfig.provider as 'openai' | 'perplexity' | 'image'
      const isImage = provider === 'image'
      
      // Só preencher se estiverem vazios (primeira vez)
      // Para imagem, não preencher system_prompt e user_prompt_template
      if (!isImage && (!newConfig.system_prompt || !newConfig.user_prompt_template)) {
        setNewConfig(prev => ({
          ...prev,
          system_prompt: prev.system_prompt || getDefaultSystemPrompt(provider),
          user_prompt_template: prev.user_prompt_template || getDefaultUserPromptTemplate(provider)
        }))
      } else if (isImage && !newConfig.image_prompt_template) {
        // Para imagem, preencher apenas o template de prompt de imagem
        setNewConfig(prev => ({
          ...prev,
          image_prompt_template: prev.image_prompt_template || getDefaultImagePromptTemplate()
        }))
      }
    }
  }, [showNewConfigForm])

  const fetchConfigs = async () => {
    setLoading(true)
    try {
      const allConfigs = await getAIConfigs()
      setConfigs(allConfigs)
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConfig = async () => {
    if (!newConfig.name || !newConfig.api_key || !newConfig.model) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado')
      return
    }

    setSaving(true)
    try {
      const provider = newConfig.provider as 'openai' | 'perplexity' | 'image'
      const isImage = provider === 'image'
      const isGPT5 = !isImage && (newConfig.model?.startsWith('gpt-5') || newConfig.model === 'o1' || newConfig.model === 'o1-preview' || newConfig.model === 'o1-mini')
      
      await createAIConfig({
        provider: provider,
        name: newConfig.name,
        api_key: newConfig.api_key,
        model: newConfig.model,
        // Campos específicos para texto (OpenAI e Perplexity)
        temperature: isImage ? undefined : (newConfig.temperature || 0.7),
        max_tokens: isImage ? undefined : (newConfig.max_tokens || 2000),
        top_p: isImage ? undefined : newConfig.top_p,
        verbosity: isGPT5 ? (newConfig.verbosity || 'medium') : undefined,
        reasoning_effort: isGPT5 ? (newConfig.reasoning_effort || 'medium') : undefined,
        // Campos específicos para imagem
        image_size: isImage ? (newConfig.image_size || '1024x1024') : undefined,
        image_quality: isImage ? (newConfig.image_quality || 'standard') : undefined,
        image_prompt_template: isImage ? (newConfig.image_prompt_template || getDefaultImagePromptTemplate()) : undefined,
        // Prompts (apenas para texto, não para imagem)
        system_prompt: isImage ? '' : (newConfig.system_prompt || getDefaultSystemPrompt(provider)),
        user_prompt_template: isImage ? '' : (newConfig.user_prompt_template || getDefaultUserPromptTemplate(provider)),
        enabled: newConfig.enabled ?? true,
        is_default: newConfig.is_default ?? false,
        created_by: user.id
      })
      
      toast.success('Configuração criada com sucesso!')
      setShowNewConfigForm(false)
      setNewConfig({
        provider: 'openai',
        name: '',
        api_key: '',
        model: 'gpt-5',
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        verbosity: 'medium',
        reasoning_effort: 'medium',
        system_prompt: '',
        user_prompt_template: '',
        enabled: true,
        is_default: false
      })
      fetchConfigs()
    } catch (error: any) {
      console.error('Erro ao criar configuração:', error)
      toast.error(error.message || 'Erro ao criar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateConfig = async (id: string, updates: Partial<AIConfig>) => {
    setSaving(true)
    try {
      await updateAIConfig(id, updates)
      toast.success('Configuração atualizada com sucesso!')
      setEditingConfig(null)
      fetchConfigs()
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error(error.message || 'Erro ao atualizar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (config: AIConfig) => {
    setConfigToDelete(config)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!configToDelete) return

    setDeleting(true)
    try {
      await deleteAIConfig(configToDelete.id)
      toast.success('Configuração deletada com sucesso!')
      setDeleteDialogOpen(false)
      setConfigToDelete(null)
      fetchConfigs()
    } catch (error: any) {
      console.error('Erro ao deletar configuração:', error)
      toast.error(error.message || 'Erro ao deletar configuração')
    } finally {
      setDeleting(false)
    }
  }

  const toggleApiKeyVisibility = (configId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 8) return key
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const handleToggleEnabled = async (config: AIConfig) => {
    await handleUpdateConfig(config.id, { enabled: !config.enabled })
  }

  const handleToggleDefault = async (config: AIConfig) => {
    await handleUpdateConfig(config.id, { is_default: !config.is_default })
  }

  const availableModels = getAvailableModels(newConfig.provider as 'openai' | 'perplexity' | 'image')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Modelos de IA</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações de modelos de IA e tokens de API
          </p>
        </div>
        <Button
          onClick={() => setShowNewConfigForm(!showNewConfigForm)}
          disabled={showNewConfigForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {/* Formulário de Nova Configuração */}
      {showNewConfigForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nova Configuração de IA</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewConfigForm(false)
                  setNewConfig({
                    provider: 'openai',
                    name: '',
                    api_key: '',
                    model: 'gpt-5',
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.9,
                    verbosity: 'medium',
                    reasoning_effort: 'medium',
                    system_prompt: '',
                    user_prompt_template: '',
                    enabled: true,
                    is_default: false
                  })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor *</Label>
                <Select
                  value={newConfig.provider}
                  onValueChange={(value: 'openai' | 'perplexity' | 'image') => {
                    // Se os prompts estiverem vazios ou forem os padrão do provider anterior, atualizar
                    const currentPromptIsDefault = !newConfig.system_prompt || 
                      newConfig.system_prompt === getDefaultSystemPrompt(newConfig.provider as 'openai' | 'perplexity' | 'image')
                    
                    let newModel = 'gpt-5'
                    if (value === 'perplexity') {
                      newModel = 'sonar-pro'
                    } else if (value === 'image') {
                      newModel = 'dall-e-3'
                    }
                    
                    const isGPT5 = newModel.startsWith('gpt-5') || newModel === 'o1' || newModel === 'o1-preview' || newModel === 'o1-mini'
                    const isImage = value === 'image'
                    
                    setNewConfig({
                      ...newConfig,
                      provider: value,
                      model: newModel,
                      // Definir parâmetros GPT-5 se for GPT-5
                      verbosity: isGPT5 ? (newConfig.verbosity || 'medium') : undefined,
                      reasoning_effort: isGPT5 ? (newConfig.reasoning_effort || 'medium') : undefined,
                      // Configurações de imagem
                      image_size: isImage ? (newConfig.image_size || '1024x1024') : undefined,
                      image_quality: isImage ? (newConfig.image_quality || 'standard') : undefined,
                      image_prompt_template: isImage ? (newConfig.image_prompt_template || getDefaultImagePromptTemplate()) : undefined,
                      // Só atualiza os prompts se estiverem vazios ou forem os padrão (não para imagem)
                      system_prompt: !isImage && currentPromptIsDefault ? getDefaultSystemPrompt(value) : (newConfig.system_prompt || ''),
                      user_prompt_template: !isImage && currentPromptIsDefault ? getDefaultUserPromptTemplate(value) : (isImage ? getDefaultImagePromptTemplate() : (newConfig.user_prompt_template || '')),
                      // Limpar campos não relevantes
                      temperature: isImage ? undefined : (newConfig.temperature || 0.7),
                      max_tokens: isImage ? undefined : (newConfig.max_tokens || 2000),
                      top_p: isImage ? undefined : (newConfig.top_p || 0.9)
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4" />
                        <span>OpenAI (ChatGPT)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="perplexity">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4" />
                        <span>Perplexity AI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Geração de Imagens (DALL-E)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Configuração *</Label>
                <Input
                  id="name"
                  value={newConfig.name}
                  onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                  placeholder="ex: OpenAI Principal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">Chave de API *</Label>
              <div className="flex space-x-2">
                <Input
                  id="api_key"
                  type={showApiKey['new'] ? 'text' : 'password'}
                  value={newConfig.api_key}
                  onChange={(e) => setNewConfig({ ...newConfig, api_key: e.target.value })}
                  placeholder={newConfig.provider === 'openai' ? 'sk-...' : 'pplx-...'}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey({ ...showApiKey, new: !showApiKey['new'] })}
                >
                  {showApiKey['new'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Select
                  value={newConfig.model}
                  onValueChange={(value) => setNewConfig({ ...newConfig, model: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campos de texto apenas para providers de texto */}
              {newConfig.provider !== 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={newConfig.temperature}
                    onChange={(e) => setNewConfig({ ...newConfig, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {/* Campos de texto apenas para providers de texto */}
            {newConfig.provider !== 'image' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    min="100"
                    max="4000"
                    step="100"
                    value={newConfig.max_tokens}
                    onChange={(e) => setNewConfig({ ...newConfig, max_tokens: parseInt(e.target.value) })}
                  />
                </div>

                {newConfig.provider === 'perplexity' && (
                  <div className="space-y-2">
                    <Label htmlFor="top_p">Top P</Label>
                    <Input
                      id="top_p"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newConfig.top_p}
                      onChange={(e) => setNewConfig({ ...newConfig, top_p: parseFloat(e.target.value) })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Parâmetros específicos do GPT-5 */}
            {(newConfig.model?.startsWith('gpt-5') || newConfig.model === 'o1' || newConfig.model === 'o1-preview' || newConfig.model === 'o1-mini') && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <Label htmlFor="verbosity">Verbosity (GPT-5) *</Label>
                  <Select
                    value={newConfig.verbosity || 'medium'}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewConfig({ ...newConfig, verbosity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Respostas concisas)</SelectItem>
                      <SelectItem value="medium">Medium (Respostas balanceadas)</SelectItem>
                      <SelectItem value="high">High (Respostas detalhadas)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Controla a extensão das respostas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasoning_effort">Reasoning Effort (GPT-5) *</Label>
                  <Select
                    value={newConfig.reasoning_effort || 'medium'}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewConfig({ ...newConfig, reasoning_effort: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Raciocínio rápido)</SelectItem>
                      <SelectItem value="medium">Medium (Raciocínio balanceado)</SelectItem>
                      <SelectItem value="high">High (Raciocínio profundo)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Controla a profundidade do raciocínio
                  </p>
                </div>
              </div>
            )}

            {/* Parâmetros específicos para geração de imagens */}
            {newConfig.provider === 'image' && (
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_size">Tamanho da Imagem *</Label>
                    <Select
                      value={newConfig.image_size || '1024x1024'}
                      onValueChange={(value: '1024x1024' | '1792x1024' | '1024x1792') => 
                        setNewConfig({ ...newConfig, image_size: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">1024x1024 (Quadrado)</SelectItem>
                        <SelectItem value="1792x1024">1792x1024 (Widescreen)</SelectItem>
                        <SelectItem value="1024x1792">1024x1792 (Retrato)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_quality">Qualidade da Imagem *</Label>
                    <Select
                      value={newConfig.image_quality || 'standard'}
                      onValueChange={(value: 'standard' | 'hd') => 
                        setNewConfig({ ...newConfig, image_quality: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (Padrão)</SelectItem>
                        <SelectItem value="hd">HD (Alta qualidade - mais caro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_prompt_template">Template do Prompt de Imagem</Label>
                  <Textarea
                    id="image_prompt_template"
                    value={newConfig.image_prompt_template || ''}
                    onChange={(e) => setNewConfig({ ...newConfig, image_prompt_template: e.target.value })}
                    placeholder="Template do prompt para geração de imagem. Use {title}, {excerpt}, {category}, {content} como variáveis."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variáveis disponíveis: {'{title}'}, {'{excerpt}'}, {'{category}'}, {'{content}'}
                  </p>
                </div>
              </div>
            )}

            {/* Campos de prompt apenas para providers de texto */}
            {newConfig.provider !== 'image' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="system_prompt">Prompt do Sistema</Label>
                  <Textarea
                    id="system_prompt"
                    value={newConfig.system_prompt || ''}
                    onChange={(e) => setNewConfig({ ...newConfig, system_prompt: e.target.value })}
                    placeholder="Prompt do sistema que define o comportamento do modelo"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define o comportamento do modelo. Use o prompt padrão como referência.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_prompt_template">Template do Prompt do Usuário</Label>
                  <Textarea
                    id="user_prompt_template"
                    value={newConfig.user_prompt_template || ''}
                    onChange={(e) => setNewConfig({ ...newConfig, user_prompt_template: e.target.value })}
                    placeholder="Template do prompt do usuário (use {theme}, {category}, {tone}, {length}, {language} como variáveis)"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Template do prompt. Variáveis disponíveis: {'{theme}'}, {'{category}'}, {'{tone}'}, {'{length}'}, {'{language}'}
                  </p>
                </div>
              </>
            )}

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={newConfig.enabled}
                  onCheckedChange={(checked) => setNewConfig({ ...newConfig, enabled: checked })}
                />
                <Label htmlFor="enabled" className="cursor-pointer">
                  Habilitado
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_default"
                  checked={newConfig.is_default}
                  onCheckedChange={(checked) => setNewConfig({ ...newConfig, is_default: checked })}
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Configuração Padrão
                </Label>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleCreateConfig}
                disabled={saving || !newConfig.name || !newConfig.api_key || !newConfig.model}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configuração
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewConfigForm(false)
                  setNewConfig({
                    provider: 'openai',
                    name: '',
                    api_key: '',
                    model: 'gpt-5',
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.9,
                    verbosity: 'medium',
                    reasoning_effort: 'medium',
                    system_prompt: '',
                    user_prompt_template: '',
                    enabled: true,
                    is_default: false
                  })
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Configurações */}
      <div className="space-y-4">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma configuração encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie uma nova configuração de IA para começar a gerar conteúdo
              </p>
              <Button onClick={() => setShowNewConfigForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Configuração
              </Button>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {config.provider === 'openai' ? (
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    ) : config.provider === 'perplexity' ? (
                      <Brain className="h-5 w-5 text-purple-600" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                    )}
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{config.name}</span>
                        {config.is_default && (
                          <Badge variant="default">Padrão</Badge>
                        )}
                        {config.enabled ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {config.provider === 'openai' 
                          ? 'OpenAI (ChatGPT)' 
                          : config.provider === 'perplexity'
                          ? 'Perplexity AI'
                          : 'Geração de Imagens (DALL-E)'} - {config.model}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingConfig?.id === config.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Salvar alterações
                            handleUpdateConfig(config.id, editingConfig)
                          }}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConfig(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConfig(config)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(config)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingConfig?.id === config.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={editingConfig.name}
                          onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Select
                          value={editingConfig.model}
                          onValueChange={(value) => {
                            const isGPT5 = value.startsWith('gpt-5') || value === 'o1' || value === 'o1-preview' || value === 'o1-mini'
                            setEditingConfig({ 
                              ...editingConfig, 
                              model: value,
                              // Definir valores padrão para GPT-5
                              verbosity: isGPT5 ? (editingConfig.verbosity || 'medium') : undefined,
                              reasoning_effort: isGPT5 ? (editingConfig.reasoning_effort || 'medium') : undefined
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableModels(config.provider).map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Chave de API</Label>
                      <div className="flex space-x-2">
                        <Input
                          type={showApiKey[config.id] ? 'text' : 'password'}
                          value={editingConfig.api_key}
                          onChange={(e) => setEditingConfig({ ...editingConfig, api_key: e.target.value })}
                          placeholder="Altere apenas se necessário"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleApiKeyVisibility(config.id)}
                        >
                          {showApiKey[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Parâmetros específicos do GPT-5 */}
                    {(editingConfig.model?.startsWith('gpt-5') || editingConfig.model === 'o1' || editingConfig.model === 'o1-preview' || editingConfig.model === 'o1-mini') && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-2">
                          <Label>Verbosity (GPT-5) *</Label>
                          <Select
                            value={editingConfig.verbosity || 'medium'}
                            onValueChange={(value: 'low' | 'medium' | 'high') => 
                              setEditingConfig({ ...editingConfig, verbosity: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Respostas concisas)</SelectItem>
                              <SelectItem value="medium">Medium (Respostas balanceadas)</SelectItem>
                              <SelectItem value="high">High (Respostas detalhadas)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Controla a extensão das respostas
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Reasoning Effort (GPT-5) *</Label>
                          <Select
                            value={editingConfig.reasoning_effort || 'medium'}
                            onValueChange={(value: 'low' | 'medium' | 'high') => 
                              setEditingConfig({ ...editingConfig, reasoning_effort: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Raciocínio rápido)</SelectItem>
                              <SelectItem value="medium">Medium (Raciocínio balanceado)</SelectItem>
                              <SelectItem value="high">High (Raciocínio profundo)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Controla a profundidade do raciocínio
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Parâmetros específicos para geração de imagens */}
                    {config.provider === 'image' && (
                      <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tamanho da Imagem *</Label>
                            <Select
                              value={editingConfig.image_size || '1024x1024'}
                              onValueChange={(value: '1024x1024' | '1792x1024' | '1024x1792') => 
                                setEditingConfig({ ...editingConfig, image_size: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1024x1024">1024x1024 (Quadrado)</SelectItem>
                                <SelectItem value="1792x1024">1792x1024 (Widescreen)</SelectItem>
                                <SelectItem value="1024x1792">1024x1792 (Retrato)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Qualidade da Imagem *</Label>
                            <Select
                              value={editingConfig.image_quality || 'standard'}
                              onValueChange={(value: 'standard' | 'hd') => 
                                setEditingConfig({ ...editingConfig, image_quality: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard (Padrão)</SelectItem>
                                <SelectItem value="hd">HD (Alta qualidade - mais caro)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Template do Prompt de Imagem</Label>
                          <Textarea
                            value={editingConfig.image_prompt_template || ''}
                            onChange={(e) => setEditingConfig({ ...editingConfig, image_prompt_template: e.target.value })}
                            placeholder="Template do prompt para geração de imagem. Use {title}, {excerpt}, {category}, {content} como variáveis."
                            rows={6}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Variáveis disponíveis: {'{title}'}, {'{excerpt}'}, {'{category}'}, {'{content}'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Parâmetros padrão (temperature, max_tokens, top_p) - apenas para providers de texto */}
                    {config.provider !== 'image' && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Temperature</Label>
                          <Input
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={editingConfig.temperature}
                            onChange={(e) => setEditingConfig({ ...editingConfig, temperature: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Tokens</Label>
                          <Input
                            type="number"
                            min="100"
                            max="4000"
                            step="100"
                            value={editingConfig.max_tokens}
                            onChange={(e) => setEditingConfig({ ...editingConfig, max_tokens: parseInt(e.target.value) })}
                          />
                        </div>
                        {config.provider === 'perplexity' && (
                          <div className="space-y-2">
                            <Label>Top P</Label>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={editingConfig.top_p}
                              onChange={(e) => setEditingConfig({ ...editingConfig, top_p: parseFloat(e.target.value) })}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Parâmetros específicos do GPT-5 */}
                    {(editingConfig.model?.startsWith('gpt-5') || editingConfig.model === 'o1' || editingConfig.model === 'o1-preview' || editingConfig.model === 'o1-mini') && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-2">
                          <Label>Verbosity (GPT-5)</Label>
                          <Select
                            value={editingConfig.verbosity || 'medium'}
                            onValueChange={(value: 'low' | 'medium' | 'high') => 
                              setEditingConfig({ ...editingConfig, verbosity: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Respostas concisas)</SelectItem>
                              <SelectItem value="medium">Medium (Respostas balanceadas)</SelectItem>
                              <SelectItem value="high">High (Respostas detalhadas)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Reasoning Effort (GPT-5)</Label>
                          <Select
                            value={editingConfig.reasoning_effort || 'medium'}
                            onValueChange={(value: 'low' | 'medium' | 'high') => 
                              setEditingConfig({ ...editingConfig, reasoning_effort: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Raciocínio rápido)</SelectItem>
                              <SelectItem value="medium">Medium (Raciocínio balanceado)</SelectItem>
                              <SelectItem value="high">High (Raciocínio profundo)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Prompt do Sistema</Label>
                      <Textarea
                        value={editingConfig.system_prompt || ''}
                        onChange={(e) => setEditingConfig({ ...editingConfig, system_prompt: e.target.value })}
                        placeholder="Prompt do sistema que define o comportamento do modelo"
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Template do Prompt do Usuário</Label>
                      <Textarea
                        value={editingConfig.user_prompt_template || ''}
                        onChange={(e) => setEditingConfig({ ...editingConfig, user_prompt_template: e.target.value })}
                        placeholder="Template do prompt do usuário (use {theme}, {category}, {tone}, {length}, {language} como variáveis)"
                        rows={10}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Variáveis disponíveis: {'{theme}'}, {'{category}'}, {'{tone}'}, {'{length}'}, {'{language}'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingConfig.enabled}
                          onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, enabled: checked })}
                        />
                        <Label className="cursor-pointer">Habilitado</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingConfig.is_default}
                          onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, is_default: checked })}
                        />
                        <Label className="cursor-pointer">Configuração Padrão</Label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Chave de API:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showApiKey[config.id] ? config.api_key : maskApiKey(config.api_key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(config.id)}
                          >
                            {showApiKey[config.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Modelo:</span>
                        <p className="mt-1">{config.model}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Temperature:</span>
                        <p className="mt-1">{config.temperature || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Max Tokens:</span>
                        <p className="mt-1">{config.max_tokens || 'N/A'}</p>
                      </div>
                      {config.provider === 'perplexity' && config.top_p && (
                        <div>
                          <span className="font-medium text-muted-foreground">Top P:</span>
                          <p className="mt-1">{config.top_p}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => handleToggleEnabled(config)}
                        />
                        <Label className="cursor-pointer text-sm">
                          {config.enabled ? 'Habilitado' : 'Desabilitado'}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.is_default}
                          onCheckedChange={() => handleToggleDefault(config)}
                        />
                        <Label className="cursor-pointer text-sm">
                          {config.is_default ? 'Padrão' : 'Não Padrão'}
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Configuração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a configuração <strong>"{configToDelete?.name}"</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Esta ação não pode ser desfeita. A configuração será removida permanentemente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

