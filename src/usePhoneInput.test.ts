import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhoneInput } from './usePhoneInput';

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

    // Extra digit rejected — stored value unchanged
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
});
