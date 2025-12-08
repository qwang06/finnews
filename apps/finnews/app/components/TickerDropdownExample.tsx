import * as React from 'react';
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

export default function TickerDropdownExample() {
  const [selectedTicker, setSelectedTicker] = React.useState('');

  // Map API response to combobox options
  const mapTickersToOptions = React.useCallback(
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
  const renderTickerOption = (option: ComboboxOption) => {
    const symbol = option.symbol as string;
    const name = option.name as string;
    const exchange = option.exchange as string | undefined;

    return (
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between">
          <span className="font-medium">{symbol}</span>
          {exchange && (
            <span className="text-xs text-muted-foreground">{exchange}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">{name}</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">NASDAQ Tickers</h2>
        <ApiDropdown
          apiEndpoint="http://localhost:8725/api/tickers/nasdaq"
          mapResponseToOptions={mapTickersToOptions}
          value={selectedTicker}
          onValueChange={setSelectedTicker}
          placeholder="Select a ticker..."
          searchPlaceholder="Search by symbol or name..."
          emptyMessage="No tickers found."
          maxDisplayItems={100}
          renderOption={renderTickerOption}
          onError={(error) => console.error('Failed to load tickers:', error)}
        />
      </div>

      {selectedTicker && (
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Selected ticker:</p>
          <p className="text-lg font-semibold">{selectedTicker}</p>
        </div>
      )}

      <div className="space-y-2 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground">Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Search by symbol or company name</li>
          <li>Auto-truncates at 100 items (configurable)</li>
          <li>Fetches from API endpoint automatically</li>
          <li>Shows loading and error states</li>
          <li>Custom option rendering</li>
          <li>Fully keyboard accessible</li>
        </ul>
      </div>

      <div className="space-y-2 text-sm">
        <h3 className="font-semibold">Other Examples:</h3>
        <div className="space-y-2">
          <ApiDropdown
            apiEndpoint="http://localhost:8725/api/tickers/nyse"
            mapResponseToOptions={mapTickersToOptions}
            placeholder="Select NYSE ticker..."
            maxDisplayItems={50}
          />

          <ApiDropdown
            apiEndpoint="http://localhost:8725/api/tickers/amex"
            mapResponseToOptions={mapTickersToOptions}
            placeholder="Select AMEX ticker..."
            maxDisplayItems={50}
          />
        </div>
      </div>
    </div>
  );
}
