#!/bin/bash

# Script para build de produção
echo "🚀 Iniciando build de produção..."

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# Remover imagens antigas
echo "🗑️ Removendo imagens antigas..."
docker image prune -f

# Build da nova imagem
echo "🔨 Fazendo build da nova imagem..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Criar rede se não existir
echo "🌐 Criando rede Docker..."
docker network create wolfx-network 2>/dev/null || echo "Rede já existe"

# Iniciar containers
echo "▶️ Iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
echo "✅ Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Deploy concluído!"
echo "📱 Acesse: https://wolfx.com.br"
echo "🔧 Traefik Dashboard: http://$(hostname -I | awk '{print $1}'):8080"
