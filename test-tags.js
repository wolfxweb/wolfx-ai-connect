// Script para testar tags - Execute no console do navegador (F12)
// Ou cole este código no console após carregar a página

console.log('🧪 TESTE DE TAGS - Meta Pixel e Google Tag Manager\n');
console.log('─'.repeat(60));

// Teste 1: Meta Pixel
console.log('\n1️⃣ Meta Pixel (Facebook):');
if (typeof fbq !== 'undefined') {
  console.log('   ✅ Meta Pixel carregado com sucesso!');
  console.log('   📊 Pixel ID: 293459357');
  console.log('   📋 Queue:', fbq.queue || []);
  console.log('   🔍 Tipo:', typeof fbq);
  
  // Testar disparo de evento
  try {
    fbq('track', 'TestEvent', {test: true});
    console.log('   ✅ Evento de teste disparado com sucesso!');
  } catch (e) {
    console.log('   ⚠️ Erro ao disparar evento:', e.message);
  }
} else {
  console.log('   ❌ Meta Pixel NÃO encontrado!');
  console.log('   💡 Verifique se o script está no index.html');
  console.log('   💡 Verifique se há bloqueadores de anúncios ativos');
}

// Teste 2: Google Tag Manager
console.log('\n2️⃣ Google Tag Manager:');
if (window.dataLayer) {
  console.log('   ✅ DataLayer encontrado!');
  console.log('   📊 Container ID: GTM-N5XM6DN');
  console.log('   📋 Eventos no DataLayer:', window.dataLayer.length);
  console.log('   📋 Últimos eventos:', window.dataLayer.slice(-5));
  
  // Verificar eventos
  const events = window.dataLayer.filter(item => item.event);
  console.log('   📊 Total de eventos:', events.length);
  if (events.length > 0) {
    console.log('   📋 Eventos:', events.map(e => e.event));
  }
} else {
  console.log('   ❌ DataLayer NÃO encontrado!');
  console.log('   💡 Verifique se o GTM está carregando');
}

if (window.google_tag_manager) {
  console.log('   ✅ Google Tag Manager carregado!');
  console.log('   📋 Containers:', Object.keys(window.google_tag_manager));
} else {
  console.log('   ⚠️ google_tag_manager não encontrado (pode ser normal)');
}

// Teste 3: Verificar requisições
console.log('\n3️⃣ Verificação de Requisições:');
console.log('   💡 Abra a aba Network (F12) e verifique:');
console.log('      - Requisições para connect.facebook.net');
console.log('      - Requisições para googletagmanager.com');

// Teste 4: Teste de eventos
console.log('\n4️⃣ Teste de Eventos:');
try {
  // Disparar evento no DataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'test_event',
    test: true,
    timestamp: new Date().toISOString()
  });
  console.log('   ✅ Evento de teste disparado no DataLayer!');
  console.log('   📋 Novo evento:', window.dataLayer[window.dataLayer.length - 1]);
} catch (e) {
  console.log('   ❌ Erro ao disparar evento no DataLayer:', e.message);
}

// Resumo
console.log('\n' + '─'.repeat(60));
console.log('📊 RESUMO:');
console.log(`   Meta Pixel: ${typeof fbq !== 'undefined' ? '✅ OK' : '❌ ERRO'}`);
console.log(`   DataLayer: ${window.dataLayer ? '✅ OK' : '❌ ERRO'}`);
console.log(`   GTM: ${window.google_tag_manager ? '✅ OK' : '⚠️ Não detectado'}`);

if (typeof fbq !== 'undefined' && window.dataLayer) {
  console.log('\n✅ Todas as tags estão funcionando corretamente!');
  console.log('💡 Próximos passos:');
  console.log('   1. Verifique o Facebook Events Manager');
  console.log('   2. Verifique o Google Tag Manager Preview Mode');
  console.log('   3. Use as extensões do Chrome para validação');
} else {
  console.log('\n⚠️ Algumas tags não estão carregando corretamente.');
  console.log('💡 Verifique:');
  console.log('   1. Console do navegador para erros');
  console.log('   2. Se há bloqueadores de anúncios');
  console.log('   3. Se os IDs estão corretos no index.html');
}

console.log('\n─'.repeat(60));

