// Script para testar busca de comentários como admin
// Execute no console do navegador na página do admin

async function testAdminComments() {
  console.log('🧪 Testando busca de comentários como admin...')
  
  try {
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('❌ Erro ao obter usuário:', userError)
      return
    }
    
    console.log('👤 Usuário logado:', user?.email)
    
    // Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erro ao obter perfil:', profileError)
      return
    }
    
    console.log('👑 Perfil do usuário:', profile)
    console.log('🔑 Role do usuário:', profile.role)
    
    // Testar busca de comentários
    console.log('🔍 Testando busca de comentários...')
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (commentsError) {
      console.error('❌ Erro ao buscar comentários:', commentsError)
      return
    }
    
    console.log('📄 Comentários encontrados:', comments?.length || 0)
    console.log('📋 Lista de comentários:', comments)
    
    // Testar busca por status específico
    console.log('🔍 Testando busca por status pending...')
    
    const { data: pendingComments, error: pendingError } = await supabase
      .from('comments')
      .select('*')
      .eq('status', 'pending')
    
    if (pendingError) {
      console.error('❌ Erro ao buscar comentários pendentes:', pendingError)
      return
    }
    
    console.log('⏳ Comentários pendentes encontrados:', pendingComments?.length || 0)
    console.log('📋 Lista de pendentes:', pendingComments)
    
  } catch (error) {
    console.error('💥 Erro no teste:', error)
  }
}

// Executar teste
testAdminComments()
