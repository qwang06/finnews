import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Popover, PopoverTrigger, PopoverContent } from '../Popover';

describe('Popover', () => {
  describe('Rendering', () => {
    it('should render trigger and manage content visibility', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Open Popover')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      await user.click(screen.getByText('Open Popover'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should show and hide content on interactions', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Popover>
            <PopoverTrigger>Trigger</PopoverTrigger>
            <PopoverContent>Content</PopoverContent>
          </Popover>
          <button>Outside</button>
        </div>
      );

      await user.click(screen.getByText('Trigger'));
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(screen.getByText('Outside'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('PopoverContent Props', () => {
    it('should apply custom className and default styles', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent className="custom-popover">Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      const content = screen.getByText('Content');
      const popoverContent = content.closest('[role="dialog"]');
      expect(popoverContent).toHaveClass('custom-popover');

      await user.click(screen.getByText('Open')); // Close

      rerender(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      await user.click(screen.getByText('Open'));
      const defaultContent = screen
        .getByText('Content')
        .closest('[role="dialog"]');
      expect(defaultContent).toHaveClass('rounded-md', 'border', 'shadow-md');
    });

    it('should accept positioning props', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent align="start" sideOffset={10}>
            Content
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Trigger'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('should work in controlled mode', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <Popover open={false} onOpenChange={handleOpenChange}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Controlled Content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Controlled Content')).not.toBeInTheDocument();

      // Simulate opening by re-rendering with open=true
      rerender(
        <Popover open={true} onOpenChange={handleOpenChange}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Controlled Content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Controlled Content')).toBeInTheDocument();

      // Click trigger should call onOpenChange
      await user.click(screen.getByText('Trigger'));
      expect(handleOpenChange).toHaveBeenCalled();
    });
  });

  describe('Complex Content', () => {
    it('should render complex JSX content', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Title</h3>
              <p>Description</p>
              <button>Action</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to content element', async () => {
      const user = userEvent.setup();
      const ref = { current: null as HTMLDivElement | null };

      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent ref={ref}>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Trigger'));

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
