import * as React from 'react';
import { Button } from './Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './Command';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { cn } from '../../lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxDisplayItems?: number;
  disabled?: boolean;
  className?: string;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  maxDisplayItems = 100,
  disabled = false,
  className,
  renderOption,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) {
      return options;
    }

    const query = searchQuery.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Truncate filtered options to max display items
  const displayOptions = filteredOptions.slice(0, maxDisplayItems);
  const hasMore = filteredOptions.length > maxDisplayItems;

  const handleClick = (currentValue: string) => {
    const newValue = currentValue === value ? '' : currentValue;
    onValueChange?.(newValue);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CommandList>
            {displayOptions.length === 0 && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            <CommandGroup>
              {displayOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  selected={option.value === value}
                  onClick={() => handleClick(option.value)}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      {option.value === value && (
                        <svg
                          className="ml-2 h-4 w-4 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </CommandItem>
              ))}
              {hasMore && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  Showing {displayOptions.length} of {filteredOptions.length}{' '}
                  results. Refine your search to see more.
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
