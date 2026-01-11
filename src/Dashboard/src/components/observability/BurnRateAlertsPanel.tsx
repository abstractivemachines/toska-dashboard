import type { BurnRateAlert } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';
import { BurnRateAlertsList } from './BurnRateAlertsList';

interface BurnRateAlertsPanelProps {
  alerts: BurnRateAlert[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function BurnRateAlertsPanel({
  alerts,
  loading,
  error,
  onRetry,
}: BurnRateAlertsPanelProps) {
  if (loading) {
    return (
      <Panel title="Burn-Rate Alerts">
        <LoadingState message="Loading burn-rate alerts..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Burn-Rate Alerts">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  return (
    <Panel title="Burn-Rate Alerts">
      <BurnRateAlertsList alerts={alerts ?? []} />
    </Panel>
  );
}
