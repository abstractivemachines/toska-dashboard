import { RadialBar, RadialBarChart } from 'recharts';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const normalized = severity ? severity.toLowerCase() : 'unknown';
  const label = normalized.replace(/-/g, ' ');

  const colorMap: Record<string, string> = {
    ok: '#34d399',
    low: '#34d399',
    warning: '#fbbf24',
    medium: '#fbbf24',
    critical: '#f87171',
    high: '#f87171',
    unknown: '#94a3b8',
  };

  const valueMap: Record<string, number> = {
    ok: 92,
    low: 92,
    warning: 68,
    medium: 68,
    critical: 40,
    high: 40,
    unknown: 55,
  };

  const color = colorMap[normalized] ?? colorMap.unknown;
  const value = valueMap[normalized] ?? valueMap.unknown;

  const data = [{ name: 'status', value, fill: color }];

  return (
    <span className={`severity-pill severity-${normalized} ${className}`.trim()}>
      <RadialBarChart
        width={56}
        height={56}
        innerRadius="70%"
        outerRadius="100%"
        startAngle={90}
        endAngle={-270}
        data={data}
      >
        <RadialBar
          background
          dataKey="value"
          cornerRadius={999}
          clockWise
          minAngle={10}
          stroke={color}
          fill={color}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="severity-center">
          {label}
        </text>
      </RadialBarChart>
    </span>
  );
}
