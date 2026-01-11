import { useServiceObservabilityDashboard } from '../../hooks';
import { ErrorState, LoadingState, Panel } from '../common';
import { SloStatusList } from './SloStatusList';
import { ReleaseTable } from './ReleaseTable';
import { PlaybookList } from './PlaybookList';
import { TopologyPanel } from './TopologyPanel';

interface ServiceObservabilityPanelProps {
  serviceName: string;
}

function formatRate(value: number) {
  return `${value.toFixed(1)}/s`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatLatencyMs(value: number) {
  if (value < 1) return `${(value * 1000).toFixed(0)}us`;
  if (value < 1000) return `${value.toFixed(0)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

export function ServiceObservabilityPanel({ serviceName }: ServiceObservabilityPanelProps) {
  const { data, loading, error, notFound, refetch } = useServiceObservabilityDashboard(serviceName);

  if (loading) {
    return (
      <Panel title="Observability">
        <LoadingState message="Loading observability dashboard..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Observability">
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );
  }

  if (notFound || !data) {
    return (
      <Panel title="Observability">
        <p className="muted">No observability dashboard available for this service.</p>
      </Panel>
    );
  }

  const metrics = data.metrics;

  return (
    <Panel title="Observability">
      <div className="observability-section">
        <h3>Service Metrics</h3>
        {metrics ? (
          <div className="observability-metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Request Rate</span>
              </div>
              <div className="metric-body">
                <span className="metric-value">{formatRate(metrics.requestRatePerSecond)}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Error Rate</span>
              </div>
              <div className="metric-body">
                <span className="metric-value">{formatPercent(metrics.errorRate)}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">P95 Latency</span>
              </div>
              <div className="metric-body">
                <span className="metric-value">{formatLatencyMs(metrics.p95LatencyMs)}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-title">Saturation</span>
              </div>
              <div className="metric-body">
                <span className="metric-value">{formatPercent(metrics.saturation)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">No metric snapshot available for this service.</p>
        )}
      </div>

      <div className="observability-section">
        <h3>SLO Statuses</h3>
        <SloStatusList statuses={data.sloStatuses} />
      </div>

      <div className="observability-section">
        <h3>Recent Releases</h3>
        <ReleaseTable releases={data.recentReleases} />
      </div>

      <div className="observability-section">
        <h3>Playbooks</h3>
        <PlaybookList playbooks={data.playbooks} />
      </div>

      <div className="observability-section">
        <h3>Topology</h3>
        <TopologyPanel graph={data.topology} />
      </div>
    </Panel>
  );
}
