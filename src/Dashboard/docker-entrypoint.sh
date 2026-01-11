#!/bin/sh
# Generate config.js from environment variable
OBSERVABILITY_BASE_URL=${DASHBOARD_OBSERVABILITY_BASE_URL:-${DASHBOARD_GATEWAY_BASE_URL:-}}
cat > /usr/share/nginx/html/config.js << EOF
window.__DASHBOARD_CONFIG__ = {
  gatewayBaseUrl: "${DASHBOARD_GATEWAY_BASE_URL:-}",
  observabilityBaseUrl: "${OBSERVABILITY_BASE_URL}"
};
EOF
