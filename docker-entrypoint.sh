#!/bin/sh
set -e

# Criar diretórios de logs se não existirem
mkdir -p /var/log/nginx

# Criar symlinks para stdout/stderr (para Docker capturar logs)
# Isso permite que o Portainer/Docker veja os logs do nginx
ln -sf /dev/stdout /var/log/nginx/access.log
ln -sf /dev/stderr /var/log/nginx/error.log

# Executar comando passado como argumento (geralmente nginx -g "daemon off;")
exec "$@"
