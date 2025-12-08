import { useCallback } from 'react';
import { ApiDropdown } from './ui/ApiDropdown';
import { ComboboxOption } from './ui/Combobox';

// Example ticker data structure from API
interface TickerData {
  symbol: string;
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
}

interface TickerDropdownProps {
  exchange?: 'nasdaq' | 'nyse' | 'amex' | 'all';
  selectedTicker: string;
  onTickerClick: (ticker: string) => void;
}

export default function TickerDropdown({
  exchange = 'all',
  selectedTicker,
  onTickerClick,
}: TickerDropdownProps) {
  const apiEndpoint =
    exchange && exchange !== 'all'
      ? `http://localhost:8725/api/tickers/${exchange}`
      : 'http://localhost:8725/api/tickers';

  // Map API response to combobox options
  const mapTickersToOptions = useCallback(
    (tickers: TickerData[]): ComboboxOption[] => {
      return tickers.map((ticker) => ({
        value: ticker.symbol,
        label: `${ticker.symbol} - ${ticker.name}`,
        // Store additional data for custom rendering
        symbol: ticker.symbol,
        name: ticker.name,
        exchange: ticker.exchange,
        sector: ticker.sector,
      }));
    },
    []
  );

  // Custom option renderer to show additional info
  const renderTickerOption = useCallback(
    (option: ComboboxOption) => {
      const symbol = option.symbol as string;
      const name = option.name as string;
      const exchange = option.exchange as string | undefined;

      return (
        <div
          className="flex w-full flex-col"
          onClick={() => onTickerClick(symbol)}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{symbol}</span>
            {exchange && (
              <span className="text-xs text-muted-foreground">{exchange}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">{name}</span>
        </div>
      );
    },
    [onTickerClick]
  );

  return (
    <div className="w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold mb-2">
          {exchange?.toUpperCase() || 'All Exchanges'}
        </h2>
        <ApiDropdown
          apiEndpoint={apiEndpoint}
          mapResponseToOptions={mapTickersToOptions}
          value={selectedTicker}
          onValueChange={onTickerClick}
          placeholder="Select a ticker..."
          searchPlaceholder="Search by symbol or name..."
          emptyMessage="No tickers found."
          maxDisplayItems={100}
          renderOption={renderTickerOption}
          onError={(error) => console.error('Failed to load tickers:', error)}
        />
      </div>
    </div>
  );
}
