#!/bin/bash

echo "🔧 Setting up networks for deployment..."

echo ""
echo "1. Checking existing networks:"
docker network ls

echo ""
echo "2. Creating traefik network if it doesn't exist:"
if ! docker network ls | grep -q "traefik"; then
    echo "Creating traefik network..."
    docker network create --driver overlay --attachable traefik
    echo "✅ traefik network created!"
else
    echo "✅ traefik network already exists!"
fi

echo ""
echo "3. Verifying networks:"
docker network ls | grep -E "(traefik|overlay)"

echo ""
echo "4. If you need to connect existing Traefik to the network:"
echo "   docker service update --network-add traefik traefik_traefik"

echo ""
echo "🎯 Network setup complete!"
