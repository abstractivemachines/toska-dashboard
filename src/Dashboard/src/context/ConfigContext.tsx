import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { buildUrl } from '../api/client';

interface ConfigContextValue {
  gatewayBaseUrl: string;
  observabilityBaseUrl: string;
  buildGatewayUrl: (path: string, params?: Record<string, string>) => string;
  buildObservabilityUrl: (path: string, params?: Record<string, string>) => string;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const configValue = window.__DASHBOARD_CONFIG__?.gatewayBaseUrl ?? '';
    const observabilityConfigValue = window.__DASHBOARD_CONFIG__?.observabilityBaseUrl ?? '';
    const envValue = import.meta.env.VITE_GATEWAY_BASE_URL ?? '';
    const gatewayBaseUrl = configValue || envValue;
    const observabilityEnvValue = import.meta.env.VITE_OBSERVABILITY_BASE_URL ?? '';
    const observabilityBaseUrl = observabilityConfigValue || observabilityEnvValue || gatewayBaseUrl;

    return {
      gatewayBaseUrl,
      observabilityBaseUrl,
      buildGatewayUrl: (path: string, params?: Record<string, string>) =>
        buildUrl(gatewayBaseUrl, path, params),
      buildObservabilityUrl: (path: string, params?: Record<string, string>) =>
        buildUrl(observabilityBaseUrl, path, params),
    };
  }, []);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
