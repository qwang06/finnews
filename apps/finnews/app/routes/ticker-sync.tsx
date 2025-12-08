import * as React from 'react';
import { Button } from '../components/ui/button';

interface SyncStatus {
  is_running: boolean;
  started_at: string | null;
  completed_at: string | null;
  current_exchange: string | null;
  total_processed: number;
  total_success: number;
  total_errors: number;
  error_message: string | null;
  total_tickers_in_db: number | null;
}

interface SyncResult {
  status: string;
  message: string;
  exchange?: string;
  exchanges?: Record<string, ExchangeResult>;
  summary?: {
    total_processed: number;
    total_success: number;
    total_errors: number;
  };
  total_processed?: number;
  total_success?: number;
  total_errors?: number;
  started_at: string | null;
  completed_at: string | null;
}

interface ExchangeResult {
  total: number;
  success: number;
  errors: number;
}

export default function TickerSync() {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = React.useState<SyncResult | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:8725';

  // Fetch current sync status
  const fetchSyncStatus = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickers/sync/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setSyncStatus(result.data);
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
    }
  }, []);

  // Poll status while sync is running
  React.useEffect(() => {
    fetchSyncStatus();

    const interval = setInterval(() => {
      fetchSyncStatus();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [fetchSyncStatus]);

  // Sync all exchanges
  const handleSyncAll = async () => {
    setIsLoading(true);
    setError(null);
    setLastSyncResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickers/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setLastSyncResult(result);
      await fetchSyncStatus();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync specific exchange
  const handleSyncExchange = async (exchange: string) => {
    setIsLoading(true);
    setError(null);
    setLastSyncResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tickers/sync?exchange=${exchange}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setLastSyncResult(result);
      await fetchSyncStatus();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Ticker Synchronization</h1>

      {/* Sync Control Buttons */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Button
            onClick={handleSyncAll}
            disabled={isLoading || (syncStatus?.is_running ?? false)}
            size="lg"
          >
            {isLoading || (syncStatus?.is_running ?? false)
              ? 'Syncing...'
              : 'Sync All Exchanges'}
          </Button>

          <Button
            onClick={() => handleSyncExchange('NASDAQ')}
            disabled={isLoading || (syncStatus?.is_running ?? false)}
            variant="outline"
          >
            Sync NASDAQ
          </Button>

          <Button
            onClick={() => handleSyncExchange('NYSE')}
            disabled={isLoading || (syncStatus?.is_running ?? false)}
            variant="outline"
          >
            Sync NYSE
          </Button>

          <Button
            onClick={() => handleSyncExchange('AMEX')}
            disabled={isLoading || (syncStatus?.is_running ?? false)}
            variant="outline"
          >
            Sync AMEX
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Current Status Display */}
      {syncStatus && (
        <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    syncStatus.is_running
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {syncStatus.is_running ? 'Running' : 'Idle'}
                </span>
              </div>

              {syncStatus.is_running && syncStatus.current_exchange && (
                <div className="flex justify-between">
                  <span className="font-medium">Current Exchange:</span>
                  <span className="text-blue-600 font-medium">
                    {syncStatus.current_exchange}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-medium">Total Tickers in DB:</span>
                <span className="font-mono">
                  {syncStatus.total_tickers_in_db?.toLocaleString() ?? 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Processed:</span>
                <span className="font-mono">
                  {syncStatus.total_processed.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Success:</span>
                <span className="font-mono text-green-600">
                  {syncStatus.total_success.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Errors:</span>
                <span className="font-mono text-red-600">
                  {syncStatus.total_errors.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {syncStatus.error_message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm font-medium text-red-800">Error Message:</p>
              <p className="text-sm text-red-700">{syncStatus.error_message}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Started:</span>
              <span className="font-mono text-gray-900">
                {formatDateTime(syncStatus.started_at)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-mono text-gray-900">
                {formatDateTime(syncStatus.completed_at)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Sync Result */}
      {lastSyncResult && (
        <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Last Sync Result</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  lastSyncResult.status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {lastSyncResult.status.toUpperCase()}
              </span>
              <span className="text-gray-700">{lastSyncResult.message}</span>
            </div>

            {/* Summary Statistics */}
            {lastSyncResult.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {lastSyncResult.summary.total_processed.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {lastSyncResult.summary.total_success.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {lastSyncResult.summary.total_errors.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Errors</p>
                </div>
              </div>
            )}

            {/* Single Exchange Result */}
            {!lastSyncResult.summary &&
              lastSyncResult.total_processed !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {lastSyncResult.total_processed.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Processed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {lastSyncResult.total_success?.toLocaleString() ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {lastSyncResult.total_errors?.toLocaleString() ?? 0}
                    </p>
                    <p className="text-sm text-gray-600">Errors</p>
                  </div>
                </div>
              )}

            {/* Exchange Breakdown */}
            {lastSyncResult.exchanges && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Exchange Breakdown
                </h3>
                <div className="space-y-2">
                  {Object.entries(lastSyncResult.exchanges).map(
                    ([exchange, result]) => (
                      <div
                        key={exchange}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                      >
                        <span className="font-medium text-gray-900">
                          {exchange}
                        </span>
                        <div className="flex gap-6 text-sm">
                          <span className="text-gray-600">
                            Total:{' '}
                            <span className="font-mono">{result.total}</span>
                          </span>
                          <span className="text-green-600">
                            Success:{' '}
                            <span className="font-mono">{result.success}</span>
                          </span>
                          <span className="text-red-600">
                            Errors:{' '}
                            <span className="font-mono">{result.errors}</span>
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Timing Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-sm">
              <div>
                <p className="text-gray-600">Started At:</p>
                <p className="font-mono text-gray-900">
                  {formatDateTime(lastSyncResult.started_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Completed At:</p>
                <p className="font-mono text-gray-900">
                  {formatDateTime(lastSyncResult.completed_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="font-mono text-gray-900">
                  {formatDuration(
                    lastSyncResult.started_at,
                    lastSyncResult.completed_at
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About Ticker Sync</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>
            Synchronizes ticker symbols from the US-Stock-Symbols GitHub
            repository
          </li>
          <li>Supports NASDAQ, NYSE, and AMEX exchanges</li>
          <li>Auto-refreshes status every 2 seconds</li>
          <li>Only one sync operation can run at a time</li>
          <li>Displays detailed statistics and error information</li>
        </ul>
      </div>
    </div>
  );
}
