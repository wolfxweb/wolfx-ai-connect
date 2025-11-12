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

// Classe do banco de dados
export class WolfxDatabase extends Dexie {
  users!: Table<User, string>
  profiles!: Table<User, string>
  categories!: Table<Category, string>
  blog_posts!: Table<BlogPost, string>
  comments!: Table<Comment, string>

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
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error)
    }
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

