import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, BlogPost, Category } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Plus, Eye, Loader2, Calendar, User, Search, Filter, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Estados para filtros e paginação
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const postsPerPage = 10

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [currentPage, searchTerm, statusFilter, categoryFilter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando posts...', {
        searchTerm,
        statusFilter,
        categoryFilter,
        currentPage,
        postsPerPage
      })
      
      // Construir query com filtros
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter)
      }

      // Aplicar paginação
      const from = (currentPage - 1) * postsPerPage
      const to = from + postsPerPage - 1
      query = query.range(from, to)

      const { data: postsData, error: postsError, count } = await query

      if (postsError) {
        console.error('❌ Erro ao buscar posts:', postsError)
        throw postsError
      }

      console.log(`✅ Posts encontrados: ${postsData?.length || 0}`, {
        total: count,
        page: currentPage,
        totalPages: Math.ceil((count || 0) / postsPerPage)
      })

      // Buscar categorias separadamente
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')

      if (categoriesError) {
        console.warn('⚠️ Erro ao buscar categorias:', categoriesError)
      }

      // Buscar profiles separadamente
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')

      if (profilesError) {
        console.warn('⚠️ Erro ao buscar profiles:', profilesError)
      }

      // Combinar dados manualmente
      const postsWithRelations = postsData?.map(post => ({
        ...post,
        categories: categoriesData?.find(cat => cat.id === post.category_id) || null,
        profiles: profilesData?.find(prof => prof.id === post.author_id) || null
      })) || []

      console.log(`📋 Posts processados: ${postsWithRelations.length}`)

      setPosts(postsWithRelations)
      setTotalPosts(count || 0)
      setTotalPages(Math.ceil((count || 0) / postsPerPage))
    } catch (error) {
      console.error('❌ Error fetching posts:', error)
      toast.error('Erro ao carregar posts')
      setPosts([])
      setTotalPosts(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleEdit = (post: BlogPost) => {
    navigate(`/admin/posts/${post.id}/edit`)
  }

  const handleNewPost = () => {
    navigate('/admin/posts/new')
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    setDeleting(true)
    try {
      console.log('🗑️ Excluindo post:', {
        id: postToDelete.id,
        title: postToDelete.title,
        hasImage: !!postToDelete.featured_image
      })

      // Verificar se o post tem imagem antes de deletar
      if (postToDelete.featured_image) {
        if (postToDelete.featured_image.startsWith('data:')) {
          const imageSize = Math.round((postToDelete.featured_image.length * 3) / 4)
          console.log(`📸 Post tem imagem de ${Math.round(imageSize / 1024)}KB que será removida automaticamente`)
        } else {
          console.log(`📸 Post tem imagem de URL que será removida automaticamente`)
        }
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete.id)

      if (error) {
        console.error('❌ Erro ao excluir post:', error)
        throw error
      }

      console.log('✅ Post excluído com sucesso (incluindo imagem)')
      toast.success('Post excluído com sucesso!')
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      
      // Aguardar um pouco antes de buscar para garantir que o IndexedDB foi atualizado
      await new Promise(resolve => setTimeout(resolve, 200))
      await fetchPosts()
    } catch (error: any) {
      console.error('❌ Error deleting post:', error)
      toast.error(error.message || 'Erro ao excluir post')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      scheduled: 'outline',
      archived: 'destructive'
    } as const

    const labels = {
      draft: 'Rascunho',
      published: 'Publicado',
      scheduled: 'Agendado',
      archived: 'Arquivado'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
            <Button onClick={handleNewPost}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Posts */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Posts do Blog</CardTitle>
            <CardDescription>
              {totalPosts > 0 ? `${totalPosts} posts encontrados` : 'Nenhum post encontrado'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>

          {posts.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhum post encontrado. Crie seu primeiro post!
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post: any) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {post.featured_image ? (
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                            onError={(e) => {
                              // Se a imagem falhar ao carregar, esconde o elemento
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="truncate">{post.title}</span>
                          {post.status === 'published' && (
                            <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {post.categories?.name || 'Sem categoria'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{post.profiles?.name || 'Autor'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(post)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              )}
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * postsPerPage) + 1} a {Math.min(currentPage * postsPerPage, totalPosts)} de {totalPosts} posts
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal de confirmação de exclusão */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDialogTitle>Excluir Post</AlertDialogTitle>
                </div>
                <AlertDialogDescription className="pt-2">
                  Tem certeza que deseja excluir o post <strong>"{postToDelete?.title}"</strong>?
                  <br />
                  <span className="text-xs text-muted-foreground mt-2 block">
                    Esta ação não pode ser desfeita. O post e sua imagem de destaque serão removidos permanentemente.
                  </span>
                  {postToDelete?.featured_image && (
                    <span className="text-xs text-amber-600 mt-2 block">
                      ⚠️ A imagem de destaque deste post também será removida.
                    </span>
                  )}
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

