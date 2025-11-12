# 🚀 Como Atualizar a Aplicação na VPS

## 📋 Pré-requisitos

- ✅ Acesso SSH à VPS
- ✅ Acesso ao Portainer (opcional)
- ✅ Projeto clonado no servidor: `/root/wolfx-ai-connect`
- ✅ Docker e Docker Swarm configurados

## 🔄 Método 1: Atualização Manual via SSH (Recomendado)

### Passo 1: Conectar na VPS

```bash
ssh root@[IP-SERVIDOR]
```

### Passo 2: Ir para o diretório do projeto

```bash
cd /root/wolfx-ai-connect
```

### Passo 3: Atualizar código do Git

```bash
git pull origin main
```

### Passo 4: Buildar a nova imagem

```bash
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .
```

**⏱️ Aguarde o build terminar (pode levar alguns minutos)**

### Passo 5: Verificar se a imagem foi criada

```bash
docker images | grep wolfx-ai-connect
```

### Passo 6: Atualizar o serviço no Docker Swarm

```bash
docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect
```

### Passo 7: Verificar status do serviço

```bash
docker service ps wolfx_site_wolfx-ai-connect
```

### Passo 8: Ver logs do serviço

```bash
docker service logs wolfx_site_wolfx-ai-connect --tail 50
```

## 🎯 Método 2: Script de Atualização Automática

### Criar script de atualização

```bash
# No servidor, criar o script
nano /root/wolfx-ai-connect/update.sh
```

### Conteúdo do script:

```bash
#!/bin/bash
# Script para atualizar a aplicação na VPS

set -e

echo "🔄 Iniciando atualização da aplicação..."

# 1. Ir para o diretório
cd /root/wolfx-ai-connect

# 2. Fazer pull do Git
echo "📥 Fazendo pull do Git..."
git pull origin main

# 3. Buildar a imagem
echo "🔨 Buildando a imagem..."
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .

# 4. Verificar se foi criada
echo "✅ Verificando imagem..."
if docker images | grep -q "wolfx-ai-connect.*latest"; then
    echo "✅ Imagem criada com sucesso!"
else
    echo "❌ Erro: Imagem não foi criada!"
    exit 1
fi

# 5. Atualizar o serviço
echo "🚀 Atualizando serviço..."
docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect

# 6. Aguardar alguns segundos
echo "⏳ Aguardando 10 segundos..."
sleep 10

# 7. Verificar status
echo "📊 Status do serviço:"
docker service ps wolfx_site_wolfx-ai-connect --no-trunc

# 8. Ver logs
echo "📝 Últimos logs do serviço:"
docker service logs wolfx_site_wolfx-ai-connect --tail 20

echo "✅ Atualização concluída!"
```

### Tornar o script executável

```bash
chmod +x /root/wolfx-ai-connect/update.sh
```

### Executar o script

```bash
/root/wolfx-ai-connect/update.sh
```

## 🌐 Método 3: Atualização via Portainer

### Opção A: Git Repository (Recomendado)

1. **Acessar o Portainer:**
   - URL: `http://[IP-SERVIDOR]:9000`
   - Faça login

2. **Ir para Stacks:**
   - Menu lateral → **Stacks**
   - Clique em **wolfx_site**

3. **Atualizar a Stack:**
   - Clique em **Editor**
   - Se usar Git Repository, clique em **Update the stack**
   - Se usar Web Editor, atualize o `docker-compose.prod.yml` e clique em **Update the stack**

4. **Verificar Status:**
   - Vá em **Services**
   - Verifique se `wolfx-ai-connect` está rodando

### Opção B: Build via Portainer

1. **Acessar o Portainer:**
   - URL: `http://[IP-SERVIDOR]:9000`

2. **Ir para Images:**
   - Menu lateral → **Images**
   - Clique em **Build image**

3. **Configurar Build:**
   - **Build method:** Upload
   - **Dockerfile:** Faça upload do `Dockerfile.prod`
   - **Image name:** `wolfx-ai-connect:latest`
   - **Build options:** Adicione o contexto necessário

4. **Buildar:**
   - Clique em **Build the image**
   - Aguarde o build terminar

5. **Atualizar Stack:**
   - Vá em **Stacks** → **wolfx_site**
   - Clique em **Update the stack**

## 📝 Comandos Rápidos

### Atualizar tudo de uma vez

```bash
cd /root/wolfx-ai-connect && \
git pull origin main && \
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest . && \
docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect
```

### Verificar status

```bash
# Ver serviços
docker service ls | grep wolfx

# Ver status detalhado
docker service ps wolfx_site_wolfx-ai-connect --no-trunc

# Ver logs
docker service logs wolfx_site_wolfx-ai-connect --tail 50
```

### Verificar se está funcionando

```bash
# Testar acesso
curl -I https://wolfx.com.br/sobre

# Ver logs em tempo real
docker service logs -f wolfx_site_wolfx-ai-connect
```

## 🔍 Verificação Pós-Atualização

### 1. Verificar se o serviço está rodando

```bash
docker service ls | grep wolfx
```

**Resultado esperado:**
```
99m014wdthx5   wolfx_site_wolfx-ai-connect   replicated   1/1        wolfx-ai-connect:latest
```

### 2. Verificar containers

```bash
docker ps | grep wolfx-ai-connect
```

### 3. Verificar logs

```bash
docker service logs wolfx_site_wolfx-ai-connect --tail 50
```

### 4. Testar acesso

```bash
# Testar health check
curl https://wolfx.com.br/health

# Testar página Sobre
curl -I https://wolfx.com.br/sobre
```

## ⚠️ Troubleshooting

### Problema: Imagem não foi criada

**Solução:**
```bash
# Verificar erros no build
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest . 2>&1 | tail -30

# Verificar se os arquivos existem
ls -la Dockerfile.prod nginx.prod.conf docker-entrypoint.sh
```

### Problema: Serviço não inicia

**Solução:**
```bash
# Ver por que não está iniciando
docker service ps wolfx_site_wolfx-ai-connect --no-trunc

# Ver logs
docker service logs wolfx_site_wolfx-ai-connect --tail 100

# Forçar atualização
docker service update --force wolfx_site_wolfx-ai-connect
```

### Problema: Erro 404 ainda aparece

**Solução:**
```bash
# Verificar se o Traefik está roteando corretamente
docker service logs traefik_traefik --tail 50 | grep wolfx

# Verificar configuração do serviço
docker service inspect wolfx_site_wolfx-ai-connect --pretty
```

### Problema: Build demora muito

**Solução:**
```bash
# Verificar uso de recursos
docker system df

# Limpar cache (cuidado!)
docker system prune -f

# Verificar se há processos rodando
docker ps
```

## 📋 Checklist de Atualização

- [ ] Código atualizado no GitHub
- [ ] Acesso SSH à VPS
- [ ] Projeto clonado no servidor
- [ ] Git pull executado
- [ ] Imagem buildada com sucesso
- [ ] Imagem verificada (`docker images`)
- [ ] Serviço atualizado
- [ ] Status verificado (`docker service ps`)
- [ ] Logs verificados (`docker service logs`)
- [ ] Acesso testado (`curl https://wolfx.com.br/sobre`)

## 🚀 Processo Completo de Atualização

### 1. No computador local

```bash
# Fazer commit das alterações
git add .
git commit -m "Adicionar página Sobre com LinkedIn"
git push origin main
```

### 2. Na VPS

```bash
# Atualizar código
cd /root/wolfx-ai-connect
git pull origin main

# Buildar imagem
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .

# Atualizar serviço
docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect

# Verificar
docker service ps wolfx_site_wolfx-ai-connect
```

### 3. Verificar funcionamento

```bash
# Ver logs
docker service logs wolfx_site_wolfx-ai-connect --tail 50

# Testar acesso
curl -I https://wolfx.com.br/sobre
```

## 💡 Dicas

1. **Sempre faça backup antes de atualizar:**
   ```bash
   docker service inspect wolfx_site_wolfx-ai-connect > backup-service.json
   ```

2. **Verifique os logs após atualização:**
   ```bash
   docker service logs -f wolfx_site_wolfx-ai-connect
   ```

3. **Use GitOps no Portainer para atualizações automáticas:**
   - Configure Git Repository no Portainer
   - Ative GitOps updates
   - Atualizações serão automáticas

4. **Monitore recursos durante o build:**
   ```bash
   docker stats
   ```

## 🔗 Links Úteis

- **Portainer:** `http://[IP-SERVIDOR]:9000`
- **Traefik Dashboard:** `http://[IP-SERVIDOR]:8080` (se habilitado)
- **Aplicação:** `https://wolfx.com.br`
- **Página Sobre:** `https://wolfx.com.br/sobre`

## 📞 Comandos de Emergência

### Reverter atualização

```bash
# Ver versões anteriores
docker service ps wolfx_site_wolfx-ai-connect

# Reverter para versão anterior (substitua <ID> pelo ID da versão)
docker service rollback wolfx_site_wolfx-ai-connect
```

### Remover e recriar serviço

```bash
# Remover serviço
docker service rm wolfx_site_wolfx-ai-connect

# Recriar stack
cd /root/wolfx-ai-connect
docker stack deploy -c docker-compose.prod.yml wolfx_site
```

### Ver eventos do Docker

```bash
docker events --since 10m | grep wolfx
```

---

## ✅ Resumo Rápido

```bash
# 1. Atualizar código
cd /root/wolfx-ai-connect
git pull origin main

# 2. Buildar imagem
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .

# 3. Atualizar serviço
docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect

# 4. Verificar
docker service ps wolfx_site_wolfx-ai-connect
docker service logs wolfx_site_wolfx-ai-connect --tail 50
```

---

**Última atualização:** 2025-01-12

