import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Combobox, ComboboxOption } from '../Combobox';

describe('Combobox', () => {
  const mockOptions: ComboboxOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ];

  describe('Rendering', () => {
    it('should render with placeholders, selected values, and styling', () => {
      const { rerender, container } = render(
        <Combobox options={mockOptions} />
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select an option...')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(
        <Combobox options={mockOptions} placeholder="Choose option..." />
      );
      expect(screen.getByText('Choose option...')).toBeInTheDocument();

      rerender(<Combobox options={mockOptions} value="option1" />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      rerender(<Combobox options={mockOptions} className="custom-class" />);
      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });
  });

  describe('Disabled State', () => {
    it('should disable button when disabled prop is true', () => {
      render(<Combobox options={mockOptions} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should not open when disabled', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} disabled />);

      await user.click(screen.getByRole('combobox'));
      expect(
        screen.queryByPlaceholderText('Search...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Opening and Closing', () => {
    it('should open dropdown when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should show all options when opened', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should close dropdown after selecting an option', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Option 1'));

      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText('Search...')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter options by search query (case-insensitive, by label/value)', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Combobox options={mockOptions} searchPlaceholder="Type to search..." />
      );

      await user.click(screen.getByRole('combobox'));
      expect(
        screen.getByPlaceholderText('Type to search...')
      ).toBeInTheDocument();

      // Close and re-render with default placeholder
      await user.click(screen.getByRole('combobox'));
      rerender(<Combobox options={mockOptions} />);
      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Search...');

      await user.type(searchInput, 'apple');
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

      await user.clear(searchInput);
      await user.type(searchInput, 'Option 2');
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

      await user.clear(searchInput);
      await user.type(searchInput, 'option1');
      expect(screen.getByText('Option 1')).toBeInTheDocument();

      await user.clear(searchInput);
      await user.type(searchInput, 'APPLE');
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    it('should show empty message when no search results', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Combobox options={mockOptions} emptyMessage="Nothing found" />
      );

      await user.click(screen.getByRole('combobox'));
      await user.type(screen.getByPlaceholderText('Search...'), 'xyz');
      expect(screen.getByText('Nothing found')).toBeInTheDocument();

      await user.click(screen.getByRole('combobox')); // Close
      rerender(<Combobox options={mockOptions} />);
      await user.click(screen.getByRole('combobox'));
      await user.type(screen.getByPlaceholderText('Search...'), 'nonexistent');
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should call onValueChange when option is selected', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Combobox options={mockOptions} onValueChange={handleChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Option 1'));

      expect(handleChange).toHaveBeenCalledWith('option1');
    });

    it('should show checkmark on selected option', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} value="option1" />);

      await user.click(screen.getByRole('combobox'));

      // Get all instances and use the one in the dropdown (second one)
      const allOptions = screen.getAllByText('Option 1');
      const selectedItem = allOptions[1].closest('div');
      const checkmark = selectedItem?.querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });
    it('should deselect when clicking selected option', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Combobox
          options={mockOptions}
          value="option1"
          onValueChange={handleChange}
        />
      );

      await user.click(screen.getByRole('combobox'));
      // Get all instances and click the one in the dropdown (second one)
      const allOptions = screen.getAllByText('Option 1');
      await user.click(allOptions[1]);

      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('should clear search after selection', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText(
        'Search...'
      ) as HTMLInputElement;

      await user.type(searchInput, 'apple');
      await user.click(screen.getByText('Apple'));

      await user.click(screen.getByRole('combobox'));
      expect(searchInput.value).toBe('');
    });
  });

  describe('Max Display Items', () => {
    it('should limit and show truncation message appropriately', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Combobox options={mockOptions} maxDisplayItems={2} />
      );

      await user.click(screen.getByRole('combobox'));
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
      expect(screen.getByText(/Showing 2 of 5 results/)).toBeInTheDocument();

      await user.click(screen.getByRole('combobox')); // Close
      rerender(<Combobox options={mockOptions} maxDisplayItems={10} />);
      await user.click(screen.getByRole('combobox'));
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();

      await user.click(screen.getByRole('combobox')); // Close
      const manyOptions = Array.from({ length: 150 }, (_, i) => ({
        value: `opt${i}`,
        label: `Option ${i}`,
      }));
      rerender(<Combobox options={manyOptions} />);
      await user.click(screen.getByRole('combobox'));
      expect(
        screen.getByText(/Showing 100 of 150 results/)
      ).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom renderOption function', async () => {
      const user = userEvent.setup();
      const customRender = (option: ComboboxOption) => (
        <div>Custom: {option.label}</div>
      );

      render(<Combobox options={mockOptions} renderOption={customRender} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Custom: Option 1')).toBeInTheDocument();
    });

    it('should use default rendering when renderOption not provided', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Empty Options', () => {
    it('should handle empty options array', async () => {
      const user = userEvent.setup();
      render(<Combobox options={[]} />);

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });
  });

  describe('Additional Option Properties', () => {
    it('should support additional properties in options', async () => {
      const user = userEvent.setup();
      const optionsWithExtra = [
        { value: 'opt1', label: 'Option 1', category: 'A', priority: 1 },
        { value: 'opt2', label: 'Option 2', category: 'B', priority: 2 },
      ];

      const customRender = (option: ComboboxOption) => (
        <div>
          {option.label} - {option.category as string}
        </div>
      );

      render(
        <Combobox options={optionsWithExtra} renderOption={customRender} />
      );

      await user.click(screen.getByRole('combobox'));

      expect(screen.getByText('Option 1 - A')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes and update on state changes', async () => {
      const user = userEvent.setup();
      render(<Combobox options={mockOptions} />);
      const button = screen.getByRole('combobox');

      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
