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

describe('PhoneInput country combobox', () => {
  function openCombobox() {
    render(<PhoneInput defaultCountry="US" searchable />);
    fireEvent.click(getCountryButton());
    return screen.getByRole('combobox');
  }

  it('wires the search field as a combobox pointing at the listbox', () => {
    const search = openCombobox();
    const listbox = screen.getByRole('listbox');

    expect(search.getAttribute('aria-expanded')).toBe('true');
    expect(search.getAttribute('aria-autocomplete')).toBe('list');
    expect(search.getAttribute('aria-controls')).toBe(listbox.id);
    expect(listbox.id).toBeTruthy();
    // The listbox needs its own name, the search field's label does not carry over.
    expect(listbox.getAttribute('aria-label')).toBeTruthy();
  });

  it('points aria-activedescendant at the selected country when it opens', () => {
    render(<PhoneInput defaultCountry="GB" searchable />);
    fireEvent.click(getCountryButton());
    const search = screen.getByRole('combobox');
    const active = document.getElementById(search.getAttribute('aria-activedescendant') ?? '');

    expect(active?.textContent).toMatch(/United Kingdom/i);
    expect(active?.getAttribute('aria-selected')).toBe('true');
  });

  it('moves aria-activedescendant with the arrow keys and keeps focus in the field', () => {
    const search = openCombobox();
    search.focus();
    const first = search.getAttribute('aria-activedescendant');

    fireEvent.keyDown(search, { key: 'ArrowDown' });
    const second = search.getAttribute('aria-activedescendant');

    expect(second).not.toBe(first);
    expect(document.getElementById(second ?? '')).toBeTruthy();
    // Focus must stay put, that is the whole point of activedescendant.
    expect(document.activeElement).toBe(search);

    fireEvent.keyDown(search, { key: 'ArrowUp' });
    expect(search.getAttribute('aria-activedescendant')).toBe(first);
  });

  it('marks only the active option as selected', () => {
    const search = openCombobox();
    fireEvent.keyDown(search, { key: 'ArrowDown' });

    const selected = screen.getAllByRole('option').filter(
      (option) => option.getAttribute('aria-selected') === 'true'
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe(search.getAttribute('aria-activedescendant'));
  });

  it('jumps to the first and last option with Home and End', () => {
    const search = openCombobox();
    const options = screen.getAllByRole('option');

    fireEvent.keyDown(search, { key: 'End' });
    expect(search.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].id);

    fireEvent.keyDown(search, { key: 'Home' });
    expect(search.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('selects the active option on Enter', () => {
    const onCountryChange = vi.fn();
    render(<PhoneInput defaultCountry="US" searchable onCountryChange={onCountryChange} />);
    fireEvent.click(getCountryButton());

    const search = screen.getByRole('combobox');
    fireEvent.change(search, { target: { value: 'United Kingdom' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    fireEvent.keyUp(window, { key: 'Enter' });

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onCountryChange).toHaveBeenCalled();
    expect(getCountryButton().getAttribute('aria-label')).toMatch(/United Kingdom/i);
    expect(document.activeElement).toBe(getCountryButton());
  });

  it('announces the filtered count and the empty state', () => {
    const search = openCombobox();

    fireEvent.change(search, { target: { value: 'United Kingdom' } });
    expect(screen.getByRole('status').textContent).toBe('1 countries');

    fireEvent.change(search, { target: { value: 'zzzzz' } });
    expect(screen.getByRole('status').textContent).toBe('No countries found');
  });

  it('resets the active option to the first match when the query changes', () => {
    const search = openCombobox();
    fireEvent.keyDown(search, { key: 'End' });

    fireEvent.change(search, { target: { value: 'ind' } });

    const options = screen.getAllByRole('option');
    expect(search.getAttribute('aria-activedescendant')).toBe(options[0].id);
  });

  it('keeps the options out of the tab order while the combobox has focus', () => {
    openCombobox();

    for (const option of screen.getAllByRole('option')) {
      expect(option.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('keeps roving focus on the options when there is no search field', () => {
    render(<PhoneInput defaultCountry="US" searchable={false} />);
    fireEvent.click(getCountryButton());

    expect(screen.queryByRole('combobox')).toBeNull();

    const options = screen.getAllByRole('option');
    const active = options.find((option) => option.getAttribute('tabindex') === '0');
    expect(active).toBeTruthy();

    fireEvent.keyDown(active!, { key: 'ArrowDown' });
    expect(document.activeElement?.getAttribute('role')).toBe('option');
  });

  it('does not submit a parent form when pressing Enter with zero search matches', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PhoneInput defaultCountry="US" searchable />
      </form>
    );

    fireEvent.click(getCountryButton());
    const search = screen.getByRole('combobox');
    fireEvent.change(search, { target: { value: 'zzzzz' } });
    fireEvent.keyDown(search, { key: 'Enter' });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('uses distinct listbox and option IDs across multiple PhoneInput instances', () => {
    render(
      <div>
        <PhoneInput defaultCountry="US" searchable />
        <PhoneInput defaultCountry="US" searchable />
      </div>
    );

    const buttons = screen.getAllByRole('button', { name: /country/i });
    fireEvent.click(buttons[0]);
    const search0 = screen.getByRole('combobox');
    const controls0 = search0.getAttribute('aria-controls');
    const active0 = search0.getAttribute('aria-activedescendant');
    expect(document.getElementById(active0 ?? '')?.textContent).toMatch(/United States/i);

    fireEvent.click(buttons[1]);
    const search1 = screen.getByRole('combobox');
    const controls1 = search1.getAttribute('aria-controls');
    const active1 = search1.getAttribute('aria-activedescendant');
    expect(document.getElementById(active1 ?? '')?.textContent).toMatch(/United States/i);

    expect(controls0).toBeTruthy();
    expect(controls1).toBeTruthy();
    expect(controls0).not.toBe(controls1);
    expect(active0).toBeTruthy();
    expect(active1).toBeTruthy();
    expect(active0).not.toBe(active1);
  });

  it('mounts the status live region before opening when searchable, and omits it otherwise', () => {
    const { rerender } = render(<PhoneInput defaultCountry="US" searchable />);

    const status = screen.getByRole('status');
    expect(status.textContent).toBe('');

    fireEvent.click(getCountryButton());
    expect(screen.getByRole('status').textContent).toMatch(/countries$/);

    rerender(<PhoneInput defaultCountry="US" searchable={false} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('focuses the selected option on open and supports typeahead when searchable is false', () => {
    render(<PhoneInput defaultCountry="GB" searchable={false} />);
    fireEvent.click(getCountryButton());

    expect(document.activeElement?.getAttribute('role')).toBe('option');
    expect(document.activeElement?.textContent).toMatch(/United Kingdom/i);

    const active = document.activeElement!;
    fireEvent.keyDown(active, { key: 'f' });
    expect(document.activeElement?.getAttribute('role')).toBe('option');
    expect(document.activeElement?.textContent).toMatch(/^[^A-Za-z]*F/);
  });

  it('supports custom renderFlag in the country button and dropdown options', () => {
    render(
      <PhoneInput
        defaultCountry="US"
        searchable
        renderFlag={(c) => <span data-testid={`flag-${c.code}`}>{c.code}</span>}
      />
    );

    expect(screen.getByTestId('flag-US').textContent).toBe('US');

    fireEvent.click(getCountryButton());
    expect(screen.getAllByTestId('flag-US').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId('flag-GB').textContent).toBe('GB');
  });

  it('submits clean E.164 values in native forms by default and supports formValue modes', () => {
    const { container, rerender } = render(
      <form>
        <PhoneInput name="phone" defaultCountry="US" defaultValue="4155552671" />
      </form>
    );

    const form = container.querySelector('form') as HTMLFormElement;
    const textInput = screen.getByDisplayValue('(415) 555-2671');
    expect(textInput.getAttribute('name')).toBeNull();
    expect(new FormData(form).get('phone')).toBe('+14155552671');

    rerender(
      <form>
        <PhoneInput name="phone" defaultCountry="US" value="415" formValue="full" />
      </form>
    );
    expect(new FormData(form).get('phone')).toBe('+1415');

    rerender(
      <form>
        <PhoneInput name="phone" defaultCountry="US" value="4155552671" formValue="national" />
      </form>
    );
    expect(new FormData(form).get('phone')).toBe('(415) 555-2671');

    rerender(
      <form>
        <PhoneInput name="phone" defaultCountry="US" value="4155552671" disabled />
      </form>
    );
    expect(new FormData(form).get('phone')).toBeNull();
  });
});
