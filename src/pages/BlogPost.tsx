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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

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

    return (
      <div className="prose prose-lg prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-4xl prose-h1:mt-10 prose-h1:mb-6
        prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
        prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2
        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline 
        hover:prose-a:text-blue-800 hover:prose-a:underline
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-em:text-gray-700 prose-em:italic
        prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
        prose-li:text-gray-700 prose-li:my-1
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
        prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6 
        prose-blockquote:text-gray-600 prose-blockquote:bg-blue-50 
        prose-blockquote:py-2 prose-blockquote:rounded-r
        prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-1.5 
        prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 
        prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:mx-auto
        prose-hr:border-gray-300 prose-hr:my-8
        prose-table:w-full prose-table:border-collapse prose-table:my-4
        prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 
        prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Customizar links para abrir em nova aba
            a: ({ node, href, children, ...props }: any) => (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            ),
            // Customizar imagens
            img: ({ node, src, alt, ...props }: any) => (
              <img 
                src={src} 
                alt={alt || ''} 
                className="rounded-lg shadow-md my-6 mx-auto max-w-full h-auto" 
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
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
            {renderContent(post.content)}
          
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

