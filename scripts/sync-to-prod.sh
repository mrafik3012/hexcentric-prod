#!/usr/bin/env bash
# Sync hexcentric-roof main branch → hexcentric-prod (production)
set -euo pipefail

PROD_URL="https://github.com/mrafik3012/hexcentric-prod.git"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO_ROOT"

if ! git remote get-url prod &>/dev/null; then
  git remote add prod "$PROD_URL"
fi

echo "→ Pushing main to hexcentric-prod..."
git push prod main:main --force

echo "→ Pushing all tags..."
git push prod --tags 2>/dev/null || true

echo "✓ Production repo synced: https://github.com/mrafik3012/hexcentric-prod"
