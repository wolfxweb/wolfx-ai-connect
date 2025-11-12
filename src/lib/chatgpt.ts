// Serviço para integração com ChatGPT (OpenAI API)

export interface ContentGenerationOptions {
  theme?: string
  category?: string
  tone?: 'formal' | 'informal' | 'professional' | 'casual'
  length?: 'short' | 'medium' | 'long'
  language?: string
}

export interface GeneratedContent {
  title: string
  excerpt: string
  content: string
  seo_title: string
  seo_description: string
  seo_keywords: string[]
  tags: string[]
}

/**
 * Gera conteúdo de post usando ChatGPT
 */
export async function generatePostContent(
  options: ContentGenerationOptions = {}
): Promise<GeneratedContent> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY não configurada. Configure a chave da API OpenAI no arquivo .env')
  }

  const {
    theme = '',
    category = '',
    tone = 'professional',
    length = 'medium',
    language = 'pt-BR'
  } = options

  // Construir o prompt para o ChatGPT
  const prompt = buildPrompt(theme, category, tone, length, language)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modelo mais econômico e rápido
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital. 
            Crie conteúdo otimizado para SEO, bem estruturado e interessante.
            Responda APENAS com um JSON válido no formato especificado, sem texto adicional.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erro ao gerar conteúdo')
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)

    // Validar e formatar o conteúdo retornado
    return {
      title: content.title || '',
      excerpt: content.excerpt || '',
      content: content.content || '',
      seo_title: content.seo_title || content.title || '',
      seo_description: content.seo_description || content.excerpt || '',
      seo_keywords: Array.isArray(content.seo_keywords) 
        ? content.seo_keywords 
        : (content.seo_keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
      tags: Array.isArray(content.tags) 
        ? content.tags 
        : (content.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
    }
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    throw new Error(error.message || 'Erro ao gerar conteúdo com ChatGPT')
  }
}

/**
 * Gera sugestões de temas baseadas na categoria
 */
export async function suggestThemes(category?: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    // Se não houver API key, retornar temas padrão
    return getDefaultThemes(category)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criação de conteúdo para blog. Forneça apenas uma lista JSON de temas relevantes.'
          },
          {
            role: 'user',
            content: `Sugira 10 temas interessantes para posts de blog${category ? ` na categoria "${category}"` : ''}. 
            Responda APENAS com um JSON no formato: {"themes": ["tema1", "tema2", ...]}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      return getDefaultThemes(category)
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    return content.themes || getDefaultThemes(category)
  } catch (error) {
    console.error('Erro ao sugerir temas:', error)
    return getDefaultThemes(category)
  }
}

/**
 * Constrói o prompt para o ChatGPT
 */
function buildPrompt(
  theme: string,
  category: string,
  tone: string,
  length: string,
  language: string
): string {
  const lengthMap = {
    short: '300-500 palavras',
    medium: '800-1200 palavras',
    long: '1500-2000 palavras'
  }

  const toneMap = {
    formal: 'formal e profissional',
    informal: 'descontraído e amigável',
    professional: 'profissional e técnico',
    casual: 'casual e acessível'
  }

  return `Crie um post de blog completo em ${language} com o seguinte tema: "${theme}"
${category ? `Categoria: ${category}` : ''}

Requisitos:
- Tono: ${toneMap[tone as keyof typeof toneMap]}
- Tamanho: ${lengthMap[length as keyof typeof lengthMap]}
- Otimizado para SEO
- Bem estruturado com títulos e subtítulos
- Conteúdo interessante e útil

Responda APENAS com um JSON no seguinte formato (sem texto adicional):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres)",
  "content": "Conteúdo completo do post em Markdown, com títulos (##), listas, parágrafos bem formatados",
  "seo_title": "Título otimizado para SEO (50-60 caracteres)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
}

/**
 * Retorna temas padrão quando a API não está disponível
 */
function getDefaultThemes(category?: string): string[] {
  const defaultThemes = [
    'Tendências de Tecnologia para 2024',
    'Como Aumentar a Produtividade com IA',
    'Guia Completo de Automação de Processos',
    'Melhores Práticas de Desenvolvimento de Software',
    'Como Escalar seu Negócio Digital',
    'Inteligência Artificial na Gestão de Empresas',
    'Transformação Digital: Por Onde Começar',
    'Marketing Digital: Estratégias Eficazes',
    'Segurança de Dados: Proteção e Compliance',
    'Inovação e Criatividade no Mundo Digital'
  ]

  if (category) {
    // Filtrar temas por categoria se necessário
    return defaultThemes.slice(0, 10)
  }

  return defaultThemes
}

/**
 * Verifica se a API key está configurada
 */
export function isChatGPTConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY
}

