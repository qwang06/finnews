import * as React from 'react';
import { Combobox, ComboboxOption, ComboboxProps } from './Combobox';

export interface ApiDropdownProps<T = unknown>
  extends Omit<ComboboxProps, 'options'> {
  apiEndpoint: string;
  mapResponseToOptions: (data: T[]) => ComboboxOption[];
  onError?: (error: Error) => void;
  loadingPlaceholder?: string;
}

export function ApiDropdown<T = unknown>({
  apiEndpoint,
  mapResponseToOptions,
  onError,
  loadingPlaceholder = 'Loading options...',
  placeholder = 'Select an option...',
  ...comboboxProps
}: ApiDropdownProps<T>) {
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        // Handle different response structures
        const data = json.data || json;

        if (!Array.isArray(data)) {
          throw new Error('API response is not an array');
        }

        const mappedOptions = mapResponseToOptions(data as T[]);
        setOptions(mappedOptions);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to fetch options');
        setError(error);
        onError?.(error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [apiEndpoint, mapResponseToOptions, onError]);

  if (loading) {
    return (
      <Combobox
        {...comboboxProps}
        options={[]}
        disabled
        placeholder={loadingPlaceholder}
      />
    );
  }

  if (error) {
    return (
      <Combobox
        {...comboboxProps}
        options={[]}
        disabled
        placeholder={`Error: ${error.message}`}
      />
    );
  }

  return (
    <Combobox {...comboboxProps} options={options} placeholder={placeholder} />
  );
}
