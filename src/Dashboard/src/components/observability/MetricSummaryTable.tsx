import type { MetricSummary } from '../../types/api';

interface MetricSummaryTableProps {
  summaries: MetricSummary[];
}

function formatRate(value: number) {
  return `${value.toFixed(1)}/s`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function formatLatencyMs(value: number) {
  if (value < 1) return `${(value * 1000).toFixed(0)}us`;
  if (value < 1000) return `${value.toFixed(0)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export function MetricSummaryTable({ summaries }: MetricSummaryTableProps) {
  if (summaries.length === 0) {
    return <p className="muted">No metric summaries available.</p>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Service</th>
            <th className="numeric">Req Rate</th>
            <th className="numeric">Error Rate</th>
            <th className="numeric">P95 Latency</th>
            <th className="numeric">Saturation</th>
            <th>Captured</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr key={`${summary.service}-${summary.capturedAt}`}>
              <td>{summary.service}</td>
              <td className="numeric">{formatRate(summary.requestRatePerSecond)}</td>
              <td className="numeric">{formatPercent(summary.errorRate)}</td>
              <td className="numeric">{formatLatencyMs(summary.p95LatencyMs)}</td>
              <td className="numeric">{formatPercent(summary.saturation)}</td>
              <td>{formatTimestamp(summary.capturedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
