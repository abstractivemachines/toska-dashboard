import { useState, useCallback, useMemo } from 'react';
import { useTraces } from '../../hooks';
import { LoadingState, ErrorState } from '../common';
import { TraceRow } from './TraceRow';
import { TraceFilters } from './TraceFilters';
import type { TraceQueryParameters } from '../../types/api';

export function TraceList() {
  const [filters, setFilters] = useState<TraceQueryParameters>({});
  const [includeTotal, setIncludeTotal] = useState(false);
  const queryParams = useMemo(
    () => ({ ...filters, includeTotal }),
    [filters, includeTotal]
  );
  const { data, loading, error, refetch } = useTraces(queryParams);

  const handleFilterChange = useCallback((params: TraceQueryParameters) => {
    setFilters(params);
  }, []);

  return (
    <div className="trace-list">
      <TraceFilters onFilterChange={handleFilterChange} />

      {loading && <LoadingState message="Loading traces..." />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || data.items.length === 0) && (
        <p className="muted">No traces found.</p>
      )}
      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trace ID</th>
                  <th>Service</th>
                  <th>Operation</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Spans</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((trace) => (
                  <TraceRow key={trace.traceId} trace={trace} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-info">
            {includeTotal
              ? `Showing ${data.items.length} of ${data.total} traces (Page ${data.page})`
              : `Showing ${data.items.length} traces (Page ${data.page})`}
            {' '}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIncludeTotal((value) => !value)}
            >
              {includeTotal ? 'Hide total' : 'Show total'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
