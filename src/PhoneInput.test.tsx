import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PhoneInput } from './PhoneInput';

// Every test mounts another PhoneInput. Without this they accumulate in the same
// document and `getByRole('button', { name: /country/i })` matches each
// previously mounted trigger. It only surfaces when test files share a process,
// which is exactly the configuration that keeps worker memory down.
afterEach(cleanup);

function getCountryButton() {
  return screen.getByRole('button', { name: /country/i });
}

describe('PhoneInput', () => {
  it('opens and closes the country dropdown', () => {
    render(<PhoneInput defaultCountry="US" />);

    fireEvent.click(getCountryButton());
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.click(getCountryButton());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('selects a country from the dropdown', () => {
    const onChange = vi.fn();
    render(<PhoneInput defaultCountry="US" onChange={onChange} searchable />);

    fireEvent.click(getCountryButton());
    fireEvent.change(screen.getByLabelText(/search countries/i), {
      target: { value: 'United Kingdom' },
    });
    fireEvent.click(screen.getByRole('option', { name: /united kingdom/i }));

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).toHaveBeenCalled();
  });

  it('closes the dropdown on escape from a country option', () => {
    render(<PhoneInput defaultCountry="US" searchable={false} />);

    fireEvent.click(getCountryButton());
    const option = screen.getAllByRole('option')[0];
    fireEvent.keyDown(option, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes the dropdown on outside click', () => {
    render(
      <div>
        <PhoneInput defaultCountry="US" />
        <button type="button">Outside</button>
      </div>
    );

    fireEvent.click(getCountryButton());
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('names the country button with the selected country, not just the action', () => {
    // A constant aria-label wins over the button's own content, so the flag and
    // dial code inside it never reach the accessibility tree.
    render(<PhoneInput defaultCountry="GB" />);

    const button = screen.getByRole('button', { name: /country/i });
    const name = button.getAttribute('aria-label') ?? '';

    expect(name).toMatch(/United Kingdom/i);
    expect(name).toContain('+44');
  });

  it('returns focus to the country button after selecting', () => {
    render(<PhoneInput defaultCountry="US" searchable />);

    const button = screen.getByRole('button', { name: /country/i });
    fireEvent.click(button);
    fireEvent.change(screen.getByLabelText(/search countries/i), {
      target: { value: 'United Kingdom' },
    });
    fireEvent.click(screen.getByRole('option', { name: /united kingdom/i }));

    // Without this the popup unmounts with focus inside it and the browser
    // drops focus to <body>, so the next Tab restarts at the top of the page.
    expect(document.activeElement).toBe(button);
  });

  it('returns focus to the country button on escape', () => {
    render(<PhoneInput defaultCountry="US" searchable />);

    const button = screen.getByRole('button', { name: /country/i });
    fireEvent.click(button);
    fireEvent.keyDown(screen.getByLabelText(/search countries/i), { key: 'Escape' });

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(button);
  });
});
