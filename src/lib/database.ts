import Dexie, { Table } from 'dexie'

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  status: 'draft' | 'published' | 'archived' | 'scheduled'
  category_id: string
  author_id: string
  tags?: string[]
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  meta_robots?: string
  scheduled_at?: string
  created_at: string
  updated_at: string
  published_at?: string
}

export interface Comment {
  id: string
  post_id: string
  author_id?: string | null
  author_name: string
  author_email: string
  content: string
  parent_id?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  ip_address?: string | null
  user_agent?: string | null
  approved_at?: string | null
  approved_by?: string | null
  created_at: string
  updated_at: string
}

export interface AIConfig {
  id: string
  provider: 'openai' | 'perplexity' | 'image'
  name: string // Nome descritivo da configuração (ex: "OpenAI Principal", "Perplexity Pro", "DALL-E 3")
  api_key: string // Token de API (será armazenado de forma ofuscada)
  model: string // Modelo a ser usado (ex: "gpt-5", "gpt-4o-mini", "sonar-pro", "dall-e-3")
  temperature?: number
  max_tokens?: number
  top_p?: number
  // Parâmetros específicos do GPT-5
  verbosity?: 'low' | 'medium' | 'high' // Controla a extensão das respostas (GPT-5)
  reasoning_effort?: 'low' | 'medium' | 'high' // Controla a profundidade do raciocínio (GPT-5)
  system_prompt?: string // Prompt do sistema personalizado
  user_prompt_template?: string // Template do prompt do usuário (pode usar variáveis como {theme}, {category}, etc.)
  // Parâmetros específicos para geração de imagens
  image_size?: '1024x1024' | '1792x1024' | '1024x1792' // Tamanho da imagem (DALL-E)
  image_quality?: 'standard' | 'hd' // Qualidade da imagem (DALL-E)
  image_prompt_template?: string // Template do prompt de imagem (pode usar variáveis como {title}, {excerpt}, {category})
  enabled: boolean
  is_default: boolean // Se é a configuração padrão para o provider
  created_by: string
  created_at: string
  updated_at: string
}

// Classe do banco de dados
export class WolfxDatabase extends Dexie {
  users!: Table<User, string>
  profiles!: Table<User, string>
  categories!: Table<Category, string>
  blog_posts!: Table<BlogPost, string>
  comments!: Table<Comment, string>
  ai_configs!: Table<AIConfig, string>

  constructor() {
    super('WolfxDatabase')
    
    // Versão 1: Schema inicial
    this.version(1).stores({
      users: 'id, email, role, status, created_at',
      profiles: 'id, email, role, status, created_at',
      categories: 'id, slug, created_by, created_at',
      blog_posts: 'id, slug, status, category_id, author_id, published_at, created_at',
      comments: 'id, post_id, author_id, parent_id, status, created_at'
    })

    // Versão 2: Adiciona tabela de configurações de IA
    this.version(2).stores({
      users: 'id, email, role, status, created_at',
      profiles: 'id, email, role, status, created_at',
      categories: 'id, slug, created_by, created_at',
      blog_posts: 'id, slug, status, category_id, author_id, published_at, created_at',
      comments: 'id, post_id, author_id, parent_id, status, created_at',
      ai_configs: 'id, provider, enabled, is_default, created_at'
    })

    // Versão 3: Atualiza prompts padrão para versões mais recentes
    this.version(3).stores({
      users: 'id, email, role, status, created_at',
      profiles: 'id, email, role, status, created_at',
      categories: 'id, slug, created_by, created_at',
      blog_posts: 'id, slug, status, category_id, author_id, published_at, created_at',
      comments: 'id, post_id, author_id, parent_id, status, created_at',
      ai_configs: 'id, provider, enabled, is_default, created_at'
    }).upgrade(async (tx) => {
      // Atualizar prompts de configurações OpenAI existentes
      const openaiConfigs = await tx.table('ai_configs')
        .where('provider').equals('openai')
        .toArray()
      
      const updatedSystemPrompt = `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital com anos de experiência.
            Sua missão é criar conteúdo de alta qualidade, otimizado para SEO, bem estruturado, interessante e valioso para o leitor.
            IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido no formato especificado abaixo, sem nenhum texto adicional, sem explicações, sem markdown code blocks.
            O JSON deve começar diretamente com { e terminar com }.`
      
      const updatedUserPromptTemplate = `Crie um post de blog completo e profissional em {language} sobre o tema: "{theme}"
{category}

INSTRUÇÕES DETALHADAS:
- Tono de escrita: {tone}
- Tamanho do conteúdo: {length}
- Otimizado para SEO (use palavras-chave estrategicamente, mas de forma natural)
- Bem estruturado com títulos H2 (##) e H3 (###) quando necessário
- Conteúdo interessante, útil, atualizado e valioso para o leitor
- Use listas, parágrafos e formatação Markdown apropriadamente
- Inclua informações práticas e acionáveis quando relevante

FORMATO DE RESPOSTA (JSON válido apenas):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO e atraente)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres, que desperte interesse)",
  "content": "Conteúdo completo do post em Markdown, com títulos (## para H2, ### para H3), listas, parágrafos bem formatados, e formatação adequada",
  "seo_title": "Título otimizado para SEO (50-60 caracteres, incluindo palavras-chave principais)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres, que resuma o conteúdo e inclua call-to-action)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`

      for (const config of openaiConfigs) {
        const isGPT5 = config.model?.startsWith('gpt-5') || config.model === 'o1' || config.model === 'o1-preview' || config.model === 'o1-mini'
        await tx.table('ai_configs').update(config.id, {
          system_prompt: updatedSystemPrompt,
          user_prompt_template: updatedUserPromptTemplate,
          // Adicionar parâmetros GPT-5 se o modelo for GPT-5
          verbosity: isGPT5 ? (config.verbosity || 'medium') : config.verbosity,
          reasoning_effort: isGPT5 ? (config.reasoning_effort || 'medium') : config.reasoning_effort,
          updated_at: new Date().toISOString()
        })
      }

      // Atualizar prompts de configurações Perplexity existentes
      const perplexityConfigs = await tx.table('ai_configs')
        .where('provider').equals('perplexity')
        .toArray()
      
      const codeBlockNote = 'NÃO inclua markdown code blocks (```json ou ```), NÃO inclua texto antes ou depois do JSON.'
      
      const updatedPerplexitySystemPrompt = `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital com acesso a informações atualizadas da internet.
            Sua tarefa é criar conteúdo de alta qualidade, otimizado para SEO, bem estruturado, interessante e baseado em informações recentes e relevantes.
            IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido, sem nenhum texto adicional, sem markdown code blocks, sem explicações, sem comentários.
            Use informações atualizadas e relevantes da internet quando disponíveis para enriquecer o conteúdo.
            O formato da resposta deve ser um objeto JSON válido, começando diretamente com { e terminando com }.`
      
      const updatedPerplexityUserPromptTemplate = `Crie um post de blog completo e profissional em {language} sobre o tema: "{theme}"
{category}

INSTRUÇÕES DETALHADAS:
- Tono de escrita: {tone}
- Tamanho do conteúdo: {length}
- Otimizado para SEO (use palavras-chave estrategicamente, mas de forma natural)
- Bem estruturado com títulos H2 (##) e H3 (###) quando necessário
- Conteúdo interessante, útil, atualizado e valioso para o leitor
- Use informações recentes e relevantes da internet para enriquecer o conteúdo
- Use listas, parágrafos e formatação Markdown apropriadamente
- Inclua informações práticas e acionáveis quando relevante

IMPORTANTE: Responda APENAS com um objeto JSON válido. ${codeBlockNote} Comece diretamente com { e termine com }.

FORMATO DE RESPOSTA (JSON válido apenas):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO e atraente)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres, que desperte interesse)",
  "content": "Conteúdo completo do post em Markdown, com títulos (## para H2, ### para H3), listas, parágrafos bem formatados, e formatação adequada",
  "seo_title": "Título otimizado para SEO (50-60 caracteres, incluindo palavras-chave principais)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres, que resuma o conteúdo e inclua call-to-action)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`

      for (const config of perplexityConfigs) {
        await tx.table('ai_configs').update(config.id, {
          system_prompt: updatedPerplexitySystemPrompt,
          user_prompt_template: updatedPerplexityUserPromptTemplate,
          updated_at: new Date().toISOString()
        })
      }
    })
  }
}

// Instância do banco de dados
export const db = new WolfxDatabase()

// Funções auxiliares para operações comuns
export const databaseHelpers = {
  // Verificar se o usuário é admin
  async isAdmin(userId: string): Promise<boolean> {
    const user = await db.profiles.get(userId)
    return user?.role === 'admin'
  },

  // Obter perfil do usuário
  async getUserProfile(userId: string) {
    const user = await db.profiles.get(userId)
    if (!user) {
      return { data: null, error: { message: 'User not found' } }
    }
    return { data: user, error: null }
  },

  // Verificar conexão
  async testConnection() {
    try {
      const count = await db.profiles.count()
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error }
    }
  },

  // Inicializar banco de dados com dados padrão
  async initialize() {
    try {
      let admin: User | undefined

      // Verificar se já existe um admin com o email correto
      admin = await db.profiles.where('email').equals('wolfxweb@gmail.com').first()

      if (!admin) {
        // Verificar se existe algum admin
        const existingAdmin = await db.profiles.where('role').equals('admin').first()
        
        if (existingAdmin) {
          // Atualizar admin existente para o novo email e senha
          const defaultPassword = '@wolfx2020'
          const passwordHash = await hashPassword(defaultPassword)
          
          await db.profiles.update(existingAdmin.id, {
            email: 'wolfxweb@gmail.com',
            name: 'Administrador',
            password_hash: passwordHash,
            status: 'active',
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          
          admin = await db.profiles.get(existingAdmin.id)
          console.log('✅ Admin atualizado: wolfxweb@gmail.com')
        } else {
          // Criar novo admin padrão
          const adminId = crypto.randomUUID()
          const defaultPassword = '@wolfx2020'
          
          // Hash simples da senha (em produção, use bcrypt)
          const passwordHash = await hashPassword(defaultPassword)
          
          admin = {
            id: adminId,
            email: 'wolfxweb@gmail.com',
            name: 'Administrador',
            role: 'admin',
            status: 'active',
            password_hash: passwordHash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          await db.profiles.add(admin)
          console.log('✅ Admin padrão criado: wolfxweb@gmail.com / @wolfx2020')
        }
      } else {
        // Garantir que o admin está ativo e tem role admin
        if (admin.status !== 'active' || admin.role !== 'admin') {
          await db.profiles.update(admin.id, {
            status: 'active',
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          admin = await db.profiles.get(admin.id)
          console.log('✅ Admin atualizado para ativo')
        }
      }

      // Criar categorias padrão se não existirem
      const categoryCount = await db.categories.count()
      let categoryIds: { [key: string]: string } = {}
      
      if (categoryCount === 0) {
        const categories = [
          {
            id: crypto.randomUUID(),
            name: 'Tecnologia',
            slug: 'tecnologia',
            description: 'Artigos sobre tecnologia',
            created_by: admin.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: 'Inteligência Artificial',
            slug: 'inteligencia-artificial',
            description: 'Artigos sobre IA',
            created_by: admin.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            name: 'Automação',
            slug: 'automacao',
            description: 'Artigos sobre automação de processos',
            created_by: admin.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        
        await db.categories.bulkAdd(categories)
        
        // Guardar IDs das categorias para criar posts
        categories.forEach(cat => {
          categoryIds[cat.slug] = cat.id
        })
        
        console.log('✅ Categorias padrão criadas')
      } else {
        // Se as categorias já existem, buscar seus IDs
        const categories = await db.categories.toArray()
        categories.forEach(cat => {
          categoryIds[cat.slug] = cat.id
        })
      }

      // Criar posts de exemplo se não existirem
      const postsCount = await db.blog_posts.count()
      if (postsCount === 0 && admin && Object.keys(categoryIds).length > 0) {
        const examplePosts = [
          {
            id: crypto.randomUUID(),
            title: 'Bem-vindo ao Blog da Wolfx',
            slug: 'bem-vindo-ao-blog-da-wolfx',
            content: `<h1>Bem-vindo ao Blog da Wolfx!</h1><p>Este é o primeiro post do nosso blog sobre Inteligência Artificial e Automação de Processos.</p><p>Neste espaço, compartilhamos conhecimento, dicas e novidades sobre tecnologia, IA e automação.</p><h2>O que você vai encontrar aqui?</h2><ul><li>Artigos sobre Inteligência Artificial</li><li>Dicas de Automação de Processos</li><li>Tutoriais e Guias</li><li>Novidades do mundo da tecnologia</li></ul><p>Fique ligado para mais conteúdo!</p>`,
            excerpt: 'Bem-vindo ao blog da Wolfx! Descubra conteúdo sobre IA e automação.',
            status: 'published' as const,
            category_id: categoryIds['inteligencia-artificial'] || categoryIds['tecnologia'],
            author_id: admin.id,
            tags: ['inteligencia-artificial', 'automação', 'tecnologia'],
            seo_title: 'Bem-vindo ao Blog da Wolfx - IA e Automação',
            seo_description: 'Descubra conteúdo sobre Inteligência Artificial e Automação de Processos no blog da Wolfx.',
            seo_keywords: ['IA', 'inteligência artificial', 'automação', 'tecnologia'],
            meta_robots: 'index,follow',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            title: 'Como a IA está Transformando os Negócios',
            slug: 'como-a-ia-esta-transformando-os-negocios',
            content: `<h1>Como a Inteligência Artificial está Transformando os Negócios</h1><p>A Inteligência Artificial (IA) está revolucionando a forma como as empresas operam e tomam decisões.</p><h2>Principais Benefícios</h2><ul><li><strong>Automação de Processos:</strong> Reduzindo tarefas repetitivas e aumentando a eficiência.</li><li><strong>Análise de Dados:</strong> Transformando grandes volumes de dados em insights acionáveis.</li><li><strong>Personalização:</strong> Oferecendo experiências personalizadas para cada cliente.</li><li><strong>Tomada de Decisão:</strong> Apoiando decisões estratégicas com dados precisos.</li></ul><h2>Onde Começar?</h2><p>Para começar a aproveitar os benefícios da IA, é importante:</p><ol><li>Identificar processos que podem ser automatizados</li><li>Analisar os dados disponíveis</li><li>Escolher as ferramentas certas</li><li>Implementar de forma gradual</li></ol><p>A Wolfx está aqui para ajudar você nessa jornada!</p>`,
            excerpt: 'Descubra como a IA está transformando os negócios e aumentando a eficiência operacional.',
            status: 'published' as const,
            category_id: categoryIds['inteligencia-artificial'] || categoryIds['tecnologia'],
            author_id: admin.id,
            tags: ['IA', 'negócios', 'transformação digital'],
            seo_title: 'Como a IA está Transformando os Negócios - Wolfx',
            seo_description: 'Descubra como a Inteligência Artificial está revolucionando os negócios e aumentando a eficiência.',
            seo_keywords: ['IA', 'inteligência artificial', 'negócios', 'transformação digital'],
            meta_robots: 'index,follow',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
            updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        
        await db.blog_posts.bulkAdd(examplePosts)
        console.log('✅ Posts de exemplo criados')
      }

      // Inicializar configurações de IA se não existirem
      await initializeAIConfigs(admin?.id || 'system')
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error)
    }
  }
}

/**
 * Inicializa configurações de IA no banco de dados
 */
async function initializeAIConfigs(createdBy: string) {
  try {
    const configCount = await db.ai_configs.count()
    
    if (configCount === 0) {
      // Verificar se existem chaves de API no .env e criar configurações padrão
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
      const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY

      const configsToAdd: AIConfig[] = []

      if (openaiKey) {
        configsToAdd.push({
          id: crypto.randomUUID(),
          provider: 'openai',
          name: 'OpenAI (Padrão)',
          api_key: openaiKey,
          model: 'gpt-5', // Usar GPT-5 como padrão
          temperature: 0.7,
          max_tokens: 2000,
          verbosity: 'medium', // Parâmetro específico do GPT-5
          reasoning_effort: 'medium', // Parâmetro específico do GPT-5
          enabled: true,
          is_default: true,
          system_prompt: `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital com anos de experiência.
            Sua missão é criar conteúdo de alta qualidade, otimizado para SEO, bem estruturado, interessante e valioso para o leitor.
            IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido no formato especificado abaixo, sem nenhum texto adicional, sem explicações, sem markdown code blocks.
            O JSON deve começar diretamente com { e terminar com }.`,
          user_prompt_template: `Crie um post de blog completo e profissional em {language} sobre o tema: "{theme}"
{category}

INSTRUÇÕES DETALHADAS:
- Tono de escrita: {tone}
- Tamanho do conteúdo: {length}
- Otimizado para SEO (use palavras-chave estrategicamente, mas de forma natural)
- Bem estruturado com títulos H2 (##) e H3 (###) quando necessário
- Conteúdo interessante, útil, atualizado e valioso para o leitor
- Use listas, parágrafos e formatação Markdown apropriadamente
- Inclua informações práticas e acionáveis quando relevante

FORMATO DE RESPOSTA (JSON válido apenas):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO e atraente)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres, que desperte interesse)",
  "content": "Conteúdo completo do post em Markdown, com títulos (## para H2, ### para H3), listas, parágrafos bem formatados, e formatação adequada",
  "seo_title": "Título otimizado para SEO (50-60 caracteres, incluindo palavras-chave principais)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres, que resuma o conteúdo e inclua call-to-action)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`,
          created_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      if (perplexityKey) {
        const codeBlockNote = 'NÃO inclua markdown code blocks (```json ou ```), NÃO inclua texto antes ou depois do JSON.'
        configsToAdd.push({
          id: crypto.randomUUID(),
          provider: 'perplexity',
          name: 'Perplexity AI (Padrão)',
          api_key: perplexityKey,
          model: 'sonar-pro',
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
          enabled: true,
          is_default: true,
          system_prompt: `Você é um especialista em criação de conteúdo para blog, SEO e marketing digital com acesso a informações atualizadas da internet.
            Sua tarefa é criar conteúdo de alta qualidade, otimizado para SEO, bem estruturado, interessante e baseado em informações recentes e relevantes.
            IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido, sem nenhum texto adicional, sem markdown code blocks, sem explicações, sem comentários.
            Use informações atualizadas e relevantes da internet quando disponíveis para enriquecer o conteúdo.
            O formato da resposta deve ser um objeto JSON válido, começando diretamente com { e terminando com }.`,
          user_prompt_template: `Crie um post de blog completo e profissional em {language} sobre o tema: "{theme}"
{category}

INSTRUÇÕES DETALHADAS:
- Tono de escrita: {tone}
- Tamanho do conteúdo: {length}
- Otimizado para SEO (use palavras-chave estrategicamente, mas de forma natural)
- Bem estruturado com títulos H2 (##) e H3 (###) quando necessário
- Conteúdo interessante, útil, atualizado e valioso para o leitor
- Use informações recentes e relevantes da internet para enriquecer o conteúdo
- Use listas, parágrafos e formatação Markdown apropriadamente
- Inclua informações práticas e acionáveis quando relevante

IMPORTANTE: Responda APENAS com um objeto JSON válido. ${codeBlockNote} Comece diretamente com { e termine com }.

FORMATO DE RESPOSTA (JSON válido apenas):
{
  "title": "Título do post (60-70 caracteres, otimizado para SEO e atraente)",
  "excerpt": "Resumo curto e atraente do post (150-200 caracteres, que desperte interesse)",
  "content": "Conteúdo completo do post em Markdown, com títulos (## para H2, ### para H3), listas, parágrafos bem formatados, e formatação adequada",
  "seo_title": "Título otimizado para SEO (50-60 caracteres, incluindo palavras-chave principais)",
  "seo_description": "Meta descrição otimizada para SEO (150-160 caracteres, que resuma o conteúdo e inclua call-to-action)",
  "seo_keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`,
          created_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      // Criar configuração de imagem se houver API key OpenAI (DALL-E usa a mesma API key)
      if (openaiKey) {
        configsToAdd.push({
          id: crypto.randomUUID(),
          provider: 'image',
          name: 'DALL-E 3 (Padrão)',
          api_key: openaiKey,
          model: 'dall-e-3',
          image_size: '1024x1024',
          image_quality: 'standard',
          image_prompt_template: `Crie uma imagem profissional e atraente para um post de blog sobre: "{title}". 
{excerpt}
{category}

A imagem deve ser:
- Profissional e moderna
- Visualmente atraente e chamativa
- Relacionada ao tema do post
- Adequada para uso em blog (formato horizontal, estilo editorial)
- Sem texto ou logos sobrepostos
- Estilo realista ou ilustração profissional
- Paleta de cores harmoniosa e profissional`,
          enabled: true,
          is_default: true,
          created_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      if (configsToAdd.length > 0) {
        await db.ai_configs.bulkAdd(configsToAdd)
        console.log(`✅ ${configsToAdd.length} configuração(ões) de IA criada(s)`)
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar configurações de IA:', error)
  }
}

// Função para hash de senha (simples - em produção use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Exportar função de hash para uso em outros lugares
export async function hashPasswordFunction(password: string): Promise<string> {
  return hashPassword(password)
}

// Função para verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Inicializar banco de dados quando o módulo é carregado
databaseHelpers.initialize()

