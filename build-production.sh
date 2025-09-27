#!/bin/bash

# Script para build da imagem de produção
echo "🚀 Building production image..."

# Build da imagem
docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📦 Image: wolfx-ai-connect:latest"
    
    # Mostrar informações da imagem
    docker images wolfx-ai-connect:latest
    
    echo ""
    echo "🎯 Next steps:"
    echo "1. Deploy the stack in Portainer"
    echo "2. The image is ready to use!"
else
    echo "❌ Build failed!"
    exit 1
fi