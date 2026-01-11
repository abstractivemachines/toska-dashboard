import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PrometheusResult } from '../../types/api';

interface MetricCardProps {
  title: string;
  data: PrometheusResult | null;
  loading: boolean;
  error: string | null;
  unit?: string;
  color?: string;
  formatValue?: (value: number) => string;
}

type ChartPoint = { ts: number; value: number };

function extractChartData(data: PrometheusResult | null): ChartPoint[] {
  if (!data || data.status !== 'success' || data.data.result.length === 0) {
    return [];
  }

  const result = data.data.result[0];

  // Range query (matrix)
  if (result.values) {
    return result.values.map(([ts, val]) => ({
      ts,
      value: parseFloat(val) || 0,
    }));
  }

  // Instant query (vector)
  if (result.value) {
    const [ts, val] = result.value;
    return [{ ts, value: parseFloat(val) || 0 }];
  }

  return [];
}

function getCurrentValue(data: PrometheusResult | null): number | null {
  if (!data || data.status !== 'success' || data.data.result.length === 0) {
    return null;
  }

  const result = data.data.result[0];

  if (result.values && result.values.length > 0) {
    const lastValue = result.values[result.values.length - 1];
    return parseFloat(lastValue[1]) || 0;
  }

  if (result.value) {
    return parseFloat(result.value[1]) || 0;
  }

  return null;
}

const defaultFormatValue = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 0.01 && value > 0) return value.toExponential(1);
  return value.toFixed(2);
};

export function MetricCard({
  title,
  data,
  loading,
  error,
  unit = '',
  color = '#3b82f6',
  formatValue = defaultFormatValue,
}: MetricCardProps) {
  const chartData = extractChartData(data);
  const currentValue = getCurrentValue(data);
  const noData = chartData.length === 0;

  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-body">
        {loading && <span className="muted">Loading...</span>}
        {!loading && error && (
          <span className="error" title={error}>
            No data
          </span>
        )}
        {!loading && !error && currentValue !== null && (
          <span className="metric-value">
            {formatValue(currentValue)}
            {unit && <span className="metric-unit">{unit}</span>}
          </span>
        )}
        {!loading && !error && currentValue === null && <span className="muted">N/A</span>}
        {!loading && !error && (
          <div className="metric-chart">
            {noData ? (
              <div className="sparkline-empty">
                <span className="muted">No data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`metricGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="ts"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                    type="number"
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                    width={38}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatValue(Number(value))}
                    labelFormatter={(ts) => new Date(Number(ts) * 1000).toLocaleTimeString()}
                    contentStyle={{
                      background: 'var(--color-bg-alt)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <Area
                    dataKey="value"
                    type="monotone"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#metricGradient-${title})`}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 1, stroke: color }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
