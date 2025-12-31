import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TraceRow } from './TraceRow';
import type { TraceSummaryDto } from '../../types/api';

const trace: TraceSummaryDto = {
  traceId: '0123456789abcdef0123456789abcdef',
  serviceName: 'checkout',
  operation: 'GET /checkout',
  startTimeUtc: '2024-01-01T10:00:00.000Z',
  endTimeUtc: '2024-01-01T10:00:00.150Z',
  durationMs: 150,
  status: 'Ok',
  spanCount: 3,
  correlationId: null,
};

function renderRow() {
  return render(
    <table>
      <tbody>
        <TraceRow trace={trace} />
      </tbody>
    </table>
  );
}

describe('TraceRow', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('renders trace metadata', () => {
    renderRow();

    expect(screen.getByText('checkout')).toBeInTheDocument();
    expect(screen.getByText('GET /checkout')).toBeInTheDocument();
    expect(screen.getByText('0123456789abcdef...')).toBeInTheDocument();
    expect(screen.getByText('150.0ms')).toBeInTheDocument();
    expect(screen.getByText('Ok')).toBeInTheDocument();
  });

  it('navigates to trace detail on click', () => {
    renderRow();

    fireEvent.click(screen.getByRole('button', { name: /view trace/i }));
    expect(window.location.hash).toBe('#/traces/0123456789abcdef0123456789abcdef');
  });

  it('navigates to trace detail on Enter key', () => {
    renderRow();

    fireEvent.keyDown(screen.getByRole('button', { name: /view trace/i }), { key: 'Enter' });
    expect(window.location.hash).toBe('#/traces/0123456789abcdef0123456789abcdef');
  });
});
