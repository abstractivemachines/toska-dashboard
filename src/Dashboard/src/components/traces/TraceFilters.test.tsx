import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TraceFilters } from './TraceFilters';
import { ConfigProvider } from '../../context';

function renderWithProviders(ui: React.ReactNode) {
  return render(<ConfigProvider>{ui}</ConfigProvider>);
}

function getUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

describe('TraceFilters', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows service suggestions and loads operations', async () => {
    vi.mocked(fetch).mockImplementation((input) => {
      const url = getUrl(input);
      if (url.endsWith('/api/dashboard/traces/services')) {
        return Promise.resolve({
          ok: true,
          json: async () => ['checkout', 'cart'],
        } as Response);
      }
      if (url.includes('/api/dashboard/traces/services/checkout/operations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ['GET /checkout', 'POST /checkout'],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    });

    renderWithProviders(
      <TraceFilters
        onFilterChange={vi.fn()}
      />
    );

    const serviceInput = screen.getByLabelText('Service');
    fireEvent.change(serviceInput, { target: { value: 'check' } });

    await waitFor(() => {
      expect(screen.getByText('checkout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('checkout'));

    const operationInput = screen.getByLabelText('Operation');
    await waitFor(() => {
      expect(operationInput).toHaveAttribute('placeholder', 'Type to search...');
    });

    fireEvent.change(operationInput, { target: { value: 'GET' } });

    await waitFor(() => {
      expect(screen.getByText('GET /checkout')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('GET /checkout'));
    expect(operationInput).toHaveValue('GET /checkout');
  });

  it('clears filters and notifies consumer', async () => {
    const onFilterChange = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    renderWithProviders(
      <TraceFilters
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Service'), { target: { value: 'checkout' } });
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'GET /checkout' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Ok' } });
    fireEvent.change(screen.getByLabelText('Min Duration (ms)'), { target: { value: '200' } });

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    const durationInput = screen.getByLabelText('Min Duration (ms)') as HTMLInputElement;

    await waitFor(() => {
      expect(screen.getByLabelText('Service')).toHaveValue('');
      expect(screen.getByLabelText('Operation')).toHaveValue('');
      expect(screen.getByLabelText('Status')).toHaveValue('');
      expect(durationInput.value).toBe('');
    });

    expect(onFilterChange).toHaveBeenCalledWith({ excludeBuiltInServices: true });
  });

  it('toggles built-in service filter and notifies consumer', async () => {
    const onFilterChange = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    renderWithProviders(
      <TraceFilters
        onFilterChange={onFilterChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Hide built-in services'));

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({ excludeBuiltInServices: false });
    });
  });
});
