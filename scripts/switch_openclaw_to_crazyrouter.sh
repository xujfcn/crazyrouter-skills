#!/usr/bin/env bash
set -euo pipefail

# switch_openclaw_to_crazyrouter.sh
#
# Purpose:
#   For existing OpenClaw users, switch the default model provider to CrazyRouter
#   and point OpenClaw to the CrazyRouter OpenAI-compatible API.
#
# What it does:
#   1. Detects OpenClaw config path
#   2. Creates a timestamped backup of the current config
#   3. Configures models.providers.crazyrouter
#   4. Sets the default primary model to crazyrouter/<model>
#   5. Optionally restarts the gateway service
#
# Usage examples:
#   bash switch_openclaw_to_crazyrouter.sh --api-key sk-xxxx
#   bash switch_openclaw_to_crazyrouter.sh --api-key sk-xxxx --model gpt-5.4
#   bash switch_openclaw_to_crazyrouter.sh --api-key sk-xxxx --model claude-sonnet-4-5-20250929 --restart
#
# Notes:
#   - Base URL is fixed to https://crazyrouter.com/v1
#   - API mode is set to openai-completions
#   - This script does NOT remove other providers; it only adds/updates CrazyRouter
#   - It is safe to run multiple times

MODEL="gpt-5.4"
API_KEY=""
BASE_URL="https://crazyrouter.com/v1"
RESTART_GATEWAY="false"

print_help() {
  cat <<'EOF'
Switch an existing OpenClaw install to CrazyRouter.

Required:
  --api-key <key>        CrazyRouter API key

Optional:
  --model <id>           Default model id (default: gpt-5.4)
  --base-url <url>       API base URL (default: https://crazyrouter.com/v1)
  --restart              Restart the OpenClaw gateway after config changes
  -h, --help             Show help

Examples:
  bash switch_openclaw_to_crazyrouter.sh --api-key sk-xxxx
  bash switch_openclaw_to_crazyrouter.sh --api-key sk-xxxx --model claude-sonnet-4-5-20250929
  bash switch_openclaw_to_crazyrouter.sh --api-key sk-xxxx --restart
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-key)
      API_KEY="${2:-}"
      shift 2
      ;;
    --model)
      MODEL="${2:-}"
      shift 2
      ;;
    --base-url)
      BASE_URL="${2:-}"
      shift 2
      ;;
    --restart)
      RESTART_GATEWAY="true"
      shift
      ;;
    -h|--help)
      print_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      print_help
      exit 1
      ;;
  esac
done

if [[ -z "$API_KEY" ]]; then
  echo "No API key provided via --api-key."
  read -rsp "Enter your CrazyRouter API key: " API_KEY
  echo
fi

if [[ -z "$API_KEY" ]]; then
  echo "Error: CrazyRouter API key is required" >&2
  exit 1
fi

if ! command -v openclaw >/dev/null 2>&1; then
  echo "Error: openclaw CLI not found in PATH" >&2
  exit 1
fi

CONFIG_PATH="$(openclaw config file | tail -n 1 | tr -d '\r')"
if [[ ! -f "$CONFIG_PATH" ]]; then
  echo "Error: OpenClaw config file not found: $CONFIG_PATH" >&2
  exit 1
fi

BACKUP_PATH="${CONFIG_PATH}.backup-$(date -u +%Y%m%d-%H%M%S)"
cp "$CONFIG_PATH" "$BACKUP_PATH"

echo "[1/4] Backed up config to: $BACKUP_PATH"

echo "[2/4] Configuring CrazyRouter provider..."
openclaw config set models.providers.crazyrouter.baseUrl "$BASE_URL"
openclaw config set models.providers.crazyrouter.apiKey "$API_KEY"
openclaw config set models.providers.crazyrouter.api openai-completions

echo "[3/4] Setting default primary model..."
openclaw config set agents.defaults.model.primary "crazyrouter/${MODEL}"

echo "[4/4] Validating config..."
openclaw config validate

echo
echo "✅ OpenClaw has been switched to CrazyRouter"
echo "   Base URL: $BASE_URL"
echo "   Default model: crazyrouter/${MODEL}"
echo "   Config file: $CONFIG_PATH"
echo "   Backup file: $BACKUP_PATH"

if [[ "$RESTART_GATEWAY" == "true" ]]; then
  echo
  echo "Restarting OpenClaw gateway..."
  if systemctl --user status openclaw-gateway >/dev/null 2>&1; then
    systemctl --user restart openclaw-gateway
    echo "✅ Restarted user gateway service: openclaw-gateway"
  elif systemctl status openclaw-gateway >/dev/null 2>&1; then
    sudo systemctl restart openclaw-gateway
    echo "✅ Restarted system gateway service: openclaw-gateway"
  else
    echo "⚠️ Could not auto-detect gateway service. Please restart manually."
  fi
fi

echo
echo "Suggested verification commands:"
echo "  openclaw config get models.providers.crazyrouter"
echo "  openclaw config get agents.defaults.model.primary"
echo "  openclaw gateway status"
