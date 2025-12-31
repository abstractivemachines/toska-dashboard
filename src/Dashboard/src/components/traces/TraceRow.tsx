import type { TraceSummaryDto } from '../../types/api';
import { StatusBadge } from '../common';
import { navigate } from '../../router';

interface TraceRowProps {
  trace: TraceSummaryDto;
}

function formatDuration(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatRelativeTime(dateStr: string): string {
  const timestamp = new Date(dateStr).getTime();
  if (Number.isNaN(timestamp)) return dateStr;

  const diffMs = Math.max(0, Date.now() - timestamp);
  if (diffMs < 1000) return '<1s ago';

  const diffSeconds = diffMs / 1000;
  if (diffSeconds < 60) return `${diffSeconds.toFixed(1)}s ago`;

  const diffMinutes = diffSeconds / 60;
  if (diffMinutes < 60) return `${diffMinutes.toFixed(1)}m ago`;

  const diffHours = diffMinutes / 60;
  if (diffHours < 24) return `${diffHours.toFixed(1)}h ago`;

  const diffDays = diffHours / 24;
  return `${diffDays.toFixed(1)}d ago`;
}

export function TraceRow({ trace }: TraceRowProps) {
  const handleClick = () => {
    navigate(`/traces/${encodeURIComponent(trace.traceId)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <tr
      className="trace-row clickable"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View trace ${trace.traceId}`}
    >
      <td className="col-trace-id">
        <code className="trace-id">{trace.traceId.slice(0, 16)}...</code>
      </td>
      <td className="col-service">{trace.serviceName}</td>
      <td className="col-operation">{trace.operation}</td>
      <td className="col-status">
        <StatusBadge status={trace.status} size="small" />
      </td>
      <td className="col-duration numeric">{formatDuration(trace.durationMs)}</td>
      <td className="col-spans numeric">{trace.spanCount}</td>
      <td className="col-started">{formatRelativeTime(trace.startTimeUtc)}</td>
    </tr>
  );
}
