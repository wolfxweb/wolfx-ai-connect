import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, ArrowLeft, Copy, CheckCircle2, Loader2, AlertCircle, FileText, Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import ContentGenerator from '@/components/ContentGenerator'
import AIModelConfig from '@/components/AIModelConfig'
import { GeneratedContent } from '@/lib/chatgpt'
import { supabase, Category } from '@/lib/supabase'

export default function AIContent() {
  const { user, canAccessAdmin } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleContentGenerated = (content: GeneratedContent) => {
    setGeneratedContent(content)
    toast.success('Conteúdo gerado com sucesso!')
  }

  const handleUseInEditor = () => {
    if (!generatedContent) return

    // Salvar conteúdo gerado no localStorage para usar no editor
    localStorage.setItem('aiGeneratedContent', JSON.stringify(generatedContent))
    
    // Navegar para o editor de posts
    navigate('/admin/posts/new')
    toast.success('Conteúdo salvo! Redirecionando para o editor...')
  }

  const handleCopyContent = (field: keyof GeneratedContent) => {
    if (!generatedContent) return

    const content = generatedContent[field]
    let textToCopy = ''

    if (Array.isArray(content)) {
      textToCopy = content.join(', ')
    } else {
      textToCopy = content || ''
    }

    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success(`${field === 'title' ? 'Título' : field === 'excerpt' ? 'Resumo' : field === 'content' ? 'Conteúdo' : field === 'seo_title' ? 'SEO Title' : field === 'seo_description' ? 'SEO Description' : field === 'seo_keywords' ? 'SEO Keywords' : 'Tags'} copiado!`)
    
    setTimeout(() => setCopied(false), 2000)
  }

  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Acesso Negado</h2>
            <p className="text-red-600 mb-4">
              Você não tem permissão para acessar esta área.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Conteúdo com IA</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                IA
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Gerador & Preview</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Gerador & Preview */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Gerador de Conteúdo */}
              <div>
                <ContentGenerator
                  onContentGenerated={handleContentGenerated}
                  categories={categories}
                />
              </div>

              {/* Preview do Conteúdo Gerado */}
              <div className="space-y-6">
                {generatedContent ? (
                  <>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Conteúdo Gerado</span>
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUseInEditor}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Usar no Editor
                          </Button>
                        </div>
                        <CardDescription>
                          Revise o conteúdo gerado e use no editor de posts
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Título */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Título</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyContent('title')}
                            >
                              {copied ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm border rounded-md p-3 bg-gray-50">
                            {generatedContent.title}
                          </p>
                        </div>

                        {/* Resumo */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Resumo</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyContent('excerpt')}
                            >
                              {copied ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm border rounded-md p-3 bg-gray-50">
                            {generatedContent.excerpt}
                          </p>
                        </div>

                        {/* Conteúdo */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Conteúdo</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyContent('content')}
                            >
                              {copied ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="text-sm border rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans">
                              {generatedContent.content}
                            </pre>
                          </div>
                        </div>

                        {/* SEO */}
                        <div className="space-y-2 pt-4 border-t">
                          <h3 className="text-sm font-semibold">SEO</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-muted-foreground">SEO Title</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyContent('seo_title')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs border rounded-md p-2 bg-gray-50">
                              {generatedContent.seo_title}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-muted-foreground">SEO Description</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyContent('seo_description')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs border rounded-md p-2 bg-gray-50">
                              {generatedContent.seo_description}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-muted-foreground">SEO Keywords</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyContent('seo_keywords')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.seo_keywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-muted-foreground">Tags</label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyContent('tags')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Preview</span>
                      </CardTitle>
                      <CardDescription>
                        O conteúdo gerado aparecerá aqui
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Gere conteúdo usando o formulário ao lado para ver o preview aqui.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="config" className="space-y-6">
            <AIModelConfig />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

