import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../Command';

describe('Command', () => {
  describe('Command Component', () => {
    it('should render with children, styling, and ref forwarding', () => {
      const ref = { current: null as HTMLDivElement | null };
      const { rerender } = render(
        <Command data-testid="command">Content</Command>
      );
      const command = screen.getByTestId('command');

      expect(command).toBeInTheDocument();
      expect(command).toHaveClass(
        'flex',
        'h-full',
        'w-full',
        'flex-col',
        'overflow-hidden'
      );

      rerender(
        <Command className="custom-command" data-testid="command">
          <div>Child Content</div>
        </Command>
      );
      expect(screen.getByTestId('command')).toHaveClass('custom-command');
      expect(screen.getByText('Child Content')).toBeInTheDocument();

      rerender(<Command ref={ref}>Content</Command>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CommandInput Component', () => {
    it('should render with placeholder, icon, styling, and handle input', async () => {
      const ref = { current: null as HTMLInputElement | null };
      const user = userEvent.setup();
      const { container, rerender } = render(
        <CommandInput placeholder="Search..." />
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();

      rerender(<CommandInput data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input).toHaveClass(
        'flex',
        'h-11',
        'w-full',
        'rounded-md',
        'bg-transparent'
      );

      await user.type(input, 'search query');
      expect(input.value).toBe('search query');

      rerender(<CommandInput className="custom-input" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-input');

      rerender(<CommandInput disabled data-testid="input" />);
      const disabledInput = screen.getByTestId('input');
      expect(disabledInput).toBeDisabled();
      expect(disabledInput).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );

      rerender(<CommandInput ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('CommandList Component', () => {
    it('should render with children, styling, and ref', () => {
      const ref = { current: null as HTMLDivElement | null };
      const { rerender } = render(
        <CommandList data-testid="list">Items</CommandList>
      );
      const list = screen.getByTestId('list');

      expect(list).toBeInTheDocument();
      expect(list).toHaveClass(
        'max-h-[300px]',
        'overflow-y-auto',
        'overflow-x-hidden'
      );

      rerender(
        <CommandList>
          <div>List Item</div>
        </CommandList>
      );
      expect(screen.getByText('List Item')).toBeInTheDocument();

      rerender(
        <CommandList className="custom-list" data-testid="list">
          Content
        </CommandList>
      );
      expect(screen.getByTestId('list')).toHaveClass('custom-list');

      rerender(<CommandList ref={ref}>Content</CommandList>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CommandEmpty Component', () => {
    it('should render with centered styling and ref', () => {
      const ref = { current: null as HTMLDivElement | null };
      const { rerender } = render(
        <CommandEmpty data-testid="empty">No results found</CommandEmpty>
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByTestId('empty')).toHaveClass(
        'py-6',
        'text-center',
        'text-sm'
      );

      rerender(<CommandEmpty ref={ref}>Empty</CommandEmpty>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CommandGroup Component', () => {
    it('should render with children, styling, and ref', () => {
      const ref = { current: null as HTMLDivElement | null };
      const { rerender } = render(
        <CommandGroup data-testid="group">Items</CommandGroup>
      );
      const group = screen.getByTestId('group');

      expect(group).toBeInTheDocument();
      expect(group).toHaveClass('overflow-hidden', 'p-1', 'text-foreground');

      rerender(
        <CommandGroup>
          <div>Group Item</div>
        </CommandGroup>
      );
      expect(screen.getByText('Group Item')).toBeInTheDocument();

      rerender(
        <CommandGroup className="custom-group" data-testid="group">
          Content
        </CommandGroup>
      );
      expect(screen.getByTestId('group')).toHaveClass('custom-group');

      rerender(<CommandGroup ref={ref}>Content</CommandGroup>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CommandItem Component', () => {
    it('should render with children, styling, selected state, and interactions', async () => {
      const ref = { current: null as HTMLDivElement | null };
      const user = userEvent.setup();
      const { rerender } = render(
        <CommandItem data-testid="item">Menu Item</CommandItem>
      );
      const item = screen.getByTestId('item');

      expect(item).toBeInTheDocument();
      expect(screen.getByText('Menu Item')).toBeInTheDocument();
      expect(item).toHaveClass('cursor-pointer', 'select-none');

      rerender(
        <CommandItem selected data-testid="item">
          Selected
        </CommandItem>
      );
      expect(screen.getByTestId('item')).toHaveClass('bg-accent');

      rerender(
        <CommandItem selected={false} data-testid="item">
          Not Selected
        </CommandItem>
      );
      expect(screen.getByTestId('item')).not.toHaveClass('bg-accent');

      rerender(
        <CommandItem className="custom-item" data-testid="item">
          Item
        </CommandItem>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom-item');

      rerender(<CommandItem ref={ref}>Item</CommandItem>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);

      rerender(<CommandItem data-testid="item">Clickable</CommandItem>);
      await user.click(screen.getByTestId('item'));
      expect(screen.getByTestId('item')).toBeInTheDocument();
    });
  });

  describe('CommandSeparator Component', () => {
    it('should render with styling and ref', () => {
      const ref = { current: null as HTMLDivElement | null };
      const { rerender } = render(<CommandSeparator data-testid="separator" />);
      const separator = screen.getByTestId('separator');

      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('-mx-1', 'h-px', 'bg-border');

      rerender(
        <CommandSeparator
          className="custom-separator"
          data-testid="separator"
        />
      );
      expect(screen.getByTestId('separator')).toHaveClass('custom-separator');

      rerender(<CommandSeparator ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Integration', () => {
    it('should render complete command structure', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results</CommandEmpty>
            <CommandGroup>
              <CommandItem>Item 1</CommandItem>
              <CommandItem>Item 2</CommandItem>
              <CommandSeparator />
              <CommandItem>Item 3</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });
});
