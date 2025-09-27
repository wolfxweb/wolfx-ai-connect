import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  isAdmin: boolean
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

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
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
            email: user.email,
            name: user.user_metadata?.name || '',
            role: 'user',
          },
        ])

      if (error) {
        console.error('Error creating user profile:', error)
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Verificar se o usuário é admin
  const isAdmin = user?.user_metadata?.role === 'admin' || false

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
