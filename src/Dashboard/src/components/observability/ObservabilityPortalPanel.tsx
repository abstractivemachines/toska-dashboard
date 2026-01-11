import { useConfig } from '../../context';
import type { ObservabilityPortalEntry } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';

interface ObservabilityPortalPanelProps {
  entries: ObservabilityPortalEntry[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ObservabilityPortalPanel({
  entries,
  loading,
  error,
  onRetry,
}: ObservabilityPortalPanelProps) {
  const { buildObservabilityUrl } = useConfig();

  if (loading) {
    return (
      <Panel title="Observability Portal">
        <LoadingState message="Loading observability portal..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Observability Portal">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  const items = entries ?? [];

  return (
    <Panel title="Observability Portal">
      {items.length === 0 ? (
        <p className="muted">No portal entries available yet.</p>
      ) : (
        <ul className="portal-list">
          {items.map((entry) => {
            const isTemplated = entry.path.includes('{');
            const href = isTemplated ? '' : buildObservabilityUrl(entry.path);
            return (
              <li key={entry.path} className="portal-card">
                <div className="portal-card-header">
                  <h3>{entry.name}</h3>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className="portal-link">
                      Open
                    </a>
                  ) : (
                    <span className="portal-template">Template</span>
                  )}
                </div>
                <p>{entry.description}</p>
                <code>{entry.path}</code>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
