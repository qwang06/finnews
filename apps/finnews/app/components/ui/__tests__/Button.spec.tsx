import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render a button element', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should render all variants correctly', () => {
      const { rerender } = render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'bg-primary',
        'text-primary-foreground'
      );

      rerender(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'bg-destructive',
        'text-destructive-foreground'
      );

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'border',
        'border-input',
        'bg-background'
      );

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'bg-secondary',
        'text-secondary-foreground'
      );

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

      rerender(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'text-primary',
        'underline-offset-4'
      );
    });
  });

  describe('Sizes', () => {
    it('should render all sizes correctly', () => {
      const { rerender } = render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10', 'px-4', 'py-2');

      rerender(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9', 'px-3');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11', 'px-8');

      rerender(
        <Button size="icon" aria-label="Search">
          <span role="img" aria-label="Search icon">
            🔍
          </span>
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Props', () => {
    it('should handle disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass(
        'disabled:pointer-events-none',
        'disabled:opacity-50'
      );
    });

    it('should handle type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should pass through HTML button attributes', () => {
      render(
        <Button
          data-testid="test-button"
          aria-label="Test label"
          title="Test title"
        >
          Button
        </Button>
      );
      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('aria-label', 'Test label');
      expect(button).toHaveAttribute('title', 'Test title');
    });
  });

  describe('Interactions', () => {
    it('should handle click events correctly', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <Button onClick={handleClick}>Click me</Button>
      );
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(3);

      handleClick.mockClear();
      rerender(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );
      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild prop', () => {
    it('should render as a child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply button classes to child component', () => {
      render(
        <Button asChild variant="outline">
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('border', 'border-input');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with keyboard and ARIA support', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <Button onClick={handleClick}>Press me</Button>
      );
      const button = screen.getByRole('button');

      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2'
      );

      button.focus();
      expect(button).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();

      rerender(<Button aria-label="Close dialog">×</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Ref forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<Button ref={ref}>Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });
});
