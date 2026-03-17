#!/bin/bash
set -e

REMOTE_HOST="192.168.2.124"
REMOTE_PORT="2222"
REMOTE_USER="cburns"
REMOTE_DOCKER_PATH="/home/cburns/docker/earthco-market"

CLIENT_IMAGE="ghcr.io/burnsco/earthco-market-client:latest"
SERVER_IMAGE="ghcr.io/burnsco/earthco-market-server:latest"

echo "🚀 Deploying EarthCo Market..."

echo "📦 Building Client..."
docker build --network=host -f Dockerfile.client -t "$CLIENT_IMAGE" .

echo "📦 Building Server..."
docker build --network=host -f server/Dockerfile -t "$SERVER_IMAGE" .

echo "⬆️  Pushing images to GHCR..."
docker push "$CLIENT_IMAGE"
docker push "$SERVER_IMAGE"

echo "🚢 Deploying to server..."
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DOCKER_PATH && docker compose pull && docker compose up -d"

echo "✅ Deployment complete!"
