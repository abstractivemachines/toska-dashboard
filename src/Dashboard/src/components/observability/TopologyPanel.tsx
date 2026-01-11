import type { TopologyGraph } from '../../types/api';

interface TopologyPanelProps {
  graph: TopologyGraph | null;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
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

export function TopologyPanel({ graph }: TopologyPanelProps) {
  if (!graph) {
    return <p className="muted">No topology data available.</p>;
  }

  return (
    <div className="topology-panel">
      <div className="topology-summary">
        <div>
          <span className="topology-label">Nodes</span>
          <span className="topology-value">{graph.nodes.length}</span>
        </div>
        <div>
          <span className="topology-label">Edges</span>
          <span className="topology-value">{graph.edges.length}</span>
        </div>
        <div>
          <span className="topology-label">Generated</span>
          <span className="topology-value">{formatTimestamp(graph.generatedAt)}</span>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Node</th>
              <th className="numeric">Traffic</th>
              <th className="numeric">Error Rate</th>
              <th className="numeric">P95 Latency</th>
              <th>Alerts</th>
            </tr>
          </thead>
          <tbody>
            {graph.nodes.map((node) => (
              <tr key={node.id}>
                <td>{node.displayName}</td>
                <td className="numeric">{node.traffic}</td>
                <td className="numeric">{formatPercent(node.errorRate)}</td>
                <td className="numeric">{formatLatencyMs(node.p95LatencyMs)}</td>
                <td>
                  {node.alerts.length === 0 ? (
                    <span className="muted">None</span>
                  ) : (
                    <div className="topology-alerts">
                      {node.alerts.map((alert) => (
                        <span key={alert} className="pill pill-small">
                          {alert}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th className="numeric">Traffic</th>
              <th className="numeric">Avg Latency</th>
              <th className="numeric">Error Rate</th>
            </tr>
          </thead>
          <tbody>
            {graph.edges.map((edge, index) => (
              <tr key={`${edge.from}-${edge.to}-${index}`}>
                <td>{edge.from}</td>
                <td>{edge.to}</td>
                <td className="numeric">{edge.traffic}</td>
                <td className="numeric">{formatLatencyMs(edge.avgLatencyMs)}</td>
                <td className="numeric">{formatPercent(edge.errorRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
