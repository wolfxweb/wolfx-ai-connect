#!/bin/bash

# Script para debugar erro 404 em produção

echo "🔍 Debugando erro 404 em produção..."
echo ""

echo "1. Verificando se o container está rodando:"
docker service ps wolfx-ai-connect_wolfx-ai-connect --no-trunc 2>/dev/null || docker ps | grep wolfx-ai-connect

echo ""
echo "2. Verificando logs do container:"
docker service logs wolfx-ai-connect_wolfx-ai-connect --tail 50 2>/dev/null || docker logs $(docker ps -q -f name=wolfx-ai-connect) --tail 50

echo ""
echo "3. Verificando se o index.html existe no container:"
docker exec $(docker ps -q -f name=wolfx-ai-connect) ls -la /usr/share/nginx/html/index.html 2>/dev/null || echo "Container não encontrado ou index.html não existe"

echo ""
echo "4. Verificando configuração do nginx:"
docker exec $(docker ps -q -f name=wolfx-ai-connect) cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "Não foi possível acessar a configuração do nginx"

echo ""
echo "5. Testando acesso local ao container:"
docker exec $(docker ps -q -f name=wolfx-ai-connect) curl -I http://localhost/ 2>/dev/null || echo "Não foi possível testar o acesso"

echo ""
echo "6. Verificando Traefik:"
docker service logs traefik_traefik --tail 20 2>/dev/null | grep -i wolfx || echo "Nenhum log relacionado ao wolfx no Traefik"

echo ""
echo "✅ Debug concluído!"

