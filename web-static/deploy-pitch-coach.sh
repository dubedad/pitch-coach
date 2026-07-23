#!/usr/bin/env bash
# deploy-pitch-coach.sh — deploy the pitch-coach critic to aiguys.tech (Hal's VPS).
# Static index.html -> /var/www/aiguys/pitch-coach/ (web root).
# Node critique server + editor bundle + key -> /root/pitch-coach/ (OUTSIDE web root).
# nginx proxies ONLY /pitch-coach/critique.php -> 127.0.0.1:3200. No sibling app touched.
set -euo pipefail
KEY="$HOME/.ssh/hal_ed25519"
HOST="root@187.77.19.130"
R="/Users/robdube/dev/pitch-coach"
SSHOPT=(-i "$KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=20)

echo "== 1. bundle editor beside server (local) =="
rm -rf "$R/web-static/editor" && cp -R "$R/editor" "$R/web-static/editor"
echo "   editor files: $(find "$R/web-static/editor" -type f | wc -l | tr -d ' ')"

echo "== 2. make box dirs =="
ssh "${SSHOPT[@]}" "$HOST" 'mkdir -p /root/pitch-coach/editor /root/pitch-coach/.secrets /var/www/aiguys/pitch-coach && chmod 700 /root/pitch-coach/.secrets && echo "   dirs ok"'

echo "== 3. deploy server + editor (outside web root) =="
scp "${SSHOPT[@]}" "$R/web-static/critique-server.js" "$HOST:/root/pitch-coach/critique-server.js" >/dev/null
scp "${SSHOPT[@]}" -r "$R/editor/." "$HOST:/root/pitch-coach/editor/" >/dev/null
echo "   server + editor copied"

echo "== 4. deploy static index.html (web root) =="
scp "${SSHOPT[@]}" "$R/web-static/index.html" "$HOST:/var/www/aiguys/pitch-coach/index.html" >/dev/null
ssh "${SSHOPT[@]}" "$HOST" 'chown -R www-data:www-data /var/www/aiguys/pitch-coach && chmod 644 /var/www/aiguys/pitch-coach/index.html && echo "   static deployed"'

echo "== DONE (key + pm2 + nginx handled separately) =="
