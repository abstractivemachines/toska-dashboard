import {
  ObservabilityPortalPanel,
  MetricSummaryPanel,
  MetricChartsPanel,
  SloStatusPanel,
  BurnRateAlertsPanel,
  ReleaseHistoryPanel,
  PlaybooksPanel,
  TopologyOverviewPanel,
} from '../components/observability';
import {
  useObservabilityPortal,
  useObservabilityMetricSummaries,
  useObservabilitySloStatuses,
  useObservabilityBurnRateAlerts,
  useObservabilityRecentReleases,
  useObservabilityPlaybooks,
  useObservabilityTopology,
} from '../hooks';

export function ObservabilityPage() {
  const portal = useObservabilityPortal();
  const metrics = useObservabilityMetricSummaries();
  const slos = useObservabilitySloStatuses();
  const alerts = useObservabilityBurnRateAlerts();
  const releases = useObservabilityRecentReleases();
  const playbooks = useObservabilityPlaybooks();
  const topology = useObservabilityTopology();

  return (
    <div className="observability-grid">
      <ObservabilityPortalPanel
        entries={portal.data}
        loading={portal.loading}
        error={portal.error}
        onRetry={portal.refetch}
      />
      <MetricSummaryPanel
        summaries={metrics.data}
        loading={metrics.loading}
        error={metrics.error}
        onRetry={metrics.refetch}
      />
      <MetricChartsPanel
        metrics={metrics.data}
        slos={slos.data}
        loading={metrics.loading || slos.loading}
        error={metrics.error || slos.error}
        onRetry={() => {
          metrics.refetch();
          slos.refetch();
        }}
      />
      <SloStatusPanel
        statuses={slos.data}
        loading={slos.loading}
        error={slos.error}
        onRetry={slos.refetch}
      />
      <BurnRateAlertsPanel
        alerts={alerts.data}
        loading={alerts.loading}
        error={alerts.error}
        onRetry={alerts.refetch}
      />
      <ReleaseHistoryPanel
        releases={releases.data}
        loading={releases.loading}
        error={releases.error}
        onRetry={releases.refetch}
      />
      <PlaybooksPanel
        playbooks={playbooks.data}
        loading={playbooks.loading}
        error={playbooks.error}
        onRetry={playbooks.refetch}
      />
      <TopologyOverviewPanel
        graph={topology.data}
        loading={topology.loading}
        error={topology.error}
        onRetry={topology.refetch}
      />
    </div>
  );
}
