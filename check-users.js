// Script para verificar usuários cadastrados no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://supabase.wolfx.com.br'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.Mr2Z9_cUmM-LjhY5SvArT_78TPPiUh_hGITfq94KGbs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUsers() {
  console.log('🔍 Verificando usuários cadastrados...\n')
  console.log('📡 Conectando ao Supabase:', supabaseUrl)
  console.log('─'.repeat(60))
  
  try {
    // Verificar usuários na tabela auth.users (via profiles)
    console.log('\n📋 Buscando perfis de usuários...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError)
      console.error('   Detalhes:', {
        message: profilesError.message,
        details: profilesError.details,
        hint: profilesError.hint,
        code: profilesError.code
      })
      return
    }
    
    console.log(`\n✅ Total de usuários encontrados: ${profiles?.length || 0}\n`)
    
    if (!profiles || profiles.length === 0) {
      console.log('⚠️  Nenhum usuário cadastrado no banco de dados.')
      console.log('\n📝 Para criar um usuário:')
      console.log('   1. Acesse: http://localhost:8080/register')
      console.log('   2. Cadastre-se com seu email e senha')
      console.log('   3. Para tornar admin, execute no Supabase SQL Editor:')
      console.log('      UPDATE profiles SET role = \'admin\' WHERE email = \'seu-email@exemplo.com\';')
      return
    }
    
    console.log('📊 Lista de usuários:\n')
    console.log('─'.repeat(80))
    
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Usuário:`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Nome: ${profile.name || 'Não informado'}`)
      console.log(`   Email: ${profile.email || 'Não disponível'}`)
      console.log(`   Role: ${profile.role || 'user'}`)
      console.log(`   Status: ${profile.status || 'active'}`)
      console.log(`   Criado em: ${profile.created_at || 'Não disponível'}`)
      console.log(`   Atualizado em: ${profile.updated_at || 'Não disponível'}`)
    })
    
    console.log('\n─'.repeat(80))
    
    // Estatísticas
    const admins = profiles.filter(p => p.role === 'admin').length
    const users = profiles.filter(p => p.role === 'user' || !p.role).length
    const moderators = profiles.filter(p => p.role === 'moderator').length
    const active = profiles.filter(p => p.status === 'active').length
    const inactive = profiles.filter(p => p.status === 'inactive').length
    
    console.log('\n📈 Estatísticas:')
    console.log(`   👑 Administradores: ${admins}`)
    console.log(`   👤 Usuários: ${users}`)
    console.log(`   🛡️  Moderadores: ${moderators}`)
    console.log(`   ✅ Ativos: ${active}`)
    console.log(`   ❌ Inativos: ${inactive}`)
    
    // Verificar se há admins
    if (admins === 0) {
      console.log('\n⚠️  Nenhum administrador encontrado!')
      console.log('\n📝 Para criar um admin:')
      console.log('   1. Certifique-se de que você tem um usuário cadastrado')
      console.log('   2. Acesse o SQL Editor no Supabase')
      console.log('   3. Execute:')
      console.log('      UPDATE profiles SET role = \'admin\' WHERE email = \'seu-email@exemplo.com\';')
    } else {
      console.log('\n✅ Há administradores cadastrados.')
    }
    
  } catch (error) {
    console.error('💥 Erro ao verificar usuários:', error)
    console.error('   Stack:', error.stack)
  }
}

// Executar verificação
checkUsers()
  .then(() => {
    console.log('\n✅ Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

