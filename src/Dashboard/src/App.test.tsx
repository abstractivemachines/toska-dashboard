import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.location.hash = '';
  });

  it('renders header with ToskaMesh branding', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    // Act
    render(<App />);

    // Assert
    expect(screen.getByText('ToskaMesh')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders navigation tabs', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    // Act
    render(<App />);

    // Assert
    const navigation = screen.getByRole('navigation');
    expect(within(navigation).getByText('Services')).toBeInTheDocument();
    expect(within(navigation).getByText('Traces')).toBeInTheDocument();
    expect(within(navigation).getByText('Observability')).toBeInTheDocument();
  });

  it('shows home page by default', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    // Act
    render(<App />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Service Catalog')).toBeInTheDocument();
    });
  });

  it('shows service page when navigating to #/services/:name', async () => {
    // Arrange
    window.location.hash = '#/services/my-service';
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.url;

      if (url.includes('/api/dashboard/services')) {
        return {
          ok: true,
          json: async () => [
            {
              serviceName: 'my-service',
              instances: [],
              health: [],
              metadata: null,
            },
          ],
        } as Response;
      }

      if (url.includes('/api/dashboard/prometheus/query-range')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: { resultType: 'matrix', result: [] },
          }),
        } as Response;
      }

      if (url.includes('/observability/dashboards/service/')) {
        return {
          ok: true,
          json: async () => ({
            service: 'my-service',
            metrics: null,
            sloStatuses: [],
            recentReleases: [],
            playbooks: [],
            topology: {
              generatedAt: new Date().toISOString(),
              nodes: [],
              edges: [],
            },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => [],
      } as Response;
    });

    // Act
    render(<App />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('my-service')).toBeInTheDocument();
    });
  });

  it('shows traces page when navigating to #/traces', async () => {
    // Arrange
    window.location.hash = '#/traces';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], total: 0, page: 1, pageSize: 50 }),
    } as Response);

    // Act
    render(<App />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Distributed Traces')).toBeInTheDocument();
    });
  });

  it('shows not found page for unknown routes', async () => {
    // Arrange
    window.location.hash = '#/unknown-route';
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    // Act
    render(<App />);

    // Assert
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
