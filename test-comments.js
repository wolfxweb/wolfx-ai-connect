// Script para testar sistema de comentários
// Execute no console do navegador na página do blog

async function testComments() {
  console.log('🧪 Testando sistema de comentários...')
  
  try {
    // Testar inserção de comentário
    console.log('🔄 Testando inserção de comentário...')
    
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: '5f2ce936-043c-4720-a527-93e15aa129a5', // ID do post de teste
          author_name: 'Teste Console',
          author_email: 'teste@console.com',
          content: 'Comentário de teste via console',
          status: 'pending'
        }
      ])
      .select()
    
    if (error) {
      console.error('❌ Erro ao inserir comentário:', error)
      return
    }
    
    console.log('✅ Comentário inserido:', data)
    
    // Testar busca de comentários
    console.log('🔍 Testando busca de comentários...')
    
    const { data: comments, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Erro ao buscar comentários:', fetchError)
      return
    }
    
    console.log('📄 Comentários encontrados:', comments?.length || 0)
    console.log('📋 Lista de comentários:', comments)
    
    // Testar busca por status
    console.log('🔍 Testando busca por status pending...')
    
    const { data: pendingComments, error: pendingError } = await supabase
      .from('comments')
      .select('*')
      .eq('status', 'pending')
    
    if (pendingError) {
      console.error('❌ Erro ao buscar comentários pendentes:', pendingError)
      return
    }
    
    console.log('⏳ Comentários pendentes:', pendingComments?.length || 0)
    console.log('📋 Lista de pendentes:', pendingComments)
    
  } catch (error) {
    console.error('💥 Erro no teste:', error)
  }
}

// Executar teste
testComments()
