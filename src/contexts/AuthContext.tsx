import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  name: string
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  userProfile: UserProfile | null
  canAccessAdmin: boolean
  canManageUsers: boolean
  canManageCategories: boolean
  canManagePosts: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 Fetching user profile for ID:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      console.log('✅ User profile loaded:', data)
      setUserProfile(data)
      return data
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      return null
    }
  }

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', { event, hasUser: !!session?.user })
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Só buscar perfil se não for um evento de SIGNED_IN (para evitar condição de corrida)
      if (session?.user && event !== 'SIGNED_IN') {
        await fetchUserProfile(session.user.id)
      } else if (!session?.user) {
        setUserProfile(null)
      }
      
      setLoading(false)

      // Se for um novo usuário, criar perfil
      if (event === 'SIGNED_UP' && session?.user) {
        await createUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            name: user.user_metadata?.name || '',
            role: 'user',
            status: 'active',
          },
        ])

      if (error) {
        console.error('Error creating user profile:', error)
      } else {
        console.log('User profile created successfully')
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
          },
        },
      })
      
      if (error) {
        // Tratar erros específicos
        if (error.message.includes('Email signups are disabled') || 
            error.message.includes('signup is disabled') ||
            error.message.includes('Signup is disabled')) {
          return { 
            error: { 
              message: 'Registro temporariamente indisponível. Execute o script fix-email-signup.sql no Supabase ou tente novamente em alguns minutos.' 
            } 
          }
        }
        if (error.message.includes('User already registered')) {
          return { 
            error: { 
              message: 'Este email já está cadastrado. Tente fazer login ou use outro email.' 
            } 
          }
        }
        if (error.message.includes('Password should be at least')) {
          return { 
            error: { 
              message: 'A senha deve ter pelo menos 8 caracteres e conter letras maiúsculas, minúsculas e números.' 
            } 
          }
        }
      }
      
      return { error }
    } catch (err: any) {
      return { 
        error: { 
          message: 'Erro inesperado ao criar conta. Tente novamente.' 
        } 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🚀 Starting signIn process...', { email })
      console.log('🔧 Supabase config:', { 
        url: supabase.supabaseUrl, 
        hasAnonKey: !!supabase.supabaseKey 
      })
      
      console.log('📞 Calling supabase.auth.signInWithPassword...')
      
      // Adicionar timeout para evitar travamento
      const authResponse = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        )
      ])
      
      console.log('📡 Supabase auth response received:', { 
        hasData: !!authResponse.data, 
        hasError: !!authResponse.error,
        data: authResponse.data,
        error: authResponse.error 
      })
      
      const { data, error } = authResponse
      
      if (error) {
        console.error('❌ Login error:', error)
        return { error }
      }
      
      console.log('✅ Login successful, checking user data...')
      
      // Se login foi bem-sucedido, buscar o perfil do usuário
      if (data && data.user) {
        console.log('👤 User found, fetching profile...', { userId: data.user.id })
        // Aguardar um pouco para o onAuthStateChange processar
        await new Promise(resolve => setTimeout(resolve, 100))
        const profile = await fetchUserProfile(data.user.id)
        console.log('📋 Profile fetch result:', profile)
      } else {
        console.warn('⚠️ Login successful but no user data received', { data })
      }
      
      console.log('🏁 SignIn process completed')
      return { error }
    } catch (err: any) {
      console.error('💥 Login exception:', err)
      return { 
        error: { 
          message: 'Erro inesperado ao fazer login. Tente novamente.' 
        } 
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Permissões baseadas no role e status
  const isLoggedIn = !!user && userProfile?.status === 'active'
  
  // Todos os usuários logados podem acessar o admin
  const canAccessAdmin = isLoggedIn
  
  // Apenas admins podem gerenciar usuários
  const canManageUsers = isLoggedIn && userProfile?.role === 'admin'
  
  // Admins e moderadores podem gerenciar categorias
  const canManageCategories = isLoggedIn && (userProfile?.role === 'admin' || userProfile?.role === 'moderator')
  
  // Todos os usuários logados podem gerenciar seus próprios posts, admins podem gerenciar todos
  const canManagePosts = isLoggedIn

  // Debug logs
  console.log('🔍 Auth Debug:', {
    user: user?.email,
    userProfile,
    isLoggedIn,
    canAccessAdmin,
    canManageUsers
  })

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    userProfile,
    canAccessAdmin,
    canManageUsers,
    canManageCategories,
    canManagePosts,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
