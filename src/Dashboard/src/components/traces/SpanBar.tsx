import type { TraceSpanDto } from '../../types/api';
import { useMemo, useState } from 'react';

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
  const groupedAttributes = useMemo(() => {
    if (attributes.length === 0) return [];

    const groups = new Map<string, Array<{ fullKey: string; key: string; value: string | null }>>();
    attributes.forEach(([key, value]) => {
      const separatorIndex = key.indexOf('.');
      const group = separatorIndex > 0 ? key.slice(0, separatorIndex) : 'other';
      const shortKey = separatorIndex > 0 ? key.slice(separatorIndex + 1) : key;
      const list = groups.get(group) ?? [];
      list.push({ fullKey: key, key: shortKey, value });
      groups.set(group, list);
    });

    const result = Array.from(groups.entries())
      .map(([group, items]) => ({
        group,
        items: items.sort((a, b) => a.key.localeCompare(b.key)),
      }))
      .sort((a, b) => {
        if (a.group === 'other') return 1;
        if (b.group === 'other') return -1;
        return a.group.localeCompare(b.group);
      });

    return result;
  }, [attributes]);

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
                <span className="span-attributes-count">
                  {attributes.length} items · {groupedAttributes.length} groups
                </span>
              </div>
              <div className="span-attributes-groups">
                {groupedAttributes.map((group) => (
                  <div key={group.group} className="span-attributes-group">
                    <div className="span-attributes-group-header">
                      <span className="span-attributes-group-title">
                        {group.group.replace(/_/g, ' ')}
                      </span>
                      <span className="span-attributes-group-count">{group.items.length}</span>
                    </div>
                    <dl className="span-attributes-list">
                      {group.items.map((item) => (
                        <div key={item.fullKey} className="span-attribute-row">
                          <dt className="span-attribute-key" title={item.fullKey}>
                            {item.key}
                          </dt>
                          <dd className="span-attribute-value">{item.value || '-'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { SpanWithLayout };
