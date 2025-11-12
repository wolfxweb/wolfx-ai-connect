import { createClient } from '@supabase/supabase-js'

// Configuração para Supabase externo (WolfX)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.wolfx.com.br'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.lwJ6DOlWntSiaCw8_I_m3YHKSn8wKlL_wjwWod67jQY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'user'
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
  status: 'draft' | 'published' | 'archived'
  category_id: string
  author_id: string
  tags?: string[]
  created_at: string
  updated_at: string
  published_at?: string
}

// Funções auxiliares para o Supabase
export const supabaseHelpers = {
  // Verificar se o usuário é admin
  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    return data?.role === 'admin'
  },

  // Obter perfil do usuário
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Verificar conexão
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      return { success: !error, error }
    } catch (error) {
      return { success: false, error }
    }
  }
}
