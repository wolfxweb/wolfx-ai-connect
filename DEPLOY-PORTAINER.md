# Deploy no Portainer - WolfX AI Connect

## 🚀 Configuração do Deploy via GitHub

### 1. Preparação no GitHub

1. **Faça push do código** para o repositório GitHub
2. **Certifique-se** de que todos os arquivos estão commitados:
   ```bash
   git add .
   git commit -m "Deploy production ready"
   git push origin main
   ```

### 2. Configuração no Portainer

#### 2.1 Criar Stack no Portainer

1. **Acesse o Portainer** no seu servidor
2. **Vá para Stacks** → **Add Stack**
3. **Nome da Stack**: `wolfx-ai-connect`
4. **Escolha**: "Git Repository"

#### 2.2 Configuração do Git Repository

**Repository URL**: `https://github.com/[SEU-USUARIO]/wolfx-ai-connect`

**Reference**: `refs/heads/main`

**Compose path**: `docker-compose.prod.yml`

**Auto-update**: ✅ Ativado (opcional)

#### 2.3 Variáveis de Ambiente (opcional)

Como os valores já estão hardcoded no docker-compose.prod.yml, não precisa configurar variáveis.

### 3. Configuração da Rede Docker

**IMPORTANTE**: Antes de fazer o deploy, crie a rede externa:

```bash
# No servidor, execute:
docker network create wolfx-network
```

### 4. Deploy da Stack

1. **Clique em "Deploy the stack"**
2. **Aguarde** o build e deploy
3. **Verifique os logs** se houver problemas

### 5. Configuração do DNS

Configure o DNS do domínio `wolfx.com.br` para apontar para o IP do seu servidor:

```
A Record: wolfx.com.br → [IP-DO-SERVIDOR]
A Record: www.wolfx.com.br → [IP-DO-SERVIDOR]
```

### 6. Verificação do Deploy

1. **Acesse**: `https://wolfx.com.br`
2. **Verifique** se a aplicação está funcionando
3. **Teste** o login e funcionalidades

### 7. Monitoramento

- **Traefik Dashboard**: `http://[IP-SERVIDOR]:8080`
- **Logs da aplicação**: Portainer → Containers → wolfx-ai-connect-prod → Logs
- **Health Check**: `https://wolfx.com.br/health`

## 🔧 Arquivos de Configuração

### Arquivos principais:
- `docker-compose.prod.yml` - Stack para produção (usado pelo Portainer)
- `Dockerfile.prod` - Build otimizado para produção
- `nginx.prod.conf` - Configuração do Nginx

### Recursos incluídos:
- ✅ **SSL Automático** via Let's Encrypt
- ✅ **Proxy Reverso** com Traefik
- ✅ **Compressão Gzip**
- ✅ **Cache de arquivos estáticos**
- ✅ **Headers de segurança**
- ✅ **Health check endpoint**
- ✅ **Redirecionamento HTTP → HTTPS**

## 🚨 Troubleshooting

### Problema: Certificado SSL não funciona
**Solução**: Verifique se o domínio está apontando corretamente para o servidor

### Problema: Aplicação não carrega
**Solução**: Verifique os logs do container `wolfx-ai-connect-prod`

### Problema: Erro de build
**Solução**: Verifique se todos os arquivos estão no GitHub

### Comandos úteis:
```bash
# Ver logs do container
docker logs wolfx-ai-connect-prod

# Reiniciar stack
docker-compose -f docker-compose.prod.yml restart

# Rebuild da imagem
docker-compose -f docker-compose.prod.yml build --no-cache
```

## 📋 Checklist Final

- [ ] Código enviado para GitHub
- [ ] Rede `wolfx-network` criada
- [ ] Stack criada no Portainer
- [ ] DNS configurado
- [ ] SSL funcionando
- [ ] Aplicação acessível em https://wolfx.com.br
- [ ] Login funcionando
- [ ] Blog funcionando
- [ ] Admin funcionando
