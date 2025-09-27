# Docker Setup - WolfX AI Connect

Este projeto está configurado para rodar em containers Docker com diferentes perfis para desenvolvimento e produção.

## Arquivos Docker

- `Dockerfile` - Multi-stage build com suporte para desenvolvimento e produção
- `docker-compose.yml` - Configuração dos serviços
- `docker-compose.override.yml` - Override para desenvolvimento local
- `nginx.conf` - Configuração do Nginx para produção
- `.dockerignore` - Arquivos ignorados no build

## Como usar

### Desenvolvimento

Para rodar em modo de desenvolvimento com hot-reload:

```bash
# Usando docker-compose com profile dev
docker-compose --profile dev up --build

# Ou usando docker diretamente
docker build --target development -t wolfx-ai-connect-dev .
docker run -p 8080:8080 -v $(pwd):/app -v /app/node_modules wolfx-ai-connect-dev
```

A aplicação estará disponível em: http://localhost:8080

### Produção

Para rodar em modo de produção:

```bash
# Usando docker-compose com profile prod
docker-compose --profile prod up --build

# Ou usando docker diretamente
docker build --target production -t wolfx-ai-connect-prod .
docker run -p 80:80 wolfx-ai-connect-prod
```

A aplicação estará disponível em: http://localhost

### Desenvolvimento Local com Build

Para testar o build de produção localmente:

```bash
# Primeiro, faça o build da aplicação
npm run build

# Depois rode o container com volume para o dist
docker-compose --profile local up --build
```

A aplicação estará disponível em: http://localhost:3000

## Comandos Úteis

### Limpar containers e volumes
```bash
docker-compose down -v
docker system prune -f
```

### Rebuild completo
```bash
docker-compose build --no-cache
```

### Ver logs
```bash
docker-compose logs -f wolfx-ai-connect-dev
```

### Entrar no container
```bash
docker-compose exec wolfx-ai-connect-dev sh
```

## Estrutura Multi-stage

O Dockerfile usa multi-stage build:

1. **builder** - Instala dependências e faz o build da aplicação
2. **production** - Imagem otimizada com Nginx para servir a aplicação
3. **development** - Imagem para desenvolvimento com hot-reload

## Configurações do Nginx

O arquivo `nginx.conf` inclui:
- Gzip compression
- Cache de assets estáticos
- Suporte a client-side routing (React Router)
- Headers de segurança
- Páginas de erro customizadas

## Variáveis de Ambiente

### Desenvolvimento
- `NODE_ENV=development`
- `VITE_HOST=0.0.0.0`
- `VITE_PORT=8080`

### Produção
- `NODE_ENV=production`

## Troubleshooting

### Porta já em uso
Se a porta 8080 ou 80 estiver em uso, você pode alterar as portas no `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"  # Mude 8081 para a porta desejada
```

### Problemas de permissão no macOS/Linux
```bash
sudo chown -R $USER:$USER .
```

### Cache do Docker
Para limpar o cache do Docker:
```bash
docker builder prune -f
```

