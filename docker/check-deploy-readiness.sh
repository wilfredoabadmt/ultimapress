#!/bin/sh
# Quick check script to verify Coolify deployment settings
# Run this after setting up the service in Coolify

echo "=== UltimaPress Coolify Deployment Readiness Check ==="
echo ""

echo "1. Checking if using pre-built image (recommended):"
if grep -q "image: ghcr.io/mrwebtv/ultimapress:latest" docker-compose.yml 2>/dev/null || \
   grep -q "image: ghcr.io/mrwebtv/ultimapress" docker-compose.yml 2>/dev/null; then
    echo "   ✅ Using pre-built image: ghcr.io/mrwebtv/ultimapress"
    echo "      Expected deploy time: 1-2 minutes"
else
    echo "   ⚠️  Not using pre-built image"
    echo "      Consider using: ghcr.io/mrwebtv/ultimapress:latest"
fi

echo ""
echo "2. Checking healthcheck timeout:"
if grep -q "start_period: 300s" docker-compose.yml 2>/dev/null; then
    echo "   ✅ start_period is set to 300s"
else
    echo "   ⚠️  start_period might need to be 300s for builds"
fi

echo ""
echo "3. Recommended Coolify settings:"
echo "   Environment variables to set in Coolify:"
echo "   - POSTGRES_PASSWORD"
echo "   - DOMAIN (optional, for HTTPS)"
echo "   - SITE_URL (optional)"
echo "   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_ADDRESS (optional)"
echo ""
echo "   Docker command for pre-built image:"
echo "   docker run -d --name ultimapress \\"
echo "     -e POSTGRES_PASSWORD=your-password \\"
echo "     -e DOMAIN=your-domain.com \\"
echo "     --network your-network \\"
echo "     ghcr.io/mrwebtv/ultimapress:latest"

echo ""
echo "4. Volumes to persist:"
echo "   - media:/app/media     (user uploaded media)"
echo "   - appdata:/app/data    (site code, backups, etc.)"
echo "   - db:/var/lib/postgresql/data"

echo ""
echo "=== Check complete ==="