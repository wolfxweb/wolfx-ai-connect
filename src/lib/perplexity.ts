// Serviço para integração com Perplexity AI

import type { ContentGenerationOptions, GeneratedContent } from './chatgpt'

/**
 * Gera conteúdo de post usando Perplexity AI
 */
export async function generatePostContentWithPerplexity(
  options: ContentGenerationOptions = {}
): Promise<GeneratedContent> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY

  if (!apiKey) {
    throw new Error('VITE_PERPLEXITY_API_KEY não configurada. Configure a chave da API Perplexity no arquivo .env')
  }

  const {
    theme = '',
    category = '',
    tone = 'professional',
    length = 'medium',
    language = 'pt-BR'
  } = options

  // Construir o prompt para o Perplexity
  const prompt = buildPrompt(theme, category, tone, length, language)

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Modelo avançado com busca na internet e grounding
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital. 
            Sua tarefa é criar conteúdo otimizado para SEO, bem estruturado e interessante.
            IMPORTANTE: Você DEVE responder APENAS com um JSON válido, sem nenhum texto adicional, sem markdown code blocks, sem explicações.
            Use informações atualizadas e relevantes da internet quando disponíveis.
            O formato da resposta deve ser um objeto JSON válido, começando com { e terminando com }.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Erro desconhecido' } }))
      throw new Error(error.error?.message || `Erro ao gerar conteúdo: ${response.statusText}`)
    }

    const data = await response.json()
    const contentText = data.choices[0]?.message?.content

    if (!contentText) {
      throw new Error('Resposta vazia da API Perplexity')
    }

    // Tentar parsear como JSON
    let content: any
    try {
      // Limpar possíveis markdown code blocks
      const cleanedText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      content = JSON.parse(cleanedText)
    } catch (parseError) {
      // Se não for JSON válido, tentar extrair informações do texto
      console.warn('Resposta não é JSON válido, tentando extrair conteúdo:', contentText)
      content = extractContentFromText(contentText, theme)
    }

    // Validar e formatar o conteúdo retornado
    return {
      title: content.title || theme || 'Post sem título',
      excerpt: content.excerpt || content.description || '',
      content: content.content || contentText,
      seo_title: content.seo_title || content.title || theme || '',
      seo_description: content.seo_description || content.excerpt || content.description || '',
      seo_keywords: Array.isArray(content.seo_keywords) 
        ? content.seo_keywords 
        : (content.seo_keywords || content.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
      tags: Array.isArray(content.tags) 
        ? content.tags 
        : (content.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
    }
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo com Perplexity:', error)
    throw new Error(error.message || 'Erro ao gerar conteúdo com Perplexity AI')
  }
}

/**
 * Gera sugestões de temas baseadas na categoria usando Perplexity
 */
export async function suggestThemesWithPerplexity(category?: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY

  if (!apiKey) {
    // Se não houver API key, retornar temas padrão
    return getDefaultThemes(category)
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Modelo avançado com busca na internet
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criação de conteúdo para blog. Forneça apenas uma lista JSON de temas relevantes e atuais.'
          },
          {
            role: 'user',
            content: `Sugira 10 temas interessantes e atuais para posts de blog${category ? ` na categoria "${category}"` : ''}. 
            Use informações recentes e tendências atuais.
            Responda APENAS com um JSON no formato: {"themes": ["tema1", "tema2", ...]}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      return getDefaultThemes(category)
    }

    const data = await response.json()
    const contentText = data.choices[0]?.message?.content || '{}'
    
    try {
      const cleanedText = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const content = JSON.parse(cleanedText)
      return content.themes || getDefaultThemes(category)
    } catch {
      return getDefaultThemes(category)
    }
  } catch (error) {
    console.error('Erro ao sugerir temas com Perplexity:', error)
    return getDefaultThemes(category)
  }
}

/**
 * Constrói o prompt para o Perplexity
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

  // Usar string concatenada para evitar problemas com backticks triplos
  const codeBlockNote = 'Não inclua markdown code blocks (```json), não inclua texto antes ou depois do JSON.'
  
  return `Crie um post de blog completo em ${language} com o seguinte tema: "${theme}"
${category ? `Categoria: ${category}` : ''}

Requisitos:
- Tono: ${toneMap[tone as keyof typeof toneMap]}
- Tamanho: ${lengthMap[length as keyof typeof lengthMap]}
- Otimizado para SEO
- Bem estruturado com títulos e subtítulos (use Markdown: ## para h2, ### para h3)
- Conteúdo interessante, útil e atualizado
- Use informações recentes e relevantes da internet quando disponíveis

IMPORTANTE: Responda APENAS com um objeto JSON válido. ${codeBlockNote} Comece diretamente com { e termine com }.

Formato JSON exigido:
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
 * Extrai conteúdo do texto quando a resposta não é JSON válido
 */
function extractContentFromText(text: string, theme: string): any {
  // Tentar encontrar JSON no texto
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      // Continuar com extração manual
    }
  }

  // Extração manual básica
  const lines = text.split('\n').filter(line => line.trim())
  const titleMatch = text.match(/title["\']?\s*[:=]\s*["']([^"']+)["']/i) || 
                    text.match(/Título[:\s]+(.+)/i) ||
                    lines.find(line => line.length < 100 && line.length > 10)

  return {
    title: titleMatch ? (titleMatch[1] || titleMatch[0] || theme) : theme,
    excerpt: text.substring(0, 200).replace(/\n/g, ' ').trim(),
    content: text,
    seo_title: titleMatch ? (titleMatch[1] || titleMatch[0] || theme) : theme,
    seo_description: text.substring(0, 160).replace(/\n/g, ' ').trim(),
    seo_keywords: [],
    tags: []
  }
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
 * Verifica se a API key do Perplexity está configurada
 */
export function isPerplexityConfigured(): boolean {
  return !!import.meta.env.VITE_PERPLEXITY_API_KEY
}
