import type { SloStatus } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';
import { SloStatusList } from './SloStatusList';

interface SloStatusPanelProps {
  statuses: SloStatus[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function SloStatusPanel({ statuses, loading, error, onRetry }: SloStatusPanelProps) {
  if (loading) {
    return (
      <Panel title="SLO Statuses">
        <LoadingState message="Loading SLO statuses..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="SLO Statuses">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  return (
    <Panel title="SLO Statuses">
      <SloStatusList statuses={statuses ?? []} />
    </Panel>
  );
}
