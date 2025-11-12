// Serviço para gerenciar configurações de IA

import { db, AIConfig } from './database'

/**
 * Obtém todas as configurações de IA
 */
export async function getAIConfigs(): Promise<AIConfig[]> {
  try {
    const configs = await db.ai_configs.orderBy('provider').toArray()
    return configs
  } catch (error) {
    console.error('Erro ao buscar configurações de IA:', error)
    return []
  }
}

/**
 * Obtém uma configuração de IA por ID
 */
export async function getAIConfigById(id: string): Promise<AIConfig | null> {
  try {
    const config = await db.ai_configs.get(id)
    return config || null
  } catch (error) {
    console.error('Erro ao buscar configuração de IA:', error)
    return null
  }
}

/**
 * Obtém a configuração padrão de um provider
 */
export async function getDefaultAIConfig(provider: 'openai' | 'perplexity' | 'image'): Promise<AIConfig | null> {
  try {
    const configs = await db.ai_configs
      .where('provider')
      .equals(provider)
      .filter(config => config.is_default === true && config.enabled === true)
      .toArray()
    return configs[0] || null
  } catch (error) {
    console.error('Erro ao buscar configuração padrão de IA:', error)
    return null
  }
}

/**
 * Cria uma nova configuração de IA
 */
export async function createAIConfig(config: Omit<AIConfig, 'id' | 'created_at' | 'updated_at'>): Promise<AIConfig> {
  try {
    // Se for marcada como padrão, desmarcar outras configurações padrão do mesmo provider
    if (config.is_default) {
      const existingDefaults = await db.ai_configs
        .where('provider')
        .equals(config.provider)
        .filter(c => c.is_default === true)
        .toArray()
      
      for (const existing of existingDefaults) {
        await db.ai_configs.update(existing.id, {
          is_default: false,
          updated_at: new Date().toISOString()
        })
      }
    }

    const newConfig: AIConfig = {
      ...config,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await db.ai_configs.add(newConfig)
    return newConfig
  } catch (error) {
    console.error('Erro ao criar configuração de IA:', error)
    throw error
  }
}

/**
 * Atualiza uma configuração de IA
 */
export async function updateAIConfig(id: string, updates: Partial<Omit<AIConfig, 'id' | 'created_at'>>): Promise<void> {
  try {
    const config = await db.ai_configs.get(id)
    if (!config) {
      throw new Error('Configuração de IA não encontrada')
    }

    // Se for marcada como padrão, desmarcar outras configurações padrão do mesmo provider
    if (updates.is_default === true) {
      const existingDefaults = await db.ai_configs
        .where('provider')
        .equals(config.provider)
        .filter(c => c.is_default === true && c.id !== id)
        .toArray()
      
      for (const existing of existingDefaults) {
        await db.ai_configs.update(existing.id, {
          is_default: false,
          updated_at: new Date().toISOString()
        })
      }
    }

    await db.ai_configs.update(id, {
      ...updates,
      updated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao atualizar configuração de IA:', error)
    throw error
  }
}

/**
 * Deleta uma configuração de IA
 */
export async function deleteAIConfig(id: string): Promise<void> {
  try {
    await db.ai_configs.delete(id)
  } catch (error) {
    console.error('Erro ao deletar configuração de IA:', error)
    throw error
  }
}

/**
 * Obtém a chave de API de uma configuração
 */
export async function getAPIKey(configId: string): Promise<string | null> {
  try {
    const config = await db.ai_configs.get(configId)
    return config?.api_key || null
  } catch (error) {
    console.error('Erro ao buscar chave de API:', error)
    return null
  }
}

/**
 * Obtém modelos disponíveis para um provider
 */
export function getAvailableModels(provider: 'openai' | 'perplexity' | 'image'): string[] {
  if (provider === 'openai') {
    return [
      'gpt-5',
      'gpt-5-pro',
      'gpt-5-mini',
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ]
  } else if (provider === 'perplexity') {
    return [
      'sonar',
      'sonar-pro',
      'sonar-reasoning',
      'sonar-reasoning-pro',
      'sonar-deep-research'
    ]
  } else if (provider === 'image') {
    return [
      'dall-e-3',
      'dall-e-2'
    ]
  }
  return []
}

// Exportar tipo AIConfig para uso em outros lugares
export type { AIConfig } from './database'

