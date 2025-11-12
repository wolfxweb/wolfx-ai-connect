// Função para salvar post automaticamente como rascunho após gerar conteúdo e imagem

import { supabase } from './supabase' // Usa o wrapper que já trabalha com IndexedDB
import { GeneratedContent } from './chatgpt'

/**
 * Gera slug a partir do título
 */
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Salva post automaticamente como rascunho após gerar conteúdo e imagem
 */
export async function autoSavePostAsDraft(
  content: GeneratedContent & { featured_image?: string }, // Permitir imagem já gerada
  userId: string,
  categoryId: string,
  categoryName?: string,
  generateImage: boolean = false // Por padrão, não gerar (assumir que já foi gerada)
): Promise<{ postId: string; imageGenerated: boolean }> {
  try {
    // Gerar slug do título
    const slug = generateSlugFromTitle(content.title)

    // Usar imagem já fornecida ou string vazia
    const featuredImage = content.featured_image || ''
    const imageGenerated = !!content.featured_image

    // Criar post como rascunho
    const postData = {
      title: content.title,
      slug: slug,
      content: content.content,
      excerpt: content.excerpt || '',
      featured_image: featuredImage,
      status: 'draft' as const,
      category_id: categoryId,
      author_id: userId,
      tags: content.tags || [],
      seo_title: content.seo_title || content.title,
      seo_description: content.seo_description || content.excerpt || '',
      seo_keywords: content.seo_keywords || [],
      meta_robots: 'index,follow'
    }

    console.log('💾 Salvando post como rascunho:', {
      title: postData.title,
      slug: postData.slug,
      category_id: postData.category_id,
      author_id: postData.author_id,
      has_image: !!postData.featured_image,
      image_length: postData.featured_image?.length || 0
    })

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postData])

    if (error) {
      console.error('❌ Erro ao salvar post:', error)
      throw new Error(error.message || 'Erro ao salvar post como rascunho')
    }

    // O insert pode retornar um objeto único ou um array
    let savedPost: any = null
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Post não foi criado: array vazio')
      }
      savedPost = data[0]
    } else if (data) {
      savedPost = data
    } else {
      throw new Error('Post não foi criado: resposta vazia')
    }

    if (!savedPost || !savedPost.id) {
      console.error('❌ Post criado mas sem ID:', savedPost)
      throw new Error('Post criado mas sem ID válido')
    }

    console.log('✅ Post salvo com sucesso:', {
      id: savedPost.id,
      title: savedPost.title,
      slug: savedPost.slug,
      status: savedPost.status,
      imageGenerated
    })

    return {
      postId: savedPost.id,
      imageGenerated
    }
  } catch (error: any) {
    console.error('Erro ao salvar post automaticamente:', error)
    throw error
  }
}

