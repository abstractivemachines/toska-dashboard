import { useEffect, useState, useCallback } from 'react';
import { ApiError } from '../api/client';
import {
  getObservabilityPortal,
  getMetricSummaries,
  getTopologyGraph,
  getSloStatuses,
  getBurnRateAlerts,
  getRecentReleases,
  getPlaybooks,
  getServiceDashboard,
} from '../api/observability';
import { useConfig } from '../context';
import type {
  ObservabilityPortalEntry,
  MetricSummary,
  TopologyGraph,
  SloStatus,
  BurnRateAlert,
  ReleaseRecord,
  PlaybookDefinition,
  ServiceDashboard,
} from '../types/api';

interface UseObservabilityResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useObservabilityResource<T>(
  fetcher: (baseUrl: string, signal?: AbortSignal) => Promise<T>,
  deps: unknown[] = []
): UseObservabilityResult<T> {
  const { observabilityBaseUrl } = useConfig();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = useCallback(() => {
    setRefetchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(observabilityBaseUrl, controller.signal)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to load observability data');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [observabilityBaseUrl, refetchCount, ...deps]);

  return { data, loading, error, refetch };
}

export function useObservabilityPortal(): UseObservabilityResult<ObservabilityPortalEntry[]> {
  return useObservabilityResource(getObservabilityPortal);
}

export function useObservabilityMetricSummaries(): UseObservabilityResult<MetricSummary[]> {
  return useObservabilityResource(getMetricSummaries);
}

export function useObservabilityTopology(): UseObservabilityResult<TopologyGraph> {
  return useObservabilityResource(getTopologyGraph);
}

export function useObservabilitySloStatuses(): UseObservabilityResult<SloStatus[]> {
  return useObservabilityResource(getSloStatuses);
}

export function useObservabilityBurnRateAlerts(): UseObservabilityResult<BurnRateAlert[]> {
  return useObservabilityResource(getBurnRateAlerts);
}

export function useObservabilityRecentReleases(): UseObservabilityResult<ReleaseRecord[]> {
  return useObservabilityResource(getRecentReleases);
}

export function useObservabilityPlaybooks(): UseObservabilityResult<PlaybookDefinition[]> {
  return useObservabilityResource(getPlaybooks);
}

interface UseServiceDashboardResult {
  data: ServiceDashboard | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function useServiceObservabilityDashboard(serviceName: string): UseServiceDashboardResult {
  const { observabilityBaseUrl } = useConfig();
  const [data, setData] = useState<ServiceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = useCallback(() => {
    setRefetchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!serviceName) {
      setData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setNotFound(false);

    getServiceDashboard(observabilityBaseUrl, serviceName, controller.signal)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
          setData(null);
          return;
        }
        setError(err.message || 'Failed to load service observability data');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [observabilityBaseUrl, serviceName, refetchCount]);

  return { data, loading, error, notFound, refetch };
}
