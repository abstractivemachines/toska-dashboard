import type { ReleaseRecord } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';
import { ReleaseTable } from './ReleaseTable';

interface ReleaseHistoryPanelProps {
  releases: ReleaseRecord[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ReleaseHistoryPanel({
  releases,
  loading,
  error,
  onRetry,
}: ReleaseHistoryPanelProps) {
  if (loading) {
    return (
      <Panel title="Recent Releases">
        <LoadingState message="Loading release history..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Recent Releases">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  return (
    <Panel title="Recent Releases">
      <ReleaseTable releases={releases ?? []} />
    </Panel>
  );
}
