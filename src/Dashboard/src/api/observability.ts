/**
 * Observability API functions
 */

import type {
  ObservabilityPortalEntry,
  MetricSummary,
  TopologyGraph,
  SloStatus,
  BurnRateAlert,
  ReleaseRecord,
  PlaybookDefinition,
  ServiceDashboard,
  ReleaseIngestRequest,
  RollbackResult,
} from '../types/api';
import { apiGet } from './client';

const OBSERVABILITY_BASE = '/observability';

export async function getObservabilityPortal(
  baseUrl: string,
  signal?: AbortSignal
): Promise<ObservabilityPortalEntry[]> {
  return apiGet<ObservabilityPortalEntry[]>(baseUrl, `${OBSERVABILITY_BASE}/portal`, undefined, signal);
}

export async function getMetricSummaries(
  baseUrl: string,
  signal?: AbortSignal
): Promise<MetricSummary[]> {
  return apiGet<MetricSummary[]>(baseUrl, `${OBSERVABILITY_BASE}/metrics/summary`, undefined, signal);
}

export async function getTopologyGraph(
  baseUrl: string,
  signal?: AbortSignal
): Promise<TopologyGraph> {
  return apiGet<TopologyGraph>(baseUrl, `${OBSERVABILITY_BASE}/topology`, undefined, signal);
}

export async function getSloStatuses(
  baseUrl: string,
  signal?: AbortSignal
): Promise<SloStatus[]> {
  return apiGet<SloStatus[]>(baseUrl, `${OBSERVABILITY_BASE}/slo`, undefined, signal);
}

export async function getSloStatusesForService(
  baseUrl: string,
  serviceName: string,
  signal?: AbortSignal
): Promise<SloStatus[]> {
  return apiGet<SloStatus[]>(
    baseUrl,
    `${OBSERVABILITY_BASE}/slo/${encodeURIComponent(serviceName)}`,
    undefined,
    signal
  );
}

export async function getBurnRateAlerts(
  baseUrl: string,
  signal?: AbortSignal
): Promise<BurnRateAlert[]> {
  return apiGet<BurnRateAlert[]>(baseUrl, `${OBSERVABILITY_BASE}/alerts/burn-rate`, undefined, signal);
}

export async function getReleases(
  baseUrl: string,
  signal?: AbortSignal
): Promise<ReleaseRecord[]> {
  return apiGet<ReleaseRecord[]>(baseUrl, `${OBSERVABILITY_BASE}/releases`, undefined, signal);
}

export async function getRecentReleases(
  baseUrl: string,
  signal?: AbortSignal
): Promise<ReleaseRecord[]> {
  return apiGet<ReleaseRecord[]>(baseUrl, `${OBSERVABILITY_BASE}/releases/recent`, undefined, signal);
}

export async function getRelease(
  baseUrl: string,
  releaseId: string,
  signal?: AbortSignal
): Promise<ReleaseRecord> {
  return apiGet<ReleaseRecord>(
    baseUrl,
    `${OBSERVABILITY_BASE}/releases/${encodeURIComponent(releaseId)}`,
    undefined,
    signal
  );
}

export async function getPlaybooks(
  baseUrl: string,
  signal?: AbortSignal
): Promise<PlaybookDefinition[]> {
  return apiGet<PlaybookDefinition[]>(baseUrl, `${OBSERVABILITY_BASE}/playbooks`, undefined, signal);
}

export async function getPlaybook(
  baseUrl: string,
  playbookId: string,
  signal?: AbortSignal
): Promise<PlaybookDefinition> {
  return apiGet<PlaybookDefinition>(
    baseUrl,
    `${OBSERVABILITY_BASE}/playbooks/${encodeURIComponent(playbookId)}`,
    undefined,
    signal
  );
}

export async function getServiceDashboard(
  baseUrl: string,
  serviceName: string,
  signal?: AbortSignal
): Promise<ServiceDashboard> {
  return apiGet<ServiceDashboard>(
    baseUrl,
    `${OBSERVABILITY_BASE}/dashboards/service/${encodeURIComponent(serviceName)}`,
    undefined,
    signal
  );
}

export async function ingestRelease(
  baseUrl: string,
  request: ReleaseIngestRequest,
  signal?: AbortSignal
): Promise<ReleaseRecord> {
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${OBSERVABILITY_BASE}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function requestRollback(
  baseUrl: string,
  releaseId: string,
  signal?: AbortSignal
): Promise<RollbackResult> {
  const response = await fetch(
    `${baseUrl.replace(/\/+$/, '')}${OBSERVABILITY_BASE}/releases/${encodeURIComponent(releaseId)}/rollback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
