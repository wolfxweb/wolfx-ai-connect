#!/bin/bash
# Script para atualizar a aplicação na VPS
# Uso: ./update-vps.sh

set -e

echo "🔄 Iniciando atualização da aplicação Wolfx AI Connect..."
echo ""

# 1. Ir para o diretório
echo "📁 Navegando para o diretório do projeto..."
cd /root/wolfx-ai-connect || {
    echo "❌ Erro: Diretório /root/wolfx-ai-connect não encontrado!"
    exit 1
}

# 2. Fazer pull do Git
echo "📥 Fazendo pull do Git..."
if git pull origin main; then
    echo "✅ Código atualizado com sucesso!"
else
    echo "❌ Erro ao fazer pull do Git!"
    exit 1
fi

# 3. Verificar se os arquivos necessários existem
echo "🔍 Verificando arquivos necessários..."
if [ ! -f "Dockerfile.prod" ]; then
    echo "❌ Erro: Dockerfile.prod não encontrado!"
    exit 1
fi

if [ ! -f "nginx.prod.conf" ]; then
    echo "❌ Erro: nginx.prod.conf não encontrado!"
    exit 1
fi

if [ ! -f "docker-entrypoint.sh" ]; then
    echo "❌ Erro: docker-entrypoint.sh não encontrado!"
    exit 1
fi

echo "✅ Todos os arquivos necessários estão presentes!"

# 4. Buildar a imagem
echo "🔨 Buildando a imagem..."
echo "⏳ Isso pode levar alguns minutos..."
if docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .; then
    echo "✅ Imagem buildada com sucesso!"
else
    echo "❌ Erro ao buildar a imagem!"
    exit 1
fi

# 5. Verificar se foi criada
echo "✅ Verificando imagem..."
if docker images | grep -q "wolfx-ai-connect.*latest"; then
    echo "✅ Imagem criada com sucesso!"
    docker images | grep wolfx-ai-connect
else
    echo "❌ Erro: Imagem não foi criada!"
    exit 1
fi

# 6. Verificar se o serviço existe
echo "🔍 Verificando serviço..."
if ! docker service ls | grep -q "wolfx_site_wolfx-ai-connect"; then
    echo "⚠️  Aviso: Serviço wolfx_site_wolfx-ai-connect não encontrado!"
    echo "💡 Você pode precisar criar a stack no Portainer primeiro."
    exit 1
fi

# 7. Atualizar o serviço
echo "🚀 Atualizando serviço..."
if docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect; then
    echo "✅ Serviço atualizado com sucesso!"
else
    echo "❌ Erro ao atualizar o serviço!"
    exit 1
fi

# 8. Aguardar alguns segundos
echo "⏳ Aguardando 10 segundos para o serviço iniciar..."
sleep 10

# 9. Verificar status
echo "📊 Status do serviço:"
docker service ps wolfx_site_wolfx-ai-connect --no-trunc | head -5

# 10. Ver logs
echo "📝 Últimos logs do serviço:"
docker service logs wolfx_site_wolfx-ai-connect --tail 20

# 11. Verificar se está rodando
echo "🔍 Verificando se o serviço está rodando..."
if docker service ls | grep "wolfx_site_wolfx-ai-connect" | grep -q "1/1"; then
    echo "✅ Serviço está rodando (1/1 replicas)!"
else
    echo "⚠️  Aviso: Serviço pode não estar rodando corretamente!"
    echo "💡 Verifique os logs com: docker service logs wolfx_site_wolfx-ai-connect --tail 50"
fi

echo ""
echo "✅ Atualização concluída!"
echo ""
echo "🔗 Acesse a aplicação em: https://wolfx.com.br"
echo "🔗 Página Sobre: https://wolfx.com.br/sobre"
echo ""
echo "💡 Para ver logs em tempo real: docker service logs -f wolfx_site_wolfx-ai-connect"

