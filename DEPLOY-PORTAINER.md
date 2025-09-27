# 🚀 Deploy no Portainer - WolfX AI Connect

## 📋 Pré-requisitos

- Portainer instalado e configurado
- Docker Swarm ativo
- Acesso SSH ao servidor
- Token GitHub configurado

## 🔧 Configuração Inicial

### 1. **Criar rede Docker (IMPORTANTE)**

No servidor, execute:

```bash
docker network create wolfx-network
```

### 2. **Build da Imagem**

No servidor, execute o script de build:

```bash
# Tornar o script executável
chmod +x build-production.sh

# Executar o build
./build-production.sh
```

## 🎯 Deploy no Portainer

### 1. **Configuração da Stack**

1. Acesse o **Portainer** no seu servidor
2. Vá para **Stacks** → **Add Stack**
3. **Nome da Stack**: `wolfx-ai-connect`

### 2. **Configuração do Git**

- **Escolha**: "Git Repository"
- **Repository URL**: `https://github.com/wolfxweb/wolfx-ai-connect.git`
- **Reference**: `refs/heads/main`
- **Compose path**: `docker-compose.prod.yml`
- **Username**: `wolfxweb`
- **Password**: `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`
- **GitOps updates**: ✅ Ativado (opcional)

### 3. **Deploy**

- Clique em **"Deploy the stack"**
- Aguarde o deploy (pode demorar alguns minutos)

## 🌐 Configuração DNS

Configure o DNS do domínio `wolfx.com.br`:

```
A Record: wolfx.com.br → [IP-DO-SERVIDOR]
A Record: www.wolfx.com.br → [IP-DO-SERVIDOR]
```

## 🔍 Verificação

Após o deploy, verifique:

- **Aplicação**: `https://wolfx.com.br`
- **Traefik Dashboard**: `http://[IP-SERVIDOR]:8080`
- **Health Check**: `https://wolfx.com.br/health`

## 🛠️ Troubleshooting

### Erro: "no image specified"
- Execute o script `build-production.sh` no servidor
- Verifique se a imagem `wolfx-ai-connect:latest` existe

### Erro: "network not found"
- Execute: `docker network create wolfx-network`

### SSL não funciona
- Verifique se o domínio está apontando para o servidor
- Aguarde alguns minutos para o Let's Encrypt gerar o certificado

## 📝 Logs

Para ver os logs:

```bash
# Logs da aplicação
docker service logs wolfx-ai-connect_wolfx-ai-connect

# Logs do Traefik
docker service logs wolfx-ai-connect_traefik
```

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das alterações para o GitHub
2. Execute `./build-production.sh` no servidor
3. Atualize a stack no Portainer (se GitOps estiver ativado, será automático)

## 🎉 Sucesso!

Sua aplicação estará rodando em:
- **URL**: `https://wolfx.com.br`
- **Admin**: `https://wolfx.com.br/admin`
- **Blog**: `https://wolfx.com.br/blog`