import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, Session } from '@/lib/auth'
import { db, User as UserType } from '@/lib/database'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
}

interface AuthContextType {
  user: UserType | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any; message?: string }>
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
  const [user, setUser] = useState<UserType | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 Fetching user profile for ID:', userId)
      const userData = await db.profiles.get(userId)

      if (!userData) {
        console.error('❌ User profile not found')
        return null
      }

      const profile: UserProfile = {
        id: userData.id,
        name: userData.name || '',
        email: userData.email,
        role: userData.role,
        status: userData.status
      }

      console.log('✅ User profile loaded:', profile)
      setUserProfile(profile)
      return profile
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      return null
    }
  }

  useEffect(() => {
    // Obter sessão inicial
    const currentSession = auth.getSession()
    
    if (currentSession) {
      setSession(currentSession)
      setUser(currentSession.user)
      fetchUserProfile(currentSession.user.id)
      }
      
      setLoading(false)
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await auth.signUp(email, password, name)
      
      if (result.error) {
        return result
      }

      // NÃO fazer login automaticamente após registro
      // Usuários inativos precisam ser ativados por um admin antes de poderem fazer login
      // Retornar mensagem informando que a conta foi criada mas precisa ser ativada
          return { 
        error: null,
        message: 'Conta criada com sucesso! Sua conta precisa ser ativada por um administrador antes de você poder fazer login.'
            } 
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
      
      const result = await auth.signIn(email, password)
      
      if (result.error) {
        console.error('❌ Login error:', result.error)
        return result
      }
      
      console.log('✅ Login successful')
      
      if (result.data) {
        setSession(result.data)
        setUser(result.data.user)
        await fetchUserProfile(result.data.user.id)
      }
      
      return result
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
    try {
      const result = await auth.signOut()
      setSession(null)
      setUser(null)
      setUserProfile(null)
      return result
    } catch (error: any) {
    return { error }
    }
  }

  // Permissões baseadas no role e status
  const isLoggedIn = !!user && userProfile?.status === 'active'
  
  // Apenas admins ativos podem acessar o painel admin
  const canAccessAdmin = isLoggedIn && userProfile?.role === 'admin'
  
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
