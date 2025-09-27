#!/bin/bash

echo "🔍 Debugging deployment issues..."

echo ""
echo "1. Checking if image exists:"
docker images | grep wolfx-ai-connect

echo ""
echo "2. Checking Traefik services:"
docker service ls | grep traefik

echo ""
echo "3. Checking Traefik networks:"
docker network ls | grep traefik

echo ""
echo "4. Checking if wolfx-ai-connect service is running:"
docker service ls | grep wolfx-ai-connect

echo ""
echo "5. Checking Traefik logs:"
docker service logs traefik_traefik --tail 10

echo ""
echo "6. Checking wolfx-ai-connect logs:"
docker service logs wolfx-ai-connect_wolfx-ai-connect --tail 10 2>/dev/null || echo "Service not found or not running"

echo ""
echo "7. Checking Traefik configuration:"
curl -s http://localhost:8080/api/http/routers | grep -i wolfx || echo "No wolfx router found"

echo ""
echo "8. If image doesn't exist, building it:"
if ! docker images | grep -q wolfx-ai-connect; then
    echo "Building image..."
    docker build -f Dockerfile.prod -t wolfx-ai-connect:latest .
    echo "Image built!"
else
    echo "Image already exists!"
fi
