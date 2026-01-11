import type { ReleaseRecord } from '../../types/api';

interface ReleaseTableProps {
  releases: ReleaseRecord[];
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export function ReleaseTable({ releases }: ReleaseTableProps) {
  if (releases.length === 0) {
    return <p className="muted">No release history available.</p>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Version</th>
            <th>Env</th>
            <th>Deployed</th>
            <th>Triggered By</th>
            <th>Blast Radius</th>
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release) => (
            <tr key={release.id}>
              <td>{release.service}</td>
              <td>{release.version}</td>
              <td>{release.environment}</td>
              <td>{formatTimestamp(release.deployedAt)}</td>
              <td>{release.triggeredBy}</td>
              <td>
                {release.blastRadiusServices.length === 0
                  ? 'None'
                  : release.blastRadiusServices.join(', ')}
              </td>
              <td className="release-links">
                <a href={release.diffUrl} target="_blank" rel="noreferrer">
                  Diff
                </a>
                <a href={release.rollbackUrl} target="_blank" rel="noreferrer">
                  Rollback
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
