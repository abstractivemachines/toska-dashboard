import type { MetricSummary } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';
import { MetricSummaryTable } from './MetricSummaryTable';

interface MetricSummaryPanelProps {
  summaries: MetricSummary[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function MetricSummaryPanel({
  summaries,
  loading,
  error,
  onRetry,
}: MetricSummaryPanelProps) {
  if (loading) {
    return (
      <Panel title="Metrics Summary">
        <LoadingState message="Loading metric summaries..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Metrics Summary">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  return (
    <Panel title="Metrics Summary">
      <MetricSummaryTable summaries={summaries ?? []} />
    </Panel>
  );
}
