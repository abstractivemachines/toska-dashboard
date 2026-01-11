import type { BurnRateAlert } from '../../types/api';
import { SeverityBadge } from './SeverityBadge';

interface BurnRateAlertsListProps {
  alerts: BurnRateAlert[];
}

export function BurnRateAlertsList({ alerts }: BurnRateAlertsListProps) {
  if (alerts.length === 0) {
    return <p className="muted">No active burn-rate alerts.</p>;
  }

  return (
    <ul className="burn-alerts">
      {alerts.map((alert) => (
        <li key={alert.sloId} className="burn-alert-card">
          <div className="burn-alert-header">
            <div>
              <h3>{alert.service}</h3>
              <p className="muted">Burn rate {alert.burnRate.toFixed(2)}x</p>
            </div>
            <SeverityBadge severity={alert.severity} />
          </div>
          <div className="burn-alert-windows">
            {alert.windows.map((window) => (
              <div key={window.windowLabel} className="burn-alert-window">
                <span>{window.windowLabel}</span>
                <span>SLI {(window.sli * 100).toFixed(2)}%</span>
                <span>Budget {(window.errorBudgetRemaining * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
