import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, BlogPost, Category } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Eye, Calendar, Loader2, Bold, Italic, Underline, List, ListOrdered, Quote, Link, Type } from 'lucide-react'
import { toast } from 'sonner'

// Componente de Toolbar para formatação de texto
const TextEditorToolbar = ({ onFormat, selectedText }: { onFormat: (format: string) => void, selectedText: string }) => {
  const formats = [
    { icon: Bold, format: 'bold', label: 'Negrito' },
    { icon: Italic, format: 'italic', label: 'Itálico' },
    { icon: Underline, format: 'underline', label: 'Sublinhado' },
    { icon: List, format: 'bullet', label: 'Lista com marcadores' },
    { icon: ListOrdered, format: 'number', label: 'Lista numerada' },
    { icon: Quote, format: 'quote', label: 'Citação' },
    { icon: Link, format: 'link', label: 'Link' },
    { icon: Type, format: 'heading', label: 'Cabeçalho' }
  ]

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-md">
      {formats.map(({ icon: Icon, format, label }) => (
        <Button
          key={format}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormat(format)}
          title={label}
          className="h-8 w-8 p-0"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}

// Componente de Editor de Texto com Formatação
const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Digite seu conteúdo...",
  rows = 10 
}: { 
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) => {
  const [selectedText, setSelectedText] = useState('')

  const handleFormat = (format: string) => {
    const textarea = document.activeElement as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    if (!selectedText) {
      toast.error('Selecione um texto para formatar')
      return
    }

    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
      case 'bullet':
        formattedText = `- ${selectedText}`
        break
      case 'number':
        formattedText = `1. ${selectedText}`
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        break
      case 'link':
        const url = prompt('Digite a URL do link:')
        if (url) {
          formattedText = `[${selectedText}](${url})`
        } else {
          return
        }
        break
      case 'heading':
        formattedText = `## ${selectedText}`
        break
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Restaurar seleção após formatação
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  return (
    <div className="border rounded-md">
      <TextEditorToolbar onFormat={handleFormat} selectedText={selectedText} />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement
          setSelectedText(target.value.substring(target.selectionStart, target.selectionEnd))
        }}
        placeholder={placeholder}
        rows={rows}
        className="border-0 rounded-t-none focus-visible:ring-0 resize-none"
      />
      <div className="p-2 text-xs text-gray-500 border-t bg-gray-50 rounded-b-md">
        <strong>Dicas de formatação:</strong> Use **negrito**, *itálico*, # para títulos, - para listas, {'>'} para citações
      </div>
    </div>
  )
}

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published' | 'archived' | 'scheduled',
    category_id: '',
    tags: '',
    published_at: '',
    scheduled_at: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    meta_robots: 'index,follow'
  })

  const isEditing = !!id

  useEffect(() => {
    fetchCategories()
    if (isEditing) {
      fetchPost()
    } else {
      setLoading(false)
    }
  }, [id])

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
    }
  }

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        featured_image: data.featured_image || '',
        status: data.status || 'draft',
        category_id: data.category_id || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        published_at: data.published_at || '',
        scheduled_at: data.scheduled_at || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : (data.seo_keywords || ''),
        meta_robots: data.meta_robots || 'index,follow'
      })
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Erro ao carregar post')
      navigate('/admin')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const slug = generateSlug(formData.title)
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      const keywordsArray = formData.seo_keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword)
      
      // Determinar data de publicação baseada no status
      let publishedAt = null
      let scheduledAt = null
      
      if (formData.status === 'published') {
        // Se o post já estava publicado, manter a data original
        // Se é a primeira publicação, usar data atual
        publishedAt = formData.published_at || new Date().toISOString()
      } else if (formData.status === 'scheduled' && formData.scheduled_at) {
        scheduledAt = formData.scheduled_at
      }
      
      if (isEditing) {
        // Atualizar post existente
        const updateData = {
          title: formData.title,
          slug,
          content: formData.content,
          excerpt: formData.excerpt,
          featured_image: formData.featured_image,
          status: formData.status,
          category_id: formData.category_id,
          tags: tagsArray,
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          seo_keywords: keywordsArray,
          meta_robots: formData.meta_robots,
          scheduled_at: scheduledAt,
          updated_at: new Date().toISOString(),
          ...(publishedAt && { published_at: publishedAt })
        }
        
        const { error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', id)

        if (error) throw error
        
        toast.success('Post atualizado com sucesso!')
      } else {
        // Criar novo post
        const { error } = await supabase
          .from('blog_posts')
          .insert([
            {
              title: formData.title,
              slug,
              content: formData.content,
              excerpt: formData.excerpt,
              featured_image: formData.featured_image,
              status: formData.status,
              category_id: formData.category_id,
              author_id: user?.id,
              tags: tagsArray,
              seo_title: formData.seo_title,
              seo_description: formData.seo_description,
              seo_keywords: keywordsArray,
              meta_robots: formData.meta_robots,
              scheduled_at: scheduledAt,
              ...(publishedAt && { published_at: publishedAt })
            }
          ])

        if (error) throw error
        toast.success('Post criado com sucesso!')
      }

      navigate('/admin')
    } catch (error: any) {
      console.error('Error saving post:', error)
      toast.error(error.message || 'Erro ao salvar post')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Editar Post' : 'Novo Post'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Atualize as informações do post' : 'Crie um novo post para seu blog'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                <span>{isEditing ? 'Atualizar' : 'Salvar'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="excerpt">Resumo</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Configure as informações principais do post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Post</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Digite o título do post"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        value={generateSlug(formData.title)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={formData.category_id} 
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
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
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: 'draft' | 'published' | 'archived' | 'scheduled') => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="featured_image">URL da Imagem Destaque</Label>
                    <Input
                      id="featured_image"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="tecnologia, react, javascript"
                    />
                  </div>
                  
                  {formData.status === 'scheduled' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_at">Data e Hora de Publicação</Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <p className="text-xs text-gray-500">
                        O post será publicado automaticamente nesta data e hora
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="excerpt" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Post</CardTitle>
                  <CardDescription>
                    Escreva um resumo atrativo que aparecerá na listagem de posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Resumo do Post</Label>
                    <RichTextEditor
                      value={formData.excerpt}
                      onChange={(value) => setFormData({ ...formData, excerpt: value })}
                      placeholder="Digite um resumo atrativo do seu post..."
                      rows={6}
                    />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Dica:</strong> O resumo aparecerá na listagem de posts e nas redes sociais. 
                      Mantenha-o conciso e atrativo para chamar a atenção dos leitores.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo Principal</CardTitle>
                  <CardDescription>
                    Escreva o conteúdo principal do seu post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="content">Conteúdo Principal</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      placeholder="Digite o conteúdo principal do seu post..."
                      rows={15}
                    />
                  </div>
                  <div className="p-3 bg-green-50 rounded-md mt-4">
                    <p className="text-sm text-green-800">
                      <strong>Dica:</strong> Use a barra de ferramentas para formatar seu texto. 
                      Selecione o texto desejado e clique nos ícones de formatação.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                  <CardDescription>
                    Configure as tags de SEO para otimização nos motores de busca
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo_title">Título SEO</Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="Título otimizado para SEO (máx. 60 caracteres)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500">
                        {formData.seo_title.length}/60 caracteres
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="meta_robots">Meta Robots</Label>
                      <Select 
                        value={formData.meta_robots} 
                        onValueChange={(value) => setFormData({ ...formData, meta_robots: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="index,follow">Indexar e seguir links</SelectItem>
                          <SelectItem value="index,nofollow">Indexar mas não seguir links</SelectItem>
                          <SelectItem value="noindex,follow">Não indexar mas seguir links</SelectItem>
                          <SelectItem value="noindex,nofollow">Não indexar nem seguir links</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo_description">Meta Descrição</Label>
                    <Textarea
                      id="seo_description"
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder="Descrição otimizada para SEO (máx. 160 caracteres)"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.seo_description.length}/160 caracteres
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo_keywords">Palavras-chave SEO</Label>
                    <Input
                      id="seo_keywords"
                      value={formData.seo_keywords}
                      onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                      placeholder="palavra-chave 1, palavra-chave 2, palavra-chave 3"
                    />
                    <p className="text-xs text-gray-500">
                      Separe as palavras-chave por vírgula
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Dicas de SEO:</strong>
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Título SEO deve ser diferente do título do post</li>
                      <li>• Meta descrição deve ser atrativa e conter palavras-chave</li>
                      <li>• Use palavras-chave relevantes e específicas</li>
                      <li>• Mantenha títulos SEO com até 60 caracteres</li>
                      <li>• Meta descrições devem ter até 160 caracteres</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </main>
    </div>
  )
}
