import type { SloStatus } from '../../types/api';
import { SeverityBadge } from './SeverityBadge';

interface SloStatusListProps {
  statuses: SloStatus[];
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function SloStatusList({ statuses }: SloStatusListProps) {
  if (statuses.length === 0) {
    return <p className="muted">No SLO statuses available.</p>;
  }

  return (
    <div className="slo-grid">
      {statuses.map((status) => (
        <article key={status.definition.id} className="slo-card">
          <div className="slo-header">
            <div>
              <h3>{status.definition.name}</h3>
              <p className="muted">
                {status.definition.service} • Objective {formatPercent(status.definition.objective)}
              </p>
            </div>
            <SeverityBadge severity={status.severity} />
          </div>
          <p className="slo-description">{status.definition.description}</p>
          <div className="slo-metrics">
            <div>
              <span className="slo-metric-label">Max burn</span>
              <span className="slo-metric-value">{status.maxBurnRate.toFixed(2)}x</span>
            </div>
            <div>
              <span className="slo-metric-label">Alerting</span>
              <span className="slo-metric-value">
                {status.isBurnRateAlert ? 'Active' : 'Stable'}
              </span>
            </div>
          </div>
          <div className="slo-windows">
            {status.windows.map((window) => (
              <div key={window.windowLabel} className="slo-window">
                <span className="slo-window-label">{window.windowLabel}</span>
                <span>SLI {formatPercent(window.sli)}</span>
                <span>Burn {window.burnRate.toFixed(2)}x</span>
                <span>Budget {formatPercent(window.errorBudgetRemaining)}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
