#!/bin/bash

echo "🔍 Debugging 404 error..."

echo ""
echo "1. Checking if wolfx-ai-connect service is running:"
docker service ls | grep wolfx-ai-connect

echo ""
echo "2. Checking service logs:"
docker service logs wolfx-ai-connect_wolfx-ai-connect --tail 20 2>/dev/null || echo "Service not found"

echo ""
echo "3. Checking if image exists:"
docker images | grep wolfx-ai-connect

echo ""
echo "4. Checking Traefik service:"
docker service ls | grep traefik

echo ""
echo "5. Checking Traefik logs:"
docker service logs traefik_traefik --tail 10

echo ""
echo "6. Checking Traefik API for routers:"
curl -s http://localhost:8080/api/http/routers 2>/dev/null | grep -i wolfx || echo "No wolfx router found in Traefik"

echo ""
echo "7. Checking Traefik API for services:"
curl -s http://localhost:8080/api/http/services 2>/dev/null | grep -i wolfx || echo "No wolfx service found in Traefik"

echo ""
echo "8. Testing direct access to the service (if running):"
if docker service ls | grep -q wolfx-ai-connect; then
    echo "Service is running, checking internal connectivity..."
    docker service ps wolfx-ai-connect_wolfx-ai-connect --no-trunc
else
    echo "Service is not running!"
fi
