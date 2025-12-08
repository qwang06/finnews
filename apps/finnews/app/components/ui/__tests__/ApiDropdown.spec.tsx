import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiDropdown } from '../ApiDropdown';
import { ComboboxOption } from '../Combobox';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiDropdown', () => {
  const mockData = [
    { id: 1, name: 'Option 1', value: 'opt1' },
    { id: 2, name: 'Option 2', value: 'opt2' },
    { id: 3, name: 'Option 3', value: 'opt3' },
  ];

  const mapResponseToOptions = (data: typeof mockData): ComboboxOption[] => {
    return data.map((item) => ({
      value: item.value,
      label: item.name,
    }));
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state with custom or default placeholder', () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(() => {
            /* never resolves */
          })
      );

      const { rerender } = render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
          loadingPlaceholder="Loading data..."
        />
      );

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeDisabled();

      rerender(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
        />
      );
      expect(screen.getByText('Loading options...')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should fetch and display options from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
          placeholder="Select an item..."
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).not.toBeDisabled();
      });

      expect(mockFetch).toHaveBeenCalledWith('http://api.test/data');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Select an item...')).toBeInTheDocument();
    });

    it('should handle response with nested data property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockData }),
      });

      render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).not.toBeDisabled();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should map response data to combobox options correctly', async () => {
      const customMapper = vi.fn(mapResponseToOptions);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={customMapper}
        />
      );

      await waitFor(() => {
        expect(customMapper).toHaveBeenCalledWith(mockData);
      });
    });

    it('should use default placeholder when not loading', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Select an option...')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle various error scenarios and callbacks', async () => {
      // Network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const { rerender } = render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeDisabled();
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });

      // Error callback
      const onError = vi.fn();
      const error = new Error('API Error');
      mockFetch.mockRejectedValueOnce(error);
      rerender(
        <ApiDropdown
          apiEndpoint="http://api.test/data2"
          mapResponseToOptions={mapResponseToOptions}
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });

      // HTTP error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      rerender(
        <ApiDropdown
          apiEndpoint="http://api.test/data3"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Error: HTTP error! status: 404')
        ).toBeInTheDocument();
      });

      // Non-array response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: 'response' }),
      });
      rerender(
        <ApiDropdown
          apiEndpoint="http://api.test/data4"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Error: API response is not an array')
        ).toBeInTheDocument();
      });

      // Non-Error exception
      mockFetch.mockRejectedValueOnce('String error');
      rerender(
        <ApiDropdown
          apiEndpoint="http://api.test/data5"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Error: Failed to fetch options')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Re-fetching', () => {
    it('should re-fetch when apiEndpoint changes', async () => {
      const newData = [{ id: 4, name: 'New Option', value: 'new' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const { rerender } = render(
        <ApiDropdown
          apiEndpoint="http://api.test/data"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).not.toBeDisabled();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => newData,
      });

      rerender(
        <ApiDropdown
          apiEndpoint="http://api.test/new-data"
          mapResponseToOptions={mapResponseToOptions}
        />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenCalledWith('http://api.test/new-data');
      });
    });
  });
});
