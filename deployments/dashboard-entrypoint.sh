#!/bin/sh
# Inject runtime configuration into config.js
# This script runs as part of nginx docker-entrypoint.d

set -e

GATEWAY_BASE_URL=${DASHBOARD_GATEWAY_BASE_URL:-}
OBSERVABILITY_BASE_URL=${DASHBOARD_OBSERVABILITY_BASE_URL:-$GATEWAY_BASE_URL}

if ! cat > /usr/share/nginx/html/config.js <<CONFIG
window.__DASHBOARD_CONFIG__ = {
  gatewayBaseUrl: "${GATEWAY_BASE_URL}",
  observabilityBaseUrl: "${OBSERVABILITY_BASE_URL}"
};
CONFIG
then
  echo "Dashboard config injection skipped (config.js not writable); using build-time config."
  exit 0
fi

echo "Dashboard config injected: gatewayBaseUrl=${GATEWAY_BASE_URL:-'(empty)'} observabilityBaseUrl=${OBSERVABILITY_BASE_URL:-'(empty)'}"
