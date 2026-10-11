import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe('Monthwise dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the main dashboard', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /make it to month-end/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/spending breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/your financial pulse/i)).toBeInTheDocument();
  });

  it('opens the Activity section', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /activity/i }));

    expect(
      screen.getByRole('heading', {
        name: /every rupee, accounted for/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: /search transactions/i })
    ).toBeInTheDocument();
  });

  it('opens the decision simulator without recording an expense', () => {
    render(<App />);

    const initialBalance = screen.getByText('₹7,542');

    fireEvent.click(
      screen.getByRole('button', { name: /can i afford something/i })
    );

    expect(
      screen.getByRole('dialog', { name: /before you buy/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /not now/i }));

    expect(
      screen.queryByRole('dialog', { name: /before you buy/i })
    ).not.toBeInTheDocument();

    expect(initialBalance).toBeInTheDocument();
  });
});