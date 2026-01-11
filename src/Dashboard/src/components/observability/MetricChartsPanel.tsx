import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MetricSummary, SloStatus } from '../../types/api';
import { ErrorState, LoadingState, Panel } from '../common';

type Accent = 'primary' | 'warning' | 'error' | 'success';

interface MetricChartsPanelProps {
  metrics: MetricSummary[] | null;
  slos: SloStatus[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface BarDatum {
  label: string;
  value: number;
  accent?: Accent;
}

const accentColors: Record<Accent, string> = {
  primary: '#60a5fa',
  warning: '#fbbf24',
  error: '#f87171',
  success: '#34d399',
};

interface SparkBarChartProps {
  title: string;
  unit?: string;
  data: BarDatum[];
  formatValue: (value: number) => string;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatLatencyMs(value: number) {
  if (value < 1) return `${(value * 1000).toFixed(0)}us`;
  if (value < 1000) return `${value.toFixed(0)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

function MetricBarChart({ title, unit, data, formatValue }: SparkBarChartProps) {
  const noData = data.length === 0;
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h4>{title}</h4>
        {unit ? <span className="chart-unit">{unit}</span> : null}
      </div>
      {noData ? (
        <p className="muted">No data available.</p>
      ) : (
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                width={40}
                tickFormatter={(v) => formatValue(v).replace(/\\s.*$/, '')}
              />
              <Tooltip
                formatter={(value) => formatValue(Number(value))}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}
                itemStyle={{ color: 'var(--color-text)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={28}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={accentColors[entry.accent ?? 'primary']} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function MetricChartsPanel({ metrics, slos, loading, error, onRetry }: MetricChartsPanelProps) {
  if (loading) {
    return (
      <Panel title="Visual Overview">
        <LoadingState message="Loading charts..." />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Visual Overview">
        <ErrorState message={error} onRetry={onRetry} />
      </Panel>
    );
  }

  const metricList = [...(metrics ?? [])];
  const sloList = [...(slos ?? [])];

  const throughput = metricList
    .sort((a, b) => b.requestRatePerSecond - a.requestRatePerSecond)
    .slice(0, 6)
    .map((summary) => ({
      label: summary.service,
      value: summary.requestRatePerSecond,
      accent: 'primary' as Accent,
    }));

  const errorRates = metricList
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 6)
    .map((summary) => ({
      label: summary.service,
      value: summary.errorRate * 100,
      accent: (summary.errorRate > 0.05
        ? 'error'
        : summary.errorRate > 0.01
        ? 'warning'
        : 'success') as Accent,
    }));

  const latency = metricList
    .sort((a, b) => b.p95LatencyMs - a.p95LatencyMs)
    .slice(0, 6)
    .map((summary) => ({
      label: summary.service,
      value: summary.p95LatencyMs,
      accent: (summary.p95LatencyMs > 800 ? 'error' : summary.p95LatencyMs > 300 ? 'warning' : 'primary') as Accent,
    }));

  const burnRates = sloList
    .sort((a, b) => b.maxBurnRate - a.maxBurnRate)
    .slice(0, 6)
    .map((status) => ({
      label: status.definition.service,
      value: status.maxBurnRate,
      accent: (status.maxBurnRate >= 2 ? 'error' : status.maxBurnRate >= 1 ? 'warning' : 'success') as Accent,
    }));

  return (
    <Panel title="Visual Overview">
      <div className="chart-grid">
        <MetricBarChart title="Throughput by Service" unit="req/s" data={throughput} formatValue={(v) => `${v.toFixed(1)} /s`} />
        <MetricBarChart title="Error Rate" unit="%" data={errorRates} formatValue={formatPercent} />
        <MetricBarChart title="P95 Latency" unit="ms" data={latency} formatValue={formatLatencyMs} />
        <MetricBarChart title="Max Burn Rate" data={burnRates} formatValue={(v) => `${v.toFixed(2)}x`} />
      </div>
    </Panel>
  );
}
