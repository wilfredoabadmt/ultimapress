#!/bin/sh
# Generates any missing secret once and keeps it on the data volume,
# so UltimaPress works with zero configuration and survives restarts.
# Database migrations run automatically when the app starts.
set -e
mkdir -p /app/data
SECRETS=/app/data/secrets.env
[ -f "$SECRETS" ] || touch "$SECRETS"
for v in PAYLOAD_SECRET CRON_SECRET PREVIEW_SECRET; do
  eval cur=\${$v:-}
  [ -n "$cur" ] && continue
  grep -q "^$v=" "$SECRETS" || echo "$v=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')" >> "$SECRETS"
  export "$(grep "^$v=" "$SECRETS")"
done

# Public address used in sitemaps, feeds, social previews and emails.
if [ -z "$SITE_URL" ] && [ -n "$DOMAIN" ]; then
  export SITE_URL="https://$DOMAIN"
fi

# Install rsync for faster node_modules copying in supervisor
if ! command -v rsync >/dev/null 2>&1; then
  apk add --no-cache rsync
fi

# Switch to container image version in /app if newly built
if [ -f /app/.next/BUILD_ID ] && [ -f /app/data/site-code/state.json ]; then
  CUR_BUILD=$(cat /app/.next/BUILD_ID 2>/dev/null || echo "")
  node -e "
    try {
      const fs = require('fs');
      const f = '/app/data/site-code/state.json';
      const s = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (s.lastImageBuildId !== '$CUR_BUILD') {
        console.log('[entrypoint] new image build ($CUR_BUILD), resetting active release to null');
        s.previous = s.active;
        s.active = null;
        s.lastImageBuildId = '$CUR_BUILD';
        fs.writeFileSync(f, JSON.stringify(s, null, 2));
      }
    } catch (e) {}
  "
fi

# The supervisor runs the site and handles updates from Build > Site code.
exec node /app/docker/supervisor.mjs
