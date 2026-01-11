import type { TopologyGraph } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';
import { TopologyPanel } from './TopologyPanel';

interface TopologyOverviewPanelProps {
  graph: TopologyGraph | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function TopologyOverviewPanel({
  graph,
  loading,
  error,
  onRetry,
}: TopologyOverviewPanelProps) {
  if (loading) {
    return (
      <Panel title="Topology Overview">
        <LoadingState message="Loading topology graph..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Topology Overview">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  return (
    <Panel title="Topology Overview">
      <TopologyPanel graph={graph} />
    </Panel>
  );
}
