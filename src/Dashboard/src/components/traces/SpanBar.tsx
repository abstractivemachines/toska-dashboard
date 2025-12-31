import type { TraceSpanDto } from '../../types/api';
import { useState } from 'react';

interface SpanWithLayout extends TraceSpanDto {
  left: number;
  width: number;
  depth: number;
  durationMs: number;
}

interface SpanBarProps {
  span: SpanWithLayout;
}

function formatDuration(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function SpanBar({ span }: SpanBarProps) {
  const [expanded, setExpanded] = useState(false);

  const isError = span.status === 'Error';
  const barColor = isError ? 'var(--color-error)' : 'var(--color-primary)';
  const attributes = span.attributes ? Object.entries(span.attributes) : [];

  return (
    <div className="span-row" style={{ paddingLeft: `${span.depth * 20}px` }}>
      <div className="span-label">
        <button
          className="span-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? '−' : '+'}
        </button>
        <span className="span-service">{span.serviceName}</span>
        <span className="span-operation">{span.operationName}</span>
      </div>
      <div className="span-timeline">
        <div
          className="span-bar"
          style={{
            left: `${span.left}%`,
            width: `${Math.max(span.width, 0.5)}%`,
            backgroundColor: barColor,
          }}
          title={`${span.operationName}: ${formatDuration(span.durationMs)}`}
        />
        <span className="span-duration">{formatDuration(span.durationMs)}</span>
      </div>

      {expanded && (
        <div className="span-details">
          <div className="span-meta-grid">
            <div className="span-meta-item">
              <span className="span-meta-label">Span ID</span>
              <span className="span-meta-value"><code>{span.spanId}</code></span>
            </div>
            {span.parentSpanId && (
              <div className="span-meta-item">
                <span className="span-meta-label">Parent Span</span>
                <span className="span-meta-value"><code>{span.parentSpanId}</code></span>
              </div>
            )}
            <div className="span-meta-item">
              <span className="span-meta-label">Kind</span>
              <span className="span-meta-value">{span.kind || 'Internal'}</span>
            </div>
            <div className="span-meta-item">
              <span className="span-meta-label">Status</span>
              <span className={`span-meta-value span-status ${isError ? 'error' : ''}`}>
                {span.status}
              </span>
            </div>
          </div>

          {attributes.length > 0 && (
            <div className="span-attributes-panel">
              <div className="span-attributes-header">
                <span>Span Attributes</span>
                <span className="span-attributes-count">{attributes.length} items</span>
              </div>
              <dl className="span-attributes-list">
                {attributes.map(([key, value]) => (
                  <div key={key} className="span-attribute-row">
                    <dt className="span-attribute-key">{key}</dt>
                    <dd className="span-attribute-value">{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { SpanWithLayout };
