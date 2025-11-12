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

    // Verificar se há imagem fornecida
    const hasImage = !!content.featured_image && content.featured_image.trim() !== ''
    const featuredImage = hasImage ? content.featured_image! : undefined
    const imageGenerated = hasImage

    console.log('🖼️ Preparando imagem para salvar:', {
      has_image: hasImage,
      image_length: content.featured_image?.length || 0,
      image_type: content.featured_image?.substring(0, 30) || 'sem imagem',
      is_data_url: content.featured_image?.startsWith('data:') || false
    })

    // Criar post como rascunho
    const postData: any = {
      title: content.title,
      slug: slug,
      content: content.content,
      excerpt: content.excerpt || '',
      status: 'draft' as const,
      category_id: categoryId,
      author_id: userId,
      tags: content.tags || [],
      seo_title: content.seo_title || content.title,
      seo_description: content.seo_description || content.excerpt || '',
      seo_keywords: content.seo_keywords || [],
      meta_robots: 'index,follow'
    }

    // Adicionar featured_image apenas se houver imagem
    if (hasImage && featuredImage) {
      postData.featured_image = featuredImage
      console.log('✅ Imagem será salva no post:', {
        length: featuredImage.length,
        preview: featuredImage.substring(0, 50) + '...'
      })
    } else {
      // Se não houver imagem, não incluir o campo (será undefined, que o IndexedDB trata como null)
      console.log('ℹ️ Nenhuma imagem para salvar no post')
    }

    console.log('💾 Salvando post como rascunho:', {
      title: postData.title,
      slug: postData.slug,
      category_id: postData.category_id,
      author_id: postData.author_id,
      has_image: !!postData.featured_image,
      image_length: postData.featured_image?.length || 0,
      image_preview: postData.featured_image?.substring(0, 50) || 'sem imagem',
      postData_keys: Object.keys(postData)
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
      imageGenerated,
      has_featured_image: !!savedPost.featured_image,
      featured_image_length: savedPost.featured_image?.length || 0,
      featured_image_preview: savedPost.featured_image?.substring(0, 100) || 'sem imagem',
      featured_image_type: savedPost.featured_image ? typeof savedPost.featured_image : 'undefined',
      featured_image_starts_with: savedPost.featured_image?.substring(0, 20) || 'sem imagem'
    })
    
    // Verificar se a imagem foi salva corretamente
    if (hasImage && featuredImage) {
      if (!savedPost.featured_image) {
        console.error('❌ ERRO CRÍTICO: Imagem foi fornecida mas não foi salva no post!')
        console.error('Tamanho da imagem fornecida:', featuredImage.length)
        console.error('Tipo da imagem fornecida:', typeof featuredImage)
        console.error('Post salvo:', savedPost)
        
        // Tentar buscar o post novamente para verificar
        const { db } = await import('./database')
        const postFromDb = await db.blog_posts.get(savedPost.id)
        console.error('Post recuperado diretamente do IndexedDB:', {
          id: postFromDb?.id,
          title: postFromDb?.title,
          has_featured_image: !!postFromDb?.featured_image,
          featured_image_length: postFromDb?.featured_image?.length || 0
        })
      } else {
        console.log('✅ Imagem salva corretamente no post')
        console.log('Tamanho da imagem salva:', savedPost.featured_image.length)
        console.log('Tipo da imagem salva:', typeof savedPost.featured_image)
        console.log('Imagem começa com:', savedPost.featured_image.substring(0, 30))
        
        // Verificar se a imagem salva é igual à fornecida
        if (savedPost.featured_image !== featuredImage) {
          console.warn('⚠️ ATENÇÃO: A imagem salva é diferente da fornecida!')
          console.warn('Tamanho fornecido:', featuredImage.length)
          console.warn('Tamanho salvo:', savedPost.featured_image.length)
        } else {
          console.log('✅ A imagem salva é idêntica à fornecida')
        }
      }
    } else {
      console.log('ℹ️ Nenhuma imagem foi fornecida para salvar')
    }

    return {
      postId: savedPost.id,
      imageGenerated
    }
  } catch (error: any) {
    console.error('Erro ao salvar post automaticamente:', error)
    throw error
  }
}

