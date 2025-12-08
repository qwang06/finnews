import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render an input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('Input Types', () => {
    it('should render different input types correctly', () => {
      const { rerender } = render(<Input data-testid="input" />);
      expect(screen.getByTestId('input').tagName).toBe('INPUT');

      rerender(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

      rerender(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

      rerender(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });
  });

  describe('Props', () => {
    it('should handle state and HTML attributes correctly', () => {
      const { rerender } = render(<Input disabled data-testid="input" />);
      let input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );

      rerender(<Input required data-testid="input" />);
      expect(screen.getByTestId('input')).toBeRequired();

      rerender(<Input readOnly data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('readonly');

      rerender(<Input name="username" id="email-input" data-testid="input" />);
      input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'username');
      expect(input).toHaveAttribute('id', 'email-input');

      rerender(
        <Input
          data-testid="input"
          maxLength={10}
          minLength={2}
          pattern="[A-Za-z]+"
          autoComplete="off"
        />
      );
      input = screen.getByTestId('input');
      expect(input).toHaveAttribute('maxlength', '10');
      expect(input).toHaveAttribute('minlength', '2');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('Interactions', () => {
    it('should handle user input and event handlers', async () => {
      const handleChange = vi.fn();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(
        <Input
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid="input"
        />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'Hello');
      expect(input.value).toBe('Hello');
      expect(handleChange).toHaveBeenCalled();
      expect(handleFocus).toHaveBeenCalledTimes(1);

      input.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'test');
      expect(input.value).toBe('');
    });
  });

  describe('Controlled Input', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="input"
          />
        );
      };

      render(<TestComponent />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, 'controlled');
      expect(input.value).toBe('controlled');
    });

    it('should display initial value', () => {
      render(
        <Input value="initial value" onChange={vi.fn()} data-testid="input" />
      );
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('initial value');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('should allow focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes and focus styles', () => {
      const { rerender } = render(
        <Input aria-label="Username" data-testid="input" />
      );
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2'
      );

      rerender(
        <Input
          aria-describedby="error-message"
          aria-invalid="true"
          data-testid="input"
        />
      );
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
