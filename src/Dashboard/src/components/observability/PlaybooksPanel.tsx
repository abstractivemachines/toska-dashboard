import type { PlaybookDefinition } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';
import { PlaybookList } from './PlaybookList';

interface PlaybooksPanelProps {
  playbooks: PlaybookDefinition[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function PlaybooksPanel({ playbooks, loading, error, onRetry }: PlaybooksPanelProps) {
  if (loading) {
    return (
      <Panel title="Playbooks">
        <LoadingState message="Loading playbooks..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Playbooks">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  return (
    <Panel title="Playbooks">
      <PlaybookList playbooks={playbooks ?? []} />
    </Panel>
  );
}
