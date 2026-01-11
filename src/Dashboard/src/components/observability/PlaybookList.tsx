import type { PlaybookDefinition } from '../../types/api';
import { SeverityBadge } from './SeverityBadge';

interface PlaybookListProps {
  playbooks: PlaybookDefinition[];
}

export function PlaybookList({ playbooks }: PlaybookListProps) {
  if (playbooks.length === 0) {
    return <p className="muted">No playbooks available.</p>;
  }

  return (
    <div className="playbook-grid">
      {playbooks.map((playbook) => (
        <article key={playbook.id} className="playbook-card">
          <div className="playbook-header">
            <div>
              <h3>{playbook.title}</h3>
              <p className="muted">{playbook.service}</p>
            </div>
            <SeverityBadge severity={playbook.severity} />
          </div>
          <p className="playbook-description">{playbook.description}</p>
          {playbook.relatedReleaseIds.length > 0 && (
            <p className="playbook-related">
              Related releases: {playbook.relatedReleaseIds.join(', ')}
            </p>
          )}
          <details className="playbook-steps">
            <summary>Steps ({playbook.steps.length})</summary>
            <div className="playbook-steps-body">
              {playbook.steps.map((step, index) => (
                <div key={`${playbook.id}-${step.title}`} className="playbook-step">
                  <h4>
                    {index + 1}. {step.title}
                  </h4>
                  <div className="playbook-step-grid">
                    <div>
                      <span className="playbook-step-label">Logs</span>
                      <ul>
                        {step.logSnippets.map((snippet) => (
                          <li key={snippet}>
                            <code>{snippet}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="playbook-step-label">Metrics</span>
                      <ul>
                        {step.metricsOverlays.map((metric) => (
                          <li key={metric}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="playbook-step-label">Actions</span>
                      <ul>
                        {step.actions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
