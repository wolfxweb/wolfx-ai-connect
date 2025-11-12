import { db, hashPasswordFunction, verifyPassword, User } from './database'

// Gerar UUID simples
function generateUUID(): string {
  return crypto.randomUUID()
}

// Interface para sessão
export interface Session {
  user: User
  access_token: string
  expires_at: number
}

// Armazenar sessão no localStorage
const SESSION_KEY = 'wolfx_session'

// Criar sessão (função auxiliar)
async function createSession(user: User): Promise<Session> {
  const session: Session = {
    user,
    access_token: generateUUID(),
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
  }

  // Salvar sessão no localStorage
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return session
}

// Obter sessão atual (função auxiliar)
function getSession(): Session | null {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY)
    if (!sessionStr) return null

    const session: Session = JSON.parse(sessionStr)

    // Verificar se a sessão expirou
    if (session.expires_at < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch (error) {
    console.error('Erro ao obter sessão:', error)
    return null
  }
}

export const auth = {
  // Registrar novo usuário
  async signUp(email: string, password: string, name?: string): Promise<{ error: any }> {
    try {
      // Verificar se o email já existe
      const existingUser = await db.profiles.where('email').equals(email).first()
      
      if (existingUser) {
        return {
          error: {
            message: 'Este email já está cadastrado. Tente fazer login ou use outro email.'
          }
        }
      }

      // Validar senha
      if (password.length < 8) {
        return {
          error: {
            message: 'A senha deve ter pelo menos 8 caracteres.'
          }
        }
      }

      // Criar hash da senha
      const passwordHash = await hashPasswordFunction(password)

      // Criar usuário
      const userId = generateUUID()
      const user: User = {
        id: userId,
        email,
        name: name || '',
        role: 'user',
        status: 'inactive', // Novos usuários são criados como inativos
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Salvar no banco
      await db.profiles.add(user)

      // NÃO criar sessão para usuários inativos
      // Usuários inativos precisam ser ativados por um admin antes de poderem fazer login

      return { error: null }
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error)
      return {
        error: {
          message: 'Erro inesperado ao criar conta. Tente novamente.'
        }
      }
    }
  },

  // Fazer login
  async signIn(email: string, password: string): Promise<{ error: any; data?: Session }> {
    try {
      // Buscar usuário
      const user = await db.profiles.where('email').equals(email).first()

      if (!user) {
        return {
          error: {
            message: 'Email ou senha incorretos.'
          }
        }
      }

      // Verificar senha
      const isValid = await verifyPassword(password, user.password_hash)

      if (!isValid) {
        return {
          error: {
            message: 'Email ou senha incorretos.'
          }
        }
      }

      // Verificar se o usuário está ativo
      if (user.status !== 'active') {
        return {
          error: {
            message: 'Sua conta está inativa. Entre em contato com o administrador.'
          }
        }
      }

      // Criar sessão
      const session = await createSession(user)

      return { error: null, data: session }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      return {
        error: {
          message: 'Erro inesperado ao fazer login. Tente novamente.'
        }
      }
    }
  },

  // Obter sessão atual
  getSession(): Session | null {
    return getSession()
  },

  // Fazer logout
  async signOut(): Promise<{ error: any }> {
    try {
      localStorage.removeItem(SESSION_KEY)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    const session = getSession()
    return session !== null
  },

  // Obter usuário atual
  getCurrentUser(): User | null {
    const session = getSession()
    return session?.user || null
  }
}

