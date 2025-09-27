import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Loader2,
  User,
  Calendar,
  Mail,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface Comment {
  id: string
  post_id: string
  author_id: string | null
  parent_id: string | null
  content: string
  author_name: string
  author_email: string
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
  approved_at: string | null
  approved_by: string | null
  blog_posts?: {
    id: string
    title: string
    slug: string
  } | null
  profiles?: {
    id: string
    name: string
  } | null
}

export default function CommentModeration() {
  const { userProfile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [statusFilter])

  const fetchComments = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando comentários com filtro:', statusFilter)
      console.log('👤 Usuário atual:', userProfile)
      
      // Buscar comentários com filtro de status
      let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data: commentsData, error: commentsError } = await query

      if (commentsError) {
        console.error('❌ Erro ao buscar comentários:', commentsError)
        throw commentsError
      }

      console.log('📄 Comentários encontrados:', commentsData?.length || 0)
      console.log('📋 Dados dos comentários:', commentsData)

      // Buscar posts relacionados
      const postIds = commentsData?.map(c => c.post_id).filter(Boolean) || []
      let postsData = []
      
      if (postIds.length > 0) {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug')
          .in('id', postIds)

        if (!error) {
          postsData = data || []
        }
      }

      // Buscar perfis dos autores
      const authorIds = commentsData?.filter(c => c.author_id).map(c => c.author_id) || []
      let profilesData = []
      
      if (authorIds.length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', authorIds)

        if (!error) {
          profilesData = data || []
        }
      }

      // Combinar dados
      const commentsWithRelations = commentsData?.map(comment => ({
        ...comment,
        blog_posts: postsData.find(p => p.id === comment.post_id) || null,
        profiles: profilesData.find(p => p.id === comment.author_id) || null
      })) || []

      setComments(commentsWithRelations)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Erro ao carregar comentários')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (commentId: string, newStatus: string) => {
    try {
      setActionLoading(commentId)
      
      const { error } = await supabase
        .from('comments')
        .update({ 
          status: newStatus,
          ...(newStatus === 'approved' && { 
            approved_at: new Date().toISOString(),
            approved_by: userProfile?.id 
          })
        })
        .eq('id', commentId)

      if (error) throw error

      toast.success(`Comentário ${newStatus === 'approved' ? 'aprovado' : newStatus === 'rejected' ? 'rejeitado' : 'marcado como spam'}!`)
      
      // Atualizar lista
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              status: newStatus as any,
              ...(newStatus === 'approved' && { 
                approved_at: new Date().toISOString(),
                approved_by: userProfile?.id 
              })
            }
          : comment
      ))
      
      // Limpar seleção se era o comentário selecionado
      if (selectedComment?.id === commentId) {
        setSelectedComment(null)
      }
    } catch (error: any) {
      console.error('Error updating comment status:', error)
      toast.error(error.message || 'Erro ao atualizar comentário')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return

    try {
      setActionLoading(commentId)
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      toast.success('Comentário excluído!')
      
      // Atualizar lista
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      
      // Limpar seleção se era o comentário selecionado
      if (selectedComment?.id === commentId) {
        setSelectedComment(null)
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error)
      toast.error(error.message || 'Erro ao excluir comentário')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      spam: 'outline'
    } as const

    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      spam: 'Spam'
    }

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      spam: AlertTriangle
    }

    const Icon = icons[status as keyof typeof icons]

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{labels[status as keyof typeof labels]}</span>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStats = () => {
    const total = comments.length
    const pending = comments.filter(c => c.status === 'pending').length
    const approved = comments.filter(c => c.status === 'approved').length
    const rejected = comments.filter(c => c.status === 'rejected').length
    const spam = comments.filter(c => c.status === 'spam').length

    return { total, pending, approved, rejected, spam }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Moderação de Comentários</h2>
        <p className="text-muted-foreground">
          Gerencie comentários e respostas dos posts
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spam</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.spam}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de comentários */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle>Comentários</CardTitle>
            <CardDescription>
              {comments.length > 0 ? `${comments.length} comentários encontrados` : 'Nenhum comentário encontrado'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Nenhum comentário encontrado com os filtros aplicados.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedComment?.id === comment.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedComment(comment)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {comment.profiles?.name || comment.author_name}
                        </span>
                        {comment.profiles && (
                          <Badge variant="secondary" className="text-xs">
                            Membro
                          </Badge>
                        )}
                      </div>
                      {getStatusBadge(comment.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {comment.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-32">
                            {comment.blog_posts?.title || 'Post não encontrado'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalhes do comentário selecionado */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Comentário</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedComment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedComment.profiles?.name || selectedComment.author_name}
                    </span>
                    {selectedComment.profiles && (
                      <Badge variant="secondary" className="text-xs">
                        Membro
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(selectedComment.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{selectedComment.author_email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">
                      {selectedComment.blog_posts?.title || 'Post não encontrado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(selectedComment.created_at)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Conteúdo:</h4>
                  <Textarea
                    value={selectedComment.content}
                    readOnly
                    rows={6}
                    className="bg-gray-50"
                  />
                </div>

                {selectedComment.ip_address && (
                  <div className="text-sm text-gray-500">
                    <strong>IP:</strong> {selectedComment.ip_address}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(selectedComment.id, 'approved')}
                    disabled={actionLoading === selectedComment.id || selectedComment.status === 'approved'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === selectedComment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Aprovar
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange(selectedComment.id, 'rejected')}
                    disabled={actionLoading === selectedComment.id || selectedComment.status === 'rejected'}
                  >
                    {actionLoading === selectedComment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    Rejeitar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(selectedComment.id, 'spam')}
                    disabled={actionLoading === selectedComment.id || selectedComment.status === 'spam'}
                  >
                    {actionLoading === selectedComment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1" />
                    )}
                    Spam
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(selectedComment.id)}
                    disabled={actionLoading === selectedComment.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {actionLoading === selectedComment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Excluir'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um comentário para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
