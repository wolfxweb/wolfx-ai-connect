import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, BlogPost } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Calendar, User, Tag, Share2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Comments from '@/components/Comments'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchPost(slug)
    }
  }, [slug])

  const fetchPost = async (postSlug: string) => {
    try {
      // Buscar post primeiro
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('status', 'published')
        .single()

      if (postError) throw postError
      
      if (!postData) {
        navigate('/blog')
        return
      }

      // Buscar categoria e perfil separadamente
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', postData.category_id)
        .single()

      if (categoryError) {
        console.warn('Erro ao buscar categoria:', categoryError)
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', postData.author_id)
        .single()

      if (profileError) {
        console.warn('Erro ao buscar perfil:', profileError)
      }

      // Combinar dados manualmente
      const postWithRelations = {
        ...postData,
        categories: categoryData || null,
        profiles: profileData || null
      }

      setPost(postWithRelations)
      fetchRelatedPosts(postData.category_id, postData.id)
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Erro ao carregar post')
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedPosts = async (categoryId: string, currentPostId: string) => {
    try {
      // Buscar posts relacionados primeiro
      const { data: relatedPostsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(3)

      if (postsError) throw postsError

      if (!relatedPostsData || relatedPostsData.length === 0) {
        setRelatedPosts([])
        return
      }

      // Buscar categorias e perfis separadamente
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug')

      if (categoriesError) {
        console.warn('Erro ao buscar categorias:', categoriesError)
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')

      if (profilesError) {
        console.warn('Erro ao buscar profiles:', profilesError)
      }

      // Combinar dados manualmente
      const relatedPostsWithRelations = relatedPostsData.map(relatedPost => ({
        ...relatedPost,
        categories: categoriesData?.find(cat => cat.id === relatedPost.category_id) || null,
        profiles: profilesData?.find(prof => prof.id === relatedPost.author_id) || null
      }))

      setRelatedPosts(relatedPostsWithRelations)
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderContent = (content: string) => {
    if (!content) return null

    // Processar formatação básica
    let processedContent = content

    // Converter quebras de linha para <br>
    processedContent = processedContent.replace(/\n/g, '<br>')

    // Processar negrito **texto**
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Processar itálico *texto*
    processedContent = processedContent.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

    // Processar sublinhado <u>texto</u>
    processedContent = processedContent.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')

    // Processar links [texto](url)
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')

    // Processar listas com marcadores - item
    processedContent = processedContent.replace(/^- (.+)$/gm, '<li>$1</li>')
    processedContent = processedContent.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-6 my-4">$1</ul>')

    // Processar listas numeradas 1. item
    processedContent = processedContent.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    processedContent = processedContent.replace(/(<li>.*<\/li>)/s, '<ol class="list-decimal pl-6 my-4">$1</ol>')

    // Processar citações > texto
    processedContent = processedContent.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">$1</blockquote>')

    // Processar cabeçalhos ## Título
    processedContent = processedContent.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-4">$1</h2>')
    processedContent = processedContent.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')

    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />
  }

  const sharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Post não encontrado.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>
            
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="outline">
                {(post as any).categories?.name || 'Sem categoria'}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{(post as any).profiles?.name || 'Autor'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={sharePost}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
          
          {post.featured_image && (
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comentários */}
        <div className="mt-12">
          <Comments postId={post.id} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Posts Relacionados
            </h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost: any) => (
                <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                  {relatedPost.featured_image && (
                    <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">
                        {relatedPost.categories?.name || 'Sem categoria'}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    
                    {relatedPost.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {relatedPost.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{relatedPost.profiles?.name || 'Autor'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(relatedPost.published_at || relatedPost.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

