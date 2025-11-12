// Wrapper compatível com Supabase usando IndexedDB local
// Este arquivo mantém a compatibilidade com o código existente
// mas usa IndexedDB (Dexie) em vez de Supabase

import { db, User, Category, BlogPost, Comment } from './database'
import { auth } from './auth'

// Re-exportar tipos do database para compatibilidade
export type { 
  User, 
  Category, 
  BlogPost, 
  Comment 
} from './database'

// Classe para simular a API do Supabase
class SupabaseLikeClient {
  // Método para acessar tabelas
  from(tableName: string) {
    return new SupabaseLikeQuery(tableName)
  }

  // Método para autenticação (compatibilidade)
  auth = {
    getSession: async () => {
      const session = auth.getSession()
      return {
        data: {
          session: session ? {
            user: session.user,
            access_token: session.access_token
          } : null
        },
        error: null
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simular mudanças de autenticação
      const session = auth.getSession()
      if (session) {
        callback('SIGNED_IN', {
          user: session.user,
          access_token: session.access_token
        })
      }
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    },
    signUp: async (credentials: { email: string; password: string; options?: { data?: { name?: string } } }) => {
      const result = await auth.signUp(
        credentials.email,
        credentials.password,
        credentials.options?.data?.name
      )
      
      if (result.error) {
        return { data: null, error: result.error }
      }
      
      const session = auth.getSession()
      return {
        data: {
          user: session?.user || null,
          session: session ? {
            user: session.user,
            access_token: session.access_token
          } : null
        },
        error: null
      }
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      const result = await auth.signIn(credentials.email, credentials.password)
      
      if (result.error) {
        return { data: null, error: result.error }
      }
      
      return {
        data: {
          user: result.data?.user || null,
          session: result.data ? {
            user: result.data.user,
            access_token: result.data.access_token
          } : null
        },
        error: null
      }
    },
    signOut: async () => {
      const result = await auth.signOut()
      return { error: result.error }
    },
    getUser: async () => {
      const session = auth.getSession()
      return {
        data: {
          user: session?.user || null
        },
        error: null
      }
    }
  }
}

// Classe para simular queries do Supabase
class SupabaseLikeQuery {
  private tableName: string
  private filters: any[] = []
  private orderByField: string | null = null
  private orderAscending: boolean = true
  private limitCount: number | null = null
  private offsetCount: number = 0
  private selectFields: string[] = ['*']
  private countMode: boolean = false
  private singleMode: boolean = false
  private _executePromise: Promise<{ data: any; error: any }> | null = null
  private operationType: 'select' | 'insert' | 'update' | 'delete' = 'select'

  constructor(tableName: string) {
    this.tableName = tableName
  }

  select(fields: string, options?: { count?: 'exact' }) {
    // Se count: 'exact' foi especificado, marcar para incluir count no resultado
    // Mas não deixar countMode = true, pois queremos retornar data também
    if (options?.count === 'exact') {
      (this as any)._includeCount = true
    }
    
    if (fields === '*') {
      this.selectFields = ['*']
    } else {
      this.selectFields = fields.split(',').map(f => f.trim())
    }
    return this
  }

  eq(field: string, value: any) {
    this.filters.push({ type: 'eq', field, value })
    return this
  }

  neq(field: string, value: any) {
    this.filters.push({ type: 'neq', field, value })
    return this
  }

  in(field: string, values: any[]) {
    this.filters.push({ type: 'in', field, values })
    return this
  }

  ilike(field: string, pattern: string) {
    this.filters.push({ type: 'ilike', field, pattern })
    return this
  }

  or(condition: string) {
    // Implementação simplificada de OR
    this.filters.push({ type: 'or', condition })
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = field
    // Se options.ascending é false, então ascending é false
    // Se options.ascending é undefined ou true, então ascending é true
    this.orderAscending = options?.ascending === false ? false : true
    console.log(`📊 [${this.tableName}] Ordenação configurada: campo=${field}, ascending=${this.orderAscending}`)
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(from: number, to: number) {
    this.offsetCount = from
    this.limitCount = to - from + 1
    return this
  }

  single() {
    this.singleMode = true
    this.limitCount = 1
    return this
  }

  // Tornar o objeto "thenable" para suportar await diretamente
  // Isso permite usar await diretamente em queries encadeadas
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    // Executar a operação apropriada baseada no tipo
    let promise: Promise<{ data: any; error: any }>
    
    if (this.operationType === 'delete') {
      promise = this.deleteExecute()
    } else if (this.operationType === 'insert') {
      const values = (this as any)._insertValues
      promise = this.insertExecute(values)
    } else if (this.operationType === 'update') {
      const values = (this as any)._updateValues
      promise = this.updateExecute(values)
    } else {
      promise = this.execute()
    }
    
    return promise.then(onfulfilled, onrejected)
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      console.log(`🔍 [${this.tableName}] Executando query`, {
        filters: this.filters.length,
        orderBy: this.orderByField,
        selectFields: this.selectFields,
        limitCount: this.limitCount,
        singleMode: this.singleMode
      })

      let query: any

      switch (this.tableName) {
        case 'profiles':
        case 'users':
          query = db.profiles.toCollection()
          break
        case 'categories':
          query = db.categories.toCollection()
          break
        case 'blog_posts':
          query = db.blog_posts.toCollection()
          break
        case 'comments':
          query = db.comments.toCollection()
          break
        default:
          console.error(`❌ Tabela ${this.tableName} não encontrada`)
          return { data: null, error: { message: `Table ${this.tableName} not found` } }
      }

      // Buscar todos os dados da tabela primeiro
      let data = await query.toArray()
      console.log(`📊 [${this.tableName}] Total de registros antes dos filtros: ${data.length}`)

      // Aplicar filtros
      for (const filter of this.filters) {
        switch (filter.type) {
          case 'eq':
            data = data.filter((item: any) => item[filter.field] === filter.value)
            break
          case 'neq':
            data = data.filter((item: any) => item[filter.field] !== filter.value)
            break
          case 'in':
            data = data.filter((item: any) => filter.values.includes(item[filter.field]))
            break
          case 'ilike':
            const pattern = filter.pattern.replace(/%/g, '.*')
            const regex = new RegExp(pattern, 'i')
            data = data.filter((item: any) => regex.test(item[filter.field] || ''))
            break
          case 'or':
            // Implementação simplificada - apenas para casos básicos
            const conditions = filter.condition.split(',').map((c: string) => c.trim())
            data = data.filter((item: any) => {
              return conditions.some((condition: string) => {
                // Formato: field.ilike.%value%
                const match = condition.match(/(\w+)\.ilike\.%(.+)%/)
                if (match) {
                  const field = match[1]
                  const value = match[2]
                  return new RegExp(value, 'i').test(item[field] || '')
                }
                return false
              })
            })
            break
        }
      }

      // Aplicar ordenação
      if (this.orderByField) {
        console.log(`📊 [${this.tableName}] Ordenando por ${this.orderByField}, ascending: ${this.orderAscending}`)
        data.sort((a: any, b: any) => {
          const aVal = a[this.orderByField!]
          const bVal = b[this.orderByField!]
          
          // Tratar valores nulos/undefined
          if (aVal == null && bVal == null) return 0
          if (aVal == null) return 1
          if (bVal == null) return -1
          
          // Comparar valores (strings ou números)
          let comparison = 0
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            comparison = aVal.localeCompare(bVal)
          } else {
            comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          }
          
          // Se ascending é false, inverter a comparação
          return this.orderAscending ? comparison : -comparison
        })
        console.log(`✅ [${this.tableName}] Ordenação aplicada: ${data.length} registros`)
      }

      // Aplicar paginação
      if (this.offsetCount > 0) {
        data = data.slice(this.offsetCount)
      }
      if (this.limitCount !== null) {
        data = data.slice(0, this.limitCount)
      }

      // Aplicar seleção de campos
      if (this.selectFields.length > 0 && this.selectFields[0] !== '*') {
        data = data.map((item: any) => {
          const selected: any = {}
          this.selectFields.forEach(field => {
            selected[field] = item[field]
          })
          return selected
        })
      }

      // Se count mode (apenas count, sem data), retornar apenas a contagem
      if (this.countMode) {
        return { data: null, error: null, count: data.length }
      }

      // Se single() foi chamado, retornar apenas o primeiro item ou null
      if (this.singleMode) {
        if (data.length > 0) {
          console.log(`✅ Single result encontrado em ${this.tableName}`)
          // Se includeCount foi solicitado, incluir count também
          if ((this as any)._includeCount) {
            // Buscar total antes da paginação para o count
            let allData = await query.toArray()
            for (const filter of this.filters) {
              switch (filter.type) {
                case 'eq':
                  allData = allData.filter((item: any) => item[filter.field] === filter.value)
                  break
                case 'in':
                  allData = allData.filter((item: any) => filter.values.includes(item[filter.field]))
                  break
                case 'ilike':
                  const pattern = filter.pattern.replace(/%/g, '.*')
                  const regex = new RegExp(pattern, 'i')
                  allData = allData.filter((item: any) => regex.test(item[filter.field] || ''))
                  break
                case 'or':
                  const conditions = filter.condition.split(',').map((c: string) => c.trim())
                  allData = allData.filter((item: any) => {
                    return conditions.some((condition: string) => {
                      const match = condition.match(/(\w+)\.ilike\.%(.+)%/)
                      if (match) {
                        const field = match[1]
                        const value = match[2]
                        return new RegExp(value, 'i').test(item[field] || '')
                      }
                      return false
                    })
                  })
                  break
              }
            }
            return { data: data[0], error: null, count: allData.length }
          }
          return { data: data[0], error: null }
        } else {
          console.log(`⚠️ Single result não encontrado em ${this.tableName}`)
          return { data: null, error: { message: 'No rows found' } }
        }
      }

      console.log(`✅ Query executada com sucesso em ${this.tableName}: ${data.length} registros`)
      
      // Se includeCount foi solicitado (via select('*', { count: 'exact' })), incluir count no resultado
      if ((this as any)._includeCount) {
        // Buscar todos os dados novamente para calcular o count total (antes da paginação)
        let allData = await query.toArray()
        
        // Aplicar os mesmos filtros que foram aplicados aos dados (mas sem paginação)
        for (const filter of this.filters) {
          switch (filter.type) {
            case 'eq':
              allData = allData.filter((item: any) => item[filter.field] === filter.value)
              break
            case 'neq':
              allData = allData.filter((item: any) => item[filter.field] !== filter.value)
              break
            case 'in':
              allData = allData.filter((item: any) => filter.values.includes(item[filter.field]))
              break
            case 'ilike':
              const pattern = filter.pattern.replace(/%/g, '.*')
              const regex = new RegExp(pattern, 'i')
              allData = allData.filter((item: any) => regex.test(item[filter.field] || ''))
              break
            case 'or':
              const conditions = filter.condition.split(',').map((c: string) => c.trim())
              allData = allData.filter((item: any) => {
                return conditions.some((condition: string) => {
                  const match = condition.match(/(\w+)\.ilike\.%(.+)%/)
                  if (match) {
                    const field = match[1]
                    const value = match[2]
                    return new RegExp(value, 'i').test(item[field] || '')
                  }
                  return false
                })
              })
              break
          }
        }
        
        const totalCount = allData.length
        console.log(`📊 [${this.tableName}] Total count: ${totalCount}, Data length: ${data.length}`)
        return { data, error: null, count: totalCount }
      }
      
      return { data, error: null }
    } catch (error: any) {
      console.error(`❌ Erro ao executar query em ${this.tableName}:`, error)
      return { data: null, error }
    }
  }

  insert(values: any[] | any) {
    // Armazenar os valores para uso no then()
    (this as any)._insertValues = values
    this.operationType = 'insert'
    return this
  }

  async insertExecute(values: any[] | any): Promise<{ data: any; error: any }> {
    try {
      const table = (db as any)[this.tableName]
      if (!table) {
        return { data: null, error: { message: `Table ${this.tableName} not found` } }
      }

      // Normalizar para array
      const valuesArray = Array.isArray(values) ? values : [values]

      // Adicionar IDs e timestamps
      const records = valuesArray.map((value: any) => {
        const record: any = {
          ...value,
          id: value.id || crypto.randomUUID(),
          created_at: value.created_at || new Date().toISOString(),
          updated_at: value.updated_at || new Date().toISOString()
        }

        // Campos específicos por tabela
        if (this.tableName === 'blog_posts' && !record.published_at && record.status === 'published') {
          record.published_at = new Date().toISOString()
        }

        if (this.tableName === 'comments') {
          record.status = record.status || 'pending'
          record.ip_address = record.ip_address || null
          record.user_agent = record.user_agent || null
          record.approved_at = record.approved_at || null
          record.approved_by = record.approved_by || null
        }

        // Campos específicos para categorias
        if (this.tableName === 'categories') {
          // Garantir que created_by existe (obrigatório)
          if (!record.created_by) {
            // Tentar obter o usuário atual da sessão
            const session = auth.getSession()
            if (session?.user?.id) {
              record.created_by = session.user.id
            } else {
              // Se não houver usuário, usar 'system' como fallback
              record.created_by = 'system'
            }
          }
        }

        return record
      })

      // Se for apenas um registro, usar add, senão bulkAdd
      if (records.length === 1) {
        try {
          console.log(`💾 [${this.tableName}] Inserindo registro:`, records[0])
          await table.add(records[0])
          
          // Aguardar um pouco para garantir que o IndexedDB foi atualizado
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Buscar o registro recém-criado para garantir que foi salvo corretamente
          const saved = await table.get(records[0].id)
          if (saved) {
            console.log(`✅ [${this.tableName}] Registro inserido e verificado:`, saved)
            
            // Verificar quantos registros existem agora na tabela
            const total = await table.count()
            console.log(`📊 [${this.tableName}] Total de registros após inserção: ${total}`)
            
            return { data: saved, error: null }
          } else {
            console.error(`❌ [${this.tableName}] Erro: Registro não encontrado após inserção. ID: ${records[0].id}`)
            
            // Verificar todos os registros na tabela
            const allRecords = await table.toArray()
            console.log(`📊 [${this.tableName}] Todos os registros na tabela:`, allRecords)
            
            return { data: records[0], error: null }
          }
        } catch (addError: any) {
          console.error(`❌ [${this.tableName}] Erro ao inserir:`, addError)
          // Se for erro de chave duplicada, buscar o registro existente
          if (addError.name === 'ConstraintError' || addError.message?.includes('already exists')) {
            const existing = await table.get(records[0].id)
            if (existing) {
              console.log(`⚠️ [${this.tableName}] Registro já existe, retornando existente`)
              return { data: existing, error: null }
            }
          }
          throw addError
        }
      } else {
        console.log(`💾 [${this.tableName}] Inserindo ${records.length} registros`)
        await table.bulkAdd(records)
        
        // Aguardar um pouco para garantir que o IndexedDB foi atualizado
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Buscar os registros recém-criados
        const savedRecords = await Promise.all(
          records.map(record => table.get(record.id))
        )
        const validRecords = savedRecords.filter(Boolean)
        console.log(`✅ [${this.tableName}] ${validRecords.length}/${records.length} registros inseridos e verificados`)
        return { data: validRecords, error: null }
      }
    } catch (error: any) {
      console.error('Error inserting data:', error)
      // Se for erro de chave duplicada, tentar atualizar
      if (error.name === 'ConstraintError' || error.message?.includes('already exists')) {
        // Se houver apenas um registro e já existir, atualizar usando uma nova query
        const valuesArray = Array.isArray(values) ? values : [values]
        if (valuesArray.length === 1 && valuesArray[0].id) {
          const table = (db as any)[this.tableName]
          if (table) {
            try {
              await table.update(valuesArray[0].id, {
                ...valuesArray[0],
                updated_at: new Date().toISOString()
              })
              const updated = await table.get(valuesArray[0].id)
              return { data: updated, error: null }
            } catch (updateError) {
              console.error('Error updating existing record:', updateError)
            }
          }
        }
      }
      return { data: null, error }
    }
  }

  update(values: any) {
    // Armazenar os valores para uso no then()
    (this as any)._updateValues = values
    this.operationType = 'update'
    return this
  }

  async updateExecute(values: any): Promise<{ data: any; error: any }> {
    try {
      const table = (db as any)[this.tableName]
      if (!table) {
        return { data: null, error: { message: `Table ${this.tableName} not found` } }
      }

      // Aplicar filtros para encontrar registros
      let query: any = table.toCollection()
      let data = await query.toArray()

      for (const filter of this.filters) {
        switch (filter.type) {
          case 'eq':
            data = data.filter((item: any) => item[filter.field] === filter.value)
            break
          case 'in':
            data = data.filter((item: any) => filter.values.includes(item[filter.field]))
            break
        }
      }

      if (data.length === 0) {
        return { data: null, error: { message: 'No rows found to update' } }
      }

      // Atualizar registros
      const updatedRecords: any[] = []
      for (const item of data) {
        const updateData = {
          ...values,
          updated_at: new Date().toISOString()
        }

        // Campos específicos por tabela
        if (this.tableName === 'blog_posts') {
          // Se mudou para published e não tinha published_at, definir agora
          if (values.status === 'published' && !item.published_at) {
            updateData.published_at = new Date().toISOString()
          }
        }

        await table.update(item.id, updateData)
        
        // Buscar o registro atualizado
        const updated = await table.get(item.id)
        updatedRecords.push(updated)
      }

      // Se foi apenas um registro, retornar ele diretamente
      if (updatedRecords.length === 1) {
        return { data: updatedRecords[0], error: null }
      }

      return { data: updatedRecords, error: null }
    } catch (error: any) {
      console.error('Error updating data:', error)
      return { data: null, error }
    }
  }

  delete() {
    this.operationType = 'delete'
    return this
  }

  async deleteExecute(): Promise<{ data: any; error: any }> {
    try {
      console.log(`🗑️ [${this.tableName}] Iniciando exclusão`, {
        filters: this.filters.length,
        filtersDetail: this.filters
      })

      const table = (db as any)[this.tableName]
      if (!table) {
        console.error(`❌ [${this.tableName}] Tabela não encontrada`)
        return { data: null, error: { message: `Table ${this.tableName} not found` } }
      }

      // Aplicar filtros para encontrar registros
      let query: any = table.toCollection()
      let data = await query.toArray()
      console.log(`📊 [${this.tableName}] Total de registros antes dos filtros: ${data.length}`)

      for (const filter of this.filters) {
        switch (filter.type) {
          case 'eq':
            data = data.filter((item: any) => item[filter.field] === filter.value)
            console.log(`🔍 [${this.tableName}] Filtro eq(${filter.field}=${filter.value}): ${data.length} registros`)
            break
          case 'in':
            data = data.filter((item: any) => filter.values.includes(item[filter.field]))
            console.log(`🔍 [${this.tableName}] Filtro in(${filter.field}): ${data.length} registros`)
            break
        }
      }

      if (data.length === 0) {
        console.warn(`⚠️ [${this.tableName}] Nenhum registro encontrado para exclusão`)
        return { data: null, error: { message: 'No rows found to delete' } }
      }

      // Deletar registros
      const ids = data.map((item: any) => item.id)
      console.log(`🗑️ [${this.tableName}] Excluindo ${ids.length} registro(s):`, ids)

      // Para posts, verificar se há imagens para limpar
      if (this.tableName === 'blog_posts') {
        for (const post of data) {
          if (post.featured_image && post.featured_image.startsWith('data:')) {
            // A imagem está armazenada como base64 no próprio post
            // Quando o post é deletado, a imagem também é removida automaticamente
            const imageSize = Math.round((post.featured_image.length * 3) / 4)
            console.log(`📸 [${this.tableName}] Post tem imagem de ${Math.round(imageSize / 1024)}KB que será removida com o post`)
          }
        }
      }

      if (ids.length === 1) {
        await table.delete(ids[0])
        console.log(`✅ [${this.tableName}] Registro excluído: ${ids[0]}`)
      } else {
        await table.bulkDelete(ids)
        console.log(`✅ [${this.tableName}] ${ids.length} registros excluídos`)
      }

      // Verificar se foram realmente excluídos
      await new Promise(resolve => setTimeout(resolve, 50))
      const remainingCount = await table.count()
      console.log(`📊 [${this.tableName}] Registros restantes após exclusão: ${remainingCount}`)

      return { data: data, error: null }
    } catch (error: any) {
      console.error(`❌ [${this.tableName}] Erro ao excluir:`, error)
      return { data: null, error }
    }
  }
}

// Instância do cliente Supabase-like
export const supabase = new SupabaseLikeClient()

// Funções auxiliares para compatibilidade
export const supabaseHelpers = {
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
  }
}
