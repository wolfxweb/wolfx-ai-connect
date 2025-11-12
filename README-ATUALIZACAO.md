# 📖 Guia Rápido: Atualizar Aplicação na VPS

## 🎯 Atualização Rápida (3 Passos)

### 1. Atualizar código
```bash
cd /root/wolfx-ai-connect
git pull origin main
```

### 2. Buildar e atualizar
```bash
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest . && \
docker service update --force --image wolfx-ai-connect:latest wolfx_site_wolfx-ai-connect
```

### 3. Verificar
```bash
docker service ps wolfx_site_wolfx-ai-connect
```

## 🚀 Script Automatizado

Execute o script de atualização:

```bash
cd /root/wolfx-ai-connect
chmod +x update-vps.sh
./update-vps.sh
```

## 📝 Verificação

Após atualizar, verifique:

```bash
# Status do serviço
docker service ls | grep wolfx

# Logs
docker service logs wolfx_site_wolfx-ai-connect --tail 50

# Testar acesso
curl -I https://wolfx.com.br/sobre
```

## ⚠️ Se der erro

```bash
# Ver por que não está rodando
docker service ps wolfx_site_wolfx-ai-connect --no-trunc

# Ver logs de erro
docker service logs wolfx_site_wolfx-ai-connect --tail 100
```

---

**Para mais detalhes, veja:** `ATUALIZAR-VPS.md`

