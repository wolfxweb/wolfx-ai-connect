import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, Send, Clock, CheckCircle, XCircle, AlertTriangle, Reply } from 'lucide-react'
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
  created_at: string
  updated_at: string
  approved_at: string | null
  approved_by: string | null
  profiles?: {
    id: string
    name: string
  } | null
}

interface CommentsProps {
  postId: string
}

export default function Comments({ postId }: CommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  
  // Formulário de novo comentário
  const [formData, setFormData] = useState({
    content: '',
    author_name: user?.user_metadata?.name || user?.email || '',
    author_email: user?.email || ''
  })

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      
      // Buscar comentários aprovados
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (commentsError) throw commentsError

      // Buscar perfis dos autores (se houver)
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
      const commentsWithProfiles = commentsData?.map(comment => ({
        ...comment,
        profiles: profilesData.find(p => p.id === comment.author_id) || null
      })) || []

      setComments(commentsWithProfiles)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Erro ao carregar comentários')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            author_id: user?.id || null,
            parent_id: replyingTo,
            content: formData.content.trim(),
            author_name: formData.author_name.trim(),
            author_email: formData.author_email.trim(),
            status: 'pending'
          }
        ])

      if (error) throw error

      toast.success('Enviado')
      
      // Limpar formulário
      setFormData({
        content: '',
        author_name: user?.user_metadata?.name || user?.email || '',
        author_email: user?.email || ''
      })
      setReplyingTo(null)
    } catch (error: any) {
      console.error('Error submitting comment:', error)
      toast.error(error.message || 'Erro ao enviar comentário')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId)
    // Scroll para o formulário
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'spam':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Organizar comentários em árvore (comentários e respostas)
  const organizeComments = (comments: Comment[]) => {
    const commentMap = new Map<string, Comment & { replies: Comment[] }>()
    const rootComments: (Comment & { replies: Comment[] })[] = []

    // Inicializar mapa
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Organizar em árvore
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies.push(comment)
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!)
      }
    })

    return rootComments
  }

  const renderComment = (comment: Comment & { replies: Comment[] }, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : ''}`}>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {comment.profiles?.name || comment.author_name}
                </span>
                {comment.profiles && (
                  <Badge variant="secondary" className="text-xs">
                    Membro
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            {getStatusIcon(comment.status)}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          {!isReply && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReply(comment.id)}
                className="text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Responder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renderizar respostas */}
      {comment.replies.map(reply => renderComment(reply, true))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const organizedComments = organizeComments(comments)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Lista de comentários */}
      {organizedComments.length > 0 ? (
        <div className="space-y-4">
          {organizedComments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            Seja o primeiro a comentar!
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Formulário de comentário */}
      <Card id="comment-form">
        <CardHeader>
          <CardTitle className="text-base">
            {replyingTo ? 'Responder comentário' : 'Adicionar comentário'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">Nome</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author_email">Email</Label>
                <Input
                  id="author_email"
                  type="email"
                  value={formData.author_email}
                  onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                Comentário {replyingTo && '(respondendo)'}
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Digite seu comentário..."
                rows={4}
                required
                disabled={submitting}
              />
            </div>

            {replyingTo && (
              <Alert>
                <AlertDescription>
                  Você está respondendo a um comentário. Clique em "Cancelar" para comentar no post principal.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Comentário
                  </>
                )}
              </Button>
              
              {replyingTo && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyingTo(null)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Todos os comentários passam por moderação antes de serem publicados.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
