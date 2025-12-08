import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from '../Label';

describe('Label', () => {
  describe('Rendering', () => {
    it('should render with content and styling', () => {
      const { rerender } = render(<Label>Test Label</Label>);
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');

      rerender(<Label className="custom-label">Custom</Label>);
      expect(screen.getByText('Custom')).toHaveClass('custom-label');
    });
  });

  describe('Props and Accessibility', () => {
    it('should associate with inputs via htmlFor and work with screen readers', () => {
      const { rerender } = render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input id="username" />
        </div>
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'username');
      expect(input).toHaveAttribute('id', 'username');

      rerender(
        <div>
          <Label htmlFor="password">Password</Label>
          <input id="password" type="password" />
        </div>
      );
      expect(screen.getByLabelText('Password')).toBeInTheDocument();

      rerender(
        <Label data-testid="test-label" aria-label="Field label">
          Label
        </Label>
      );
      expect(screen.getByTestId('test-label')).toBeInTheDocument();
      expect(screen.getByLabelText('Field label')).toBeInTheDocument();
    });
  });
});
