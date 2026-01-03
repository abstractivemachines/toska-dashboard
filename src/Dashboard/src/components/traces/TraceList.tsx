import { useState, useCallback, useMemo } from 'react';
import { useTraces } from '../../hooks';
import { LoadingState, ErrorState } from '../common';
import { TraceRow } from './TraceRow';
import { TraceFilters } from './TraceFilters';
import type { TraceQueryParameters } from '../../types/api';

export function TraceList() {
  const [filters, setFilters] = useState<TraceQueryParameters>({
    excludeBuiltInServices: true,
  });
  const [includeTotal, setIncludeTotal] = useState(false);
  const queryParams = useMemo(
    () => ({ ...filters, includeTotal }),
    [filters, includeTotal]
  );
  const { data, loading, error, refetch } = useTraces(queryParams);
  const sortedItems = useMemo(() => {
    if (!data) return [];
    return [...data.items].sort((a, b) => {
      return new Date(b.startTimeUtc).getTime() - new Date(a.startTimeUtc).getTime();
    });
  }, [data]);

  const handleFilterChange = useCallback((params: TraceQueryParameters) => {
    setFilters((current) => ({
      ...params,
      excludeBuiltInServices: params.excludeBuiltInServices ?? current.excludeBuiltInServices ?? true,
    }));
  }, []);

  return (
    <div className="trace-list">
      <TraceFilters
        onFilterChange={handleFilterChange}
      />

      {loading && <LoadingState message="Loading traces..." />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && (!data || sortedItems.length === 0) && (
        <p className="muted">No traces found.</p>
      )}
      {!loading && !error && data && sortedItems.length > 0 && (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-trace-id">Trace ID</th>
                  <th className="col-service">Service</th>
                  <th className="col-operation">Operation</th>
                  <th className="col-status">Status</th>
                  <th className="col-duration numeric">Duration</th>
                  <th className="col-spans numeric">Spans</th>
                  <th className="col-started">Started</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((trace) => (
                  <TraceRow key={trace.traceId} trace={trace} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-info">
            {includeTotal
              ? `Showing ${sortedItems.length} of ${data.total} traces (Page ${data.page})`
              : `Showing ${sortedItems.length} traces (Page ${data.page})`}
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
