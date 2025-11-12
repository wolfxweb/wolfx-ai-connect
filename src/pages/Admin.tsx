import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Users, 
  FileText, 
  FolderOpen, 
  Plus,
  LogOut,
  BarChart3,
  Calendar,
  MessageCircle,
  Sparkles,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// Componentes que serão implementados
import CategoryManagement from '@/components/admin/CategoryManagement'
import BlogManagement from '@/components/admin/BlogManagement'
import UserManagement from '@/components/admin/UserManagement'
import CommentModeration from '@/components/admin/CommentModeration'
import ContentGenerator from '@/components/ContentGenerator'
import AIModelConfig from '@/components/AIModelConfig'
import { supabase, Category } from '@/lib/supabase'
import { GeneratedContent } from '@/lib/chatgpt'

export default function Admin() {
  const { user, signOut, canAccessAdmin, userProfile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent & { featured_image?: string } | null>(null)

  // Carregar categorias quando a aba de IA for aberta
  useEffect(() => {
    if (activeTab === 'ai-content') {
      fetchCategories()
    }
  }, [activeTab])

  const fetchCategories = async () => {
    setLoadingCategories(true)
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
      setLoadingCategories(false)
    }
  }

  const handleContentGenerated = (content: GeneratedContent & { featured_image?: string }) => {
    setGeneratedContent(content)
    toast.success('Conteúdo gerado com sucesso!')
  }

  const handleAutoSave = (postId: string) => {
    toast.success(`Post salvo como rascunho! ID: ${postId}`)
    // Opcional: navegar para a aba de posts para ver o post criado
    // Ou manter na aba atual e apenas mostrar mensagem de sucesso
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Settings className="h-16 w-16 text-red-500 mb-4" />
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

  const DashboardContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            +2 desde o mês passado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorias</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">
            +1 nova categoria
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">28</div>
          <p className="text-xs text-muted-foreground">
            +5 novos usuários
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Posts Publicados</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">
            4 em rascunho
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">
                  Bem-vindo, {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Admin
              </Badge>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="ai-content" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Conteúdo com IA</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Posts</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Comentários</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Visão geral do seu sistema de blog
              </p>
            </div>
            <DashboardContent />
          </TabsContent>

          <TabsContent value="ai-content" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Conteúdo com IA</h2>
            </div>
            
            {loadingCategories ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
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
                        onAutoSave={handleAutoSave}
                      />
                    </div>

                    {/* Preview do Conteúdo Gerado */}
                    <div className="space-y-6">
                      {generatedContent ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <FileText className="h-5 w-5" />
                              <span>Conteúdo Gerado</span>
                            </CardTitle>
                            <CardDescription>
                              Revise o conteúdo gerado e use no editor de posts
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Imagem de Destaque */}
                            {generatedContent.featured_image && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center space-x-2">
                                  <ImageIcon className="h-4 w-4" />
                                  <span>Imagem de Destaque</span>
                                </label>
                                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden border">
                                  <img
                                    src={generatedContent.featured_image}
                                    alt={generatedContent.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Imagem gerada com IA
                                </p>
                              </div>
                            )}

                            {/* Título */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Título</label>
                              <p className="text-sm border rounded-md p-3 bg-gray-50">
                                {generatedContent.title}
                              </p>
                            </div>

                            {/* Resumo */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Resumo</label>
                              <p className="text-sm border rounded-md p-3 bg-gray-50">
                                {generatedContent.excerpt}
                              </p>
                            </div>

                            {/* Conteúdo */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Conteúdo</label>
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
                                <label className="text-xs text-muted-foreground">SEO Title</label>
                                <p className="text-xs border rounded-md p-2 bg-gray-50">
                                  {generatedContent.seo_title}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">SEO Description</label>
                                <p className="text-xs border rounded-md p-2 bg-gray-50">
                                  {generatedContent.seo_description}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">SEO Keywords</label>
                                <div className="flex flex-wrap gap-2">
                                  {generatedContent.seo_keywords.map((keyword, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs text-muted-foreground">Tags</label>
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
                            <p className="text-sm text-muted-foreground">
                              Gere conteúdo usando o formulário ao lado para ver o preview aqui.
                            </p>
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
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Gerenciar Posts</h2>
              <p className="text-muted-foreground">
                Crie e edite posts do seu blog
              </p>
            </div>
            <BlogManagement />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <CommentModeration />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Gerenciar Categorias</h2>
                <p className="text-muted-foreground">
                  Organize seus posts em categorias
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h2>
              <p className="text-muted-foreground">
                Controle de usuários e permissões
              </p>
            </div>
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

