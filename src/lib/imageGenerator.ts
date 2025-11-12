// Serviço para geração de imagens com IA (DALL-E)

import { getDefaultAIConfig, getAIConfigById, AIConfig } from './aiConfig'
import { optimizeImage } from './imageOptimizer'

export interface ImageGenerationOptions {
  title: string
  excerpt?: string
  content?: string // Conteúdo completo do post para melhor contexto
  category?: string
  configId?: string // ID da configuração de IA a ser usada (opcional)
}

/**
 * Gera um prompt para criação de imagem baseado no conteúdo do post
 */
function generateImagePrompt(
  title: string, 
  excerpt?: string,
  content?: string,
  category?: string,
  template?: string
): string {
  // Se houver template personalizado, usar ele
  if (template) {
    let prompt = template
      .replace(/{title}/g, title)
      .replace(/{excerpt}/g, excerpt || '')
      .replace(/{category}/g, category || '')
    
    // Se houver conteúdo, adicionar resumo do conteúdo ao template
    if (content && template.includes('{content}')) {
      // Extrair primeiras palavras-chave do conteúdo (primeiros 200 caracteres)
      const contentSummary = content.substring(0, 200).replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '').trim()
      prompt = prompt.replace(/{content}/g, contentSummary)
    }
    
    return prompt
  }
  
  // Template padrão
  const categoryContext = category ? ` relacionado à categoria "${category}"` : ''
  
  // Extrair palavras-chave principais do título
  const titleKeywords = title.split(' ').slice(0, 5).join(', ')
  
  // Se houver conteúdo, extrair palavras-chave adicionais
  let contentKeywords = ''
  if (content) {
    // Extrair títulos principais do conteúdo (H2 e H3)
    const headingMatches = content.match(/(?:^|\n)(?:#{2,3})\s+(.+)$/gm)
    if (headingMatches && headingMatches.length > 0) {
      const headings = headingMatches
        .slice(0, 3) // Pegar até 3 títulos
        .map(h => h.replace(/#{2,3}\s+/, '').trim())
        .join(', ')
      contentKeywords = headings
    }
  }
  
  let prompt = `Crie uma imagem profissional e atraente para um post de blog sobre: "${title}". 
${excerpt ? `Resumo do post: ${excerpt}. ` : ''}
${categoryContext ? `Contexto: ${categoryContext}. ` : ''}
${contentKeywords ? `Temas principais do post: ${contentKeywords}. ` : ''}
A imagem deve ser:
- Profissional e moderna
- Visualmente atraente e chamativa
- Relacionada ao tema do post
- Adequada para uso em blog (formato horizontal, estilo editorial)
- Sem texto ou logos sobrepostos
- Estilo realista ou ilustração profissional
- Paleta de cores harmoniosa e profissional

Palavras-chave visuais: ${titleKeywords}${contentKeywords ? `, ${contentKeywords}` : ''}`
  
  return prompt
}

/**
 * Gera uma imagem usando DALL-E da OpenAI
 */
export async function generateImageWithDALL_E(
  options: ImageGenerationOptions
): Promise<{ imageUrl: string; imageDataUrl: string; blob: Blob }> {
  const { title, excerpt, content, category, configId } = options

  // Obter configuração de imagem do banco de dados
  let config: AIConfig | null = null
  let isImageConfig = false
  
  if (configId) {
    config = await getAIConfigById(configId)
    // Verificar se é uma configuração de imagem
    if (config && config.provider === 'image') {
      isImageConfig = true
    } else {
      config = null
    }
  }
  
  // Se não houver configuração específica, buscar configuração padrão de imagem
  if (!config) {
    config = await getDefaultAIConfig('image')
    if (config) {
      isImageConfig = true
    }
  }
  
  // Se ainda não houver configuração de imagem, tentar usar configuração OpenAI padrão apenas para a API key
  let apiKey: string | undefined = undefined
  if (config && isImageConfig) {
    // Usar configuração de imagem completa
    apiKey = config.api_key
  } else {
    // Buscar configuração OpenAI apenas para pegar a API key
    const openaiConfig = await getDefaultAIConfig('openai')
    if (openaiConfig && openaiConfig.enabled) {
      apiKey = openaiConfig.api_key
    }
  }

  // Se não houver configuração no banco, usar variável de ambiente (fallback)
  apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Configuração de IA para geração de imagens não encontrada. Configure uma configuração de imagem no painel de configurações.')
  }

  // Modelos válidos para geração de imagens
  const validImageModels = ['gpt-image-1', 'gpt-image-1-mini', 'dall-e-2', 'dall-e-3']
  
  // Usar modelo, tamanho e qualidade da configuração ou valores padrão
  // IMPORTANTE: Se a configuração não for de imagem, sempre usar dall-e-3
  let model = 'dall-e-3'
  if (config && isImageConfig) {
    // Verificar se o modelo da configuração é válido para imagens
    if (config.model && validImageModels.includes(config.model)) {
      model = config.model
    } else {
      // Se o modelo não for válido, usar dall-e-3
      console.warn(`Modelo ${config.model} não é válido para geração de imagens. Usando dall-e-3.`)
      model = 'dall-e-3'
    }
  }
  
  let size: '1024x1024' | '1792x1024' | '1024x1792' | '256x256' | '512x512' = (config && isImageConfig) ? (config.image_size || '1024x1024') : '1024x1024'
  let quality: 'standard' | 'hd' = (config && isImageConfig) ? (config.image_quality || 'standard') : 'standard'
  const promptTemplate = (config && isImageConfig) ? config.image_prompt_template : undefined

  // Gerar prompt para a imagem
  const imagePrompt = generateImagePrompt(title, excerpt, content, category, promptTemplate)

  // Validar API key
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key não configurada. Configure uma chave de API válida nas configurações de IA.')
  }

  // Validar modelo
  if (!model || !['gpt-image-1', 'gpt-image-1-mini', 'dall-e-2', 'dall-e-3'].includes(model)) {
    throw new Error(`Modelo de imagem inválido: ${model}. Use um dos modelos suportados: dall-e-3, dall-e-2, gpt-image-1, gpt-image-1-mini`)
  }

  // Validar tamanhos suportados por modelo
  // DALL-E 3: 1024x1024, 1792x1024, 1024x1792
  // DALL-E 2: 256x256, 512x512, 1024x1024
  // gpt-image-1 e gpt-image-1-mini: mesmos tamanhos do DALL-E 3
  const isDalle2 = model === 'dall-e-2'
  const validSizes = isDalle2 
    ? ['256x256', '512x512', '1024x1024'] as const
    : ['1024x1024', '1792x1024', '1024x1792'] as const
  
  if (!validSizes.includes(size as any)) {
    console.warn(`Tamanho ${size} não suportado para modelo ${model}. Usando ${validSizes[0]}`)
    size = validSizes[0]
  }

  // Validar qualidade (apenas DALL-E 3 e gpt-image-1 suportam 'hd')
  if (quality === 'hd' && (model === 'dall-e-2' || model === 'gpt-image-1-mini')) {
    console.warn(`Qualidade HD não suportada para modelo ${model}. Usando 'standard'`)
    quality = 'standard'
  }

  console.log('🎨 Iniciando geração de imagem:', {
    model,
    size,
    quality,
    promptLength: imagePrompt.length,
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey.substring(0, 7) + '...'
  })

  try {
    // Preparar payload da requisição
    // Usar 'b64_json' para evitar problemas de CORS ao baixar a imagem
    const requestBody: any = {
      model: model,
      prompt: imagePrompt,
      size: size,
      response_format: 'b64_json' as const // Usar base64 para evitar problemas de CORS
    }

    // Adicionar qualidade apenas para modelos que suportam
    if (model !== 'dall-e-2' && model !== 'gpt-image-1-mini') {
      requestBody.quality = quality
    }

    console.log('📤 Enviando requisição para OpenAI:', {
      url: 'https://api.openai.com/v1/images/generations',
      model: requestBody.model,
      size: requestBody.size,
      quality: requestBody.quality,
      response_format: requestBody.response_format
    })

    // Chamar API do DALL-E com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 60000) // 60 segundos de timeout

    let response: Response
    try {
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      // Limpar timeout se a requisição foi bem-sucedida
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      // Limpar timeout em caso de erro
      clearTimeout(timeoutId)
      
      // Verificar se foi timeout ou outro erro
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        throw new Error('Tempo de espera esgotado ao gerar imagem (60 segundos). A requisição pode estar demorando mais do que o esperado. Tente novamente.')
      }
      
      // Erro de rede ou CORS
      console.error('❌ Erro na requisição fetch:', {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack
      })
      
      // Mensagens de erro mais específicas
      if (fetchError.message?.includes('Failed to fetch')) {
        throw new Error('Erro de conexão: Não foi possível conectar à API da OpenAI. Verifique sua conexão com a internet e tente novamente.')
      }
      
      throw new Error(`Erro de rede ao gerar imagem: ${fetchError.message || 'Verifique sua conexão com a internet e tente novamente'}`)
    }

    console.log('📥 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        console.error('❌ Erro da API OpenAI:', errorData)
        
        if (errorData.error) {
          errorMessage = errorData.error.message || errorData.error.code || errorMessage
          
          // Mensagens de erro mais amigáveis
          if (response.status === 401) {
            errorMessage = 'API key inválida ou expirada. Verifique suas configurações de IA.'
          } else if (response.status === 429) {
            errorMessage = 'Limite de requisições excedido. Aguarde alguns minutos e tente novamente.'
          } else if (response.status === 400) {
            errorMessage = `Requisição inválida: ${errorData.error.message || 'Verifique os parâmetros da requisição'}`
          } else if (response.status >= 500) {
            errorMessage = 'Erro no servidor da OpenAI. Tente novamente em alguns instantes.'
          }
        }
      } catch (parseError) {
        // Se não conseguir parsear o erro, usar o status text
        console.error('❌ Erro ao parsear resposta de erro:', parseError)
      }
      
      throw new Error(errorMessage)
    }

    let data: any
    try {
      data = await response.json()
      console.log('✅ Resposta parseada com sucesso')
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta:', parseError)
      throw new Error('Erro ao processar resposta da API da OpenAI')
    }

    // Processar resposta base64 (recomendado) ou URL (fallback)
    let imageDataUrl: string
    let imageUrl: string | undefined

    if (data.data?.[0]?.b64_json) {
      // Usar base64 diretamente (evita problemas de CORS)
      console.log('✅ Imagem recebida em formato base64')
      const base64Data = data.data[0].b64_json
      imageDataUrl = `data:image/png;base64,${base64Data}`
      
      // Criar URL temporária para referência
      imageUrl = imageDataUrl
    } else if (data.data?.[0]?.url) {
      // Fallback para URL (se a API retornar URL em vez de base64)
      console.log('⚠️ Imagem recebida como URL, baixando...')
      imageUrl = data.data[0].url
      
      // Baixar a imagem da URL
      let imageResponse: Response
      try {
        imageResponse = await fetch(imageUrl, {
          mode: 'cors', // Permitir CORS
          credentials: 'omit'
        })
        if (!imageResponse.ok) {
          throw new Error(`Erro ao baixar imagem: ${imageResponse.status} ${imageResponse.statusText}`)
        }
      } catch (downloadError: any) {
        console.error('❌ Erro ao baixar imagem:', downloadError)
        throw new Error(`Erro ao baixar imagem gerada: ${downloadError.message || 'Verifique sua conexão com a internet'}`)
      }

      const imageBlob = await imageResponse.blob()
      console.log('✅ Imagem baixada, tamanho:', imageBlob.size, 'bytes')
      
      // Converter blob para data URL
      const reader = new FileReader()
      imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageBlob)
      })
    } else {
      console.error('❌ Formato de resposta não reconhecido:', data)
      throw new Error('Resposta da API não contém dados de imagem válidos (nem base64 nem URL)')
    }

    console.log('🔄 Processando imagem...')

    // Converter data URL para File para otimização
    // Função auxiliar para converter data URL para blob
    function dataURLToBlob(dataUrl: string): Blob {
      const arr = dataUrl.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : 'image/png'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    }

    // Converter data URL para blob
    const imageBlob = dataURLToBlob(imageDataUrl)
    const imageFile = new File([imageBlob], `generated-${Date.now()}.png`, { type: 'image/png' })
    
    // Otimizar a imagem
    console.log('🔄 Otimizando imagem...')
    const optimized = await optimizeImage(imageFile, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      format: 'jpeg'
    })
    
    console.log('✅ Imagem otimizada com sucesso, tamanho final:', optimized.size, 'bytes')

    return {
      imageUrl: imageUrl || optimized.dataUrl,
      imageDataUrl: optimized.dataUrl,
      blob: optimized.blob
    }
  } catch (error: any) {
    console.error('❌ Erro ao gerar imagem:', error)
    
    // Se o erro já tem uma mensagem descritiva, usar ela
    if (error.message && error.message !== 'Failed to fetch') {
      throw error
    }
    
    // Caso contrário, fornecer uma mensagem mais descritiva
    throw new Error(`Erro ao gerar imagem: ${error.message || 'Erro desconhecido. Verifique sua conexão com a internet, sua API key e tente novamente'}`)
  }
}

/**
 * Verifica se a geração de imagens está configurada
 */
export async function isImageGenerationConfigured(): Promise<boolean> {
  try {
    // Verificar se há configuração de imagem no banco
    const imageConfig = await getDefaultAIConfig('image')
    if (imageConfig && imageConfig.enabled) {
      return true
    }
    
    // Verificar se há configuração OpenAI que pode ser usada
    const openaiConfig = await getDefaultAIConfig('openai')
    if (openaiConfig && openaiConfig.enabled) {
      return true
    }
    
    // Fallback para variável de ambiente
    return !!import.meta.env.VITE_OPENAI_API_KEY
  } catch (error) {
    console.error('Erro ao verificar configuração de imagens:', error)
    return !!import.meta.env.VITE_OPENAI_API_KEY
  }
}

