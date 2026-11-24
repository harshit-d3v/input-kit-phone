import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhoneInput } from './usePhoneInput';
import { getCountryByCode } from './countries';

describe('usePhoneInput', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: '+14155552671' })
    );
    expect(result.current.value).toBe('+14155552671');
  });

  it('should initialize with empty string when no default', () => {
    const { result } = renderHook(() => usePhoneInput());
    expect(result.current.value).toBe('');
  });

  it('should initialize with default country', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultCountry: 'GB' })
    );
    expect(result.current.country?.code).toBe('GB');
  });

  it('should set value', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    act(() => {
      result.current.setValue('4155552671');
    });
    
    expect(result.current.value).toBe('4155552671');
  });

  it('should clear value', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: '4155552671' })
    );
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.value).toBe('');
  });

  it('should set country', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    act(() => {
      result.current.setCountry('GB');
    });
    
    expect(result.current.country?.code).toBe('GB');
  });

  it('should call onChange when value changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePhoneInput({ onChange })
    );
    
    act(() => {
      result.current.setValue('4155552671');
    });
    
    expect(onChange).toHaveBeenCalledWith(
      '4155552671',
      expect.objectContaining({ code: 'US', dialCode: '+1' })
    );
  });

  it('should call onCountryChange when country changes', () => {
    const onCountryChange = vi.fn();
    const { result } = renderHook(() =>
      usePhoneInput({ onCountryChange })
    );
    
    act(() => {
      result.current.setCountry('GB');
    });
    
    expect(onCountryChange).toHaveBeenCalled();
    expect(onCountryChange.mock.calls[0][0]?.code).toBe('GB');
  });

  it('should open and close dropdown', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    expect(result.current.isOpen).toBe(false);
    
    act(() => {
      result.current.open();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.close();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle dropdown', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should validate required field', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ required: true })
    );
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Phone number is required');
  });

  it('should validate phone number', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: '123', defaultCountry: 'US' })
    );
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Phone number is too short');
  });

  it('should provide formatted value', () => {
    const { result } = renderHook(() =>
      usePhoneInput({
        defaultValue: '4155552671',
        defaultCountry: 'US',
      })
    );
    
    expect(result.current.formattedValue).toBe('(415) 555-2671');
  });

  it('should provide input props', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    expect(result.current.inputProps).toBeDefined();
    expect(result.current.inputProps.type).toBe('tel');
    expect(result.current.inputProps.inputMode).toBe('tel');
    expect(result.current.inputProps.ref).toBeDefined();
  });

  it('should provide country selector props', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    expect(result.current.countrySelectorProps).toBeDefined();
    expect(result.current.countrySelectorProps['aria-expanded']).toBe(false);
    expect(result.current.countrySelectorProps['aria-haspopup']).toBe('listbox');
  });

  it('should provide dropdown props', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    expect(result.current.dropdownProps).toBeDefined();
    expect(result.current.dropdownProps.role).toBe('listbox');
  });

  it('should filter countries by search query', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    act(() => {
      result.current.setSearchQuery('United');
    });
    
    expect(result.current.countries.length).toBeGreaterThan(0);
    expect(result.current.countries.every(c => 
      c.name.toLowerCase().includes('united')
    )).toBe(true);
  });

  it('should respect allowedCountries', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ allowedCountries: ['US', 'GB', 'CA'] })
    );
    
    expect(result.current.countries.length).toBe(3);
    expect(result.current.countries.map(c => c.code).sort()).toEqual(['CA', 'GB', 'US']);
  });

  it('should respect excludedCountries', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ excludedCountries: ['US'] })
    );
    
    expect(result.current.countries.find(c => c.code === 'US')).toBeUndefined();
  });

  it('should auto-detect country from value', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: '+442079460958', autoDetectCountry: true })
    );
    
    // Should detect UK
    expect(result.current.country?.code).toBe('GB');
  });

  it('should use custom validator', () => {
    const validator = vi.fn(() => false);
    const { result } = renderHook(() =>
      usePhoneInput({
        defaultValue: '4155552671',
        validator,
      })
    );
    
    expect(validator).toHaveBeenCalled();
    expect(result.current.isValid).toBe(false);
  });

  it('should provide getCountryOptionProps', () => {
    const { result } = renderHook(() => usePhoneInput());
    
    const country = result.current.countries[0];
    const props = result.current.getCountryOptionProps(country, 0);
    
    expect(props.role).toBe('option');
    expect(props['aria-selected']).toBeDefined();
    expect(props.onClick).toBeDefined();
    expect(props.onKeyDown).toBeDefined();
  });

  it('should expose combobox props wired to the listbox', () => {
    const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));

    const search = result.current.countrySearchProps;
    expect(search.role).toBe('combobox');
    expect(search['aria-autocomplete']).toBe('list');
    expect(search['aria-controls']).toBe(result.current.dropdownProps.id);
    expect(result.current.countryButtonProps['aria-controls']).toBe(result.current.dropdownProps.id);
  });

  it('should move the active option and report it as activedescendant', () => {
    const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));

    expect(result.current.activeOptionId).toBeUndefined();
    expect(result.current.countrySearchProps['aria-activedescendant']).toBeUndefined();

    act(() => result.current.openDropdown());

    const first = result.current.activeCountry;
    act(() => result.current.moveHighlight(1));

    expect(result.current.highlightedIndex).toBe(1);
    expect(result.current.activeCountry).not.toBe(first);
    expect(result.current.activeOptionId).toBe(
      result.current.getCountryOptionId(result.current.activeCountry!.code)
    );
    expect(result.current.countrySearchProps['aria-activedescendant']).toBe(
      result.current.activeOptionId
    );
    const activeOptionProps = result.current.getCountryOptionProps(result.current.activeCountry!, 1);
    // aria-selected follows the active option, not the committed country.
    expect(activeOptionProps['aria-selected']).toBe(true);
    expect(activeOptionProps.tabIndex).toBe(0);
  });

  it('should handle combobox keyboard navigation via countrySearchProps.onKeyDown', () => {
    const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));

    act(() => result.current.openDropdown());
    const lastIndex = result.current.filteredCountries.length - 1;

    const arrowDownPreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'ArrowDown',
        preventDefault: arrowDownPreventDefault,
      })
    );
    expect(arrowDownPreventDefault).toHaveBeenCalled();
    expect(result.current.highlightedIndex).toBe(1);

    const arrowUpPreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'ArrowUp',
        preventDefault: arrowUpPreventDefault,
      })
    );
    expect(arrowUpPreventDefault).toHaveBeenCalled();
    expect(result.current.highlightedIndex).toBe(0);

    const endPreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'End',
        preventDefault: endPreventDefault,
      })
    );
    expect(endPreventDefault).toHaveBeenCalled();
    expect(result.current.highlightedIndex).toBe(lastIndex);

    const homePreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'Home',
        preventDefault: homePreventDefault,
      })
    );
    expect(homePreventDefault).toHaveBeenCalled();
    expect(result.current.highlightedIndex).toBe(0);

    act(() => result.current.setSearchQuery('zzzzz'));
    const emptyEnterPreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'Enter',
        preventDefault: emptyEnterPreventDefault,
      })
    );
    expect(emptyEnterPreventDefault).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
    expect(result.current.country?.code).toBe('US');

    act(() => result.current.setSearchQuery('United Kingdom'));
    const enterPreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'Enter',
        preventDefault: enterPreventDefault,
      })
    );
    expect(enterPreventDefault).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
    expect(result.current.country?.code).toBe('GB');

    act(() => result.current.openDropdown());
    const escapePreventDefault = vi.fn();
    act(() =>
      result.current.countrySearchProps.onKeyDown({
        key: 'Escape',
        preventDefault: escapePreventDefault,
      })
    );
    expect(escapePreventDefault).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('should clamp setHighlightedIndex, preserve highlight when already open, and isolate option IDs per instance', () => {
    const first = renderHook(() => usePhoneInput({ defaultCountry: 'GB' }));
    const second = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));

    expect(first.result.current.getCountryOptionId('US')).not.toBe(
      second.result.current.getCountryOptionId('US')
    );

    act(() => first.result.current.setHighlightedIndex(99999));
    expect(first.result.current.highlightedIndex).toBe(
      first.result.current.filteredCountries.length - 1
    );

    act(() => first.result.current.setHighlightedIndex(-5));
    expect(first.result.current.highlightedIndex).toBe(0);

    act(() => first.result.current.openDropdown());
    expect(first.result.current.activeCountry?.code).toBe('GB');
    expect(first.result.current.highlightedIndex).toBeGreaterThan(0);

    act(() => first.result.current.setHighlightedIndex(0));
    act(() => first.result.current.openDropdown());
    expect(first.result.current.highlightedIndex).toBe(0);
  });

  it('should clamp the active option to the filtered list', () => {
    const { result } = renderHook(() => usePhoneInput());

    act(() => result.current.moveHighlight(99999));
    expect(result.current.highlightedIndex).toBe(result.current.filteredCountries.length - 1);

    act(() => result.current.moveHighlight(-5));
    expect(result.current.highlightedIndex).toBe(0);
  });

  it('should describe the filtered result count', () => {
    const { result } = renderHook(() => usePhoneInput());

    act(() => result.current.setSearchQuery('United Kingdom'));
    expect(result.current.countryResultsText).toBe('1 countries');

    act(() => result.current.setSearchQuery('zzzzz'));
    expect(result.current.countryResultsText).toBe('No countries found');
  });

  it('should handle controlled value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePhoneInput({ value }),
      { initialProps: { value: '' } }
    );
    
    expect(result.current.value).toBe('');
    
    rerender({ value: '4155552671' });
    
    expect(result.current.value).toBe('4155552671');
  });

  it('should call onValidationChange when validation changes', () => {
    const onValidationChange = vi.fn();
    const { result } = renderHook(() =>
      usePhoneInput({ onValidationChange, required: true })
    );

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ isValid: false, reason: 'required' })
    );

    act(() => {
      result.current.setValue('4155552671');
    });

    expect(onValidationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ isValid: true, reason: null })
    );
  });

  it('should not override a manual country selection for a shared dial code', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: '+14155552671' })
    );

    // +1 auto-detects US initially
    expect(result.current.country?.code).toBe('US');

    act(() => {
      result.current.setCountry('CA');
    });

    // Manual choice of Canada must survive re-renders even though +1 detects US
    expect(result.current.country?.code).toBe('CA');
  });

  it('should still auto-detect when the dial code changes after manual selection', () => {
    const { result } = renderHook(() => usePhoneInput());

    act(() => {
      result.current.setCountry('CA');
    });

    act(() => {
      result.current.setPhone('+442079460958');
    });

    expect(result.current.country?.code).toBe('GB');
  });

  it('should notify onCountryChange when defaultCountry prop changes', () => {
    const onCountryChange = vi.fn();
    const { rerender } = renderHook(
      ({ defaultCountry }) => usePhoneInput({ defaultCountry, onCountryChange }),
      { initialProps: { defaultCountry: 'US' } }
    );

    rerender({ defaultCountry: 'GB' });

    expect(onCountryChange).toHaveBeenCalled();
    expect(onCountryChange.mock.calls.at(-1)?.[0]?.code).toBe('GB');
  });

  it('should reject input beyond the maximum possible length', () => {
    const { result } = renderHook(() =>
      usePhoneInput({ defaultValue: '4155552671', defaultCountry: 'US' })
    );

    const setSelectionRange = vi.fn();
    act(() => {
      result.current.inputProps.onChange?.({
        target: {
          value: '(415) 555-26718',
          selectionStart: 15,
          setSelectionRange,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    // Extra digit rejected, stored value unchanged
    expect(result.current.phone).toBe('4155552671');
  });

  it('should set aria-invalid when required and empty', () => {
    const { result } = renderHook(() => usePhoneInput({ required: true }));
    expect(result.current.inputProps['aria-invalid']).toBe(true);
  });

  it('should include dial code when includeDialCode is true', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePhoneInput({
        defaultValue: '4155552671',
        defaultCountry: 'US',
        includeDialCode: true,
        onChange,
      })
    );
    
    act(() => {
      result.current.setCountry('GB');
    });
    
    // Value should include dial code after country change
    expect(onChange).toHaveBeenCalled();
  });
  // --- regressions ---

  it('fires onValidationChange only when the result changes, not on every render', () => {
    const spy = vi.fn();
    // An inline arrow, which is how the docs lead people to write it. Depending
    // on handler identity re-fired this every render and looped the app.
    const { rerender } = renderHook(() =>
      usePhoneInput({ defaultCountry: 'US', onValidationChange: (v) => spy(v) })
    );

    const afterMount = spy.mock.calls.length;
    rerender();
    rerender();
    rerender();

    expect(spy.mock.calls.length).toBe(afterMount);
  });

  it('keeps what fits when input exceeds the country maximum, instead of blanking', () => {
    const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));

    act(() => {
      // 11 digits into an empty US field (max 10). This used to discard the
      // whole entry and leave the field empty with no onChange and no message.
      result.current.inputProps.onChange({
        target: { value: '21337342531', selectionStart: 11 },
      } as never);
    });

    expect(result.current.phone).not.toBe('');
  });

  it('keeps an explicitly chosen country on an international number', () => {
    const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'GB' }));

    act(() => {
      result.current.inputProps.onChange({
        target: { value: '+447400123456', selectionStart: 13 },
      } as never);
    });

    act(() => {
      result.current.selectCountry(getCountryByCode('DE')!);
    });

    // Auto-detect used to re-read the old +44 and throw the selection away.
    expect(result.current.country?.code).toBe('DE');
  });

  // --- format as you type ---
  // Live formatting is already built in (formatOnType, on by default) and runs
  // on every keystroke via libphonenumber's AsYouType. These lock that so it
  // cannot silently regress, since it is the headline feature people compare.
  describe('format as you type', () => {
    const type = (result: { current: { inputProps: { value: string; onChange: (e: never) => void } } }, value: string) => {
      act(() => {
        result.current.inputProps.onChange({
          target: { value, selectionStart: value.length, setSelectionRange() {} },
        } as never);
      });
      return result.current.inputProps.value;
    };

    it('formats a US number progressively as digits arrive', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));
      expect(type(result, '555')).toBe('(555)');
      expect(type(result, '5551234')).toBe('(555) 123-4');
      expect(type(result, '5551234567')).toBe('(555) 123-4567');
    });

    it('formats an international number progressively', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));
      expect(type(result, '+1555')).toBe('+1 555');
      expect(type(result, '+15551234567')).toBe('+1 555 123 4567');
    });

    it('uses the selected country format (GB and DE differ from US)', () => {
      const gb = renderHook(() => usePhoneInput({ defaultCountry: 'GB' }));
      expect(type(gb.result, '07400123456')).toBe('07400 123456');

      const de = renderHook(() => usePhoneInput({ defaultCountry: 'DE' }));
      expect(type(de.result, '15112345678')).toBe('15112345678');
    });

    it('reformats cleanly when a digit is removed', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));
      type(result, '5551234567');
      expect(type(result, '555123456')).toBe('(555) 123-456');
    });

    it('formats a full number pasted in one go', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));
      expect(type(result, '5551234567')).toBe('(555) 123-4567');
    });

    it('shows raw digits when formatOnType is off', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US', formatOnType: false }));
      expect(type(result, '5551234567')).toBe('5551234567');
    });

    it('leaves the parsed value untouched while the display is formatted', () => {
      const seen: string[] = [];
      const { result } = renderHook(() =>
        usePhoneInput({ defaultCountry: 'US', includeDialCode: true, onChange: (p) => seen.push(p) })
      );
      type(result, '5551234567');
      expect(result.current.inputProps.value).toBe('(555) 123-4567');
      expect(result.current.fullPhone).toBe('+15551234567');
      expect(seen.at(-1)).toBe('+15551234567');
    });
  });

  describe('e164 and pasted international trunk zeros', () => {
    it('exposes e164 only when the number is non-empty and valid', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));
      expect(result.current.e164).toBeUndefined();

      act(() => result.current.setPhone('555'));
      expect(result.current.e164).toBeUndefined();

      act(() => result.current.setPhone('4155552671'));
      expect(result.current.e164).toBe('+14155552671');
    });

    it('resolves national trunk zero into clean e164 for UK numbers', () => {
      const { result } = renderHook(() =>
        usePhoneInput({ defaultCountry: 'GB', defaultValue: '07400123456' })
      );
      expect(result.current.isValid).toBe(true);
      expect(result.current.e164).toBe('+447400123456');
    });

    it('strips pasted international trunk zeros like +44 (0) 7400 123456', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'US' }));

      act(() => {
        result.current.inputProps.onChange?.({
          target: {
            value: '+44 (0) 7400 123456',
            selectionStart: 19,
            setSelectionRange: vi.fn(),
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.country?.code).toBe('GB');
      expect(result.current.phone).toBe('+447400123456');
      expect(result.current.e164).toBe('+447400123456');
    });
  });

  describe('controlled country', () => {
    it('respects controlled country prop and updates via onCountryChange', () => {
      const onCountryChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ country }) =>
          usePhoneInput({
            country,
            onCountryChange: (next) => onCountryChange(next),
          }),
        { initialProps: { country: 'US' } }
      );

      expect(result.current.country?.code).toBe('US');

      act(() => {
        result.current.selectCountry(getCountryByCode('DE')!);
      });

      expect(onCountryChange).toHaveBeenCalledWith(expect.objectContaining({ code: 'DE' }));
      expect(result.current.country?.code).toBe('US');

      rerender({ country: 'DE' });
      expect(result.current.country?.code).toBe('DE');
    });

    it('does not loop when onCountryChange is an inline function in controlled mode', () => {
      const spy = vi.fn();
      const { rerender } = renderHook(
        ({ country, value }) =>
          usePhoneInput({
            country,
            value,
            onCountryChange: (next) => spy(next?.code),
          }),
        { initialProps: { country: 'US', value: '+447400123456' } }
      );

      const callsAfterMount = spy.mock.calls.length;
      rerender({ country: 'US', value: '+447400123456' });
      rerender({ country: 'US', value: '+447400123456' });
      expect(spy.mock.calls.length).toBe(callsAfterMount);
    });
  });

  describe('localized validation messages', () => {
    it('returns localized validation errors for bundled locales', () => {
      const fr = renderHook(() => usePhoneInput({ locale: 'fr', required: true }));
      expect(fr.result.current.isValid).toBe(false);
      expect(fr.result.current.error).toBe('Le numéro de téléphone est requis');

      const de = renderHook(() =>
        usePhoneInput({ locale: 'de', defaultCountry: 'DE', defaultValue: '123' })
      );
      expect(de.result.current.isValid).toBe(false);
      expect(de.result.current.error).toBe('Telefonnummer ist zu kurz');
    });

    it('allows overriding validation messages through labels', () => {
      const { result } = renderHook(() =>
        usePhoneInput({
          required: true,
          labels: { validationRequired: 'Custom required message' },
        })
      );
      expect(result.current.error).toBe('Custom required message');
    });
  });

  describe('prefix-aware input capping', () => {
    it('caps an India mobile number at 10 digits and keeps it formatted', () => {
      const { result } = renderHook(() => usePhoneInput({ defaultCountry: 'IN' }));

      act(() => {
        result.current.inputProps.onChange?.({
          target: {
            value: '8123456789999',
            selectionStart: 13,
            setSelectionRange: vi.fn(),
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.phone).toBe('8123456789');
      expect(result.current.formattedValue).toBe('81234 56789');
      expect(result.current.e164).toBe('+918123456789');
      expect(result.current.isValid).toBe(true);
    });
  });
});
