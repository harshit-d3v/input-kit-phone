import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhoneInput } from './usePhoneInput';
import { createPhoneTypeValidator, getPhoneNumberType, isMobilePhone } from './validation';

describe('@input-kit/phone/validation', () => {
  it('identifies mobile, landline, and toll-free numbers', () => {
    expect(getPhoneNumberType('+918123456789')).toBe('MOBILE');
    expect(getPhoneNumberType('+447400123456')).toBe('MOBILE');
    expect(getPhoneNumberType('+442079460958')).toBe('FIXED_LINE');
    expect(getPhoneNumberType('+9118001234567')).toBe('TOLL_FREE');
    expect(getPhoneNumberType('8123456789', 'IN')).toBe('MOBILE');
    expect(getPhoneNumberType('1234', 'US')).toBeUndefined();
  });

  it('evaluates isMobilePhone including US FIXED_LINE_OR_MOBILE handling', () => {
    expect(isMobilePhone('8123456789', 'IN')).toBe(true);
    expect(isMobilePhone('+447400123456')).toBe(true);
    expect(isMobilePhone('+442079460958')).toBe(false);
    expect(isMobilePhone('+9118001234567')).toBe(false);

    // Some +1 prefixes classify as FIXED_LINE_OR_MOBILE in Google metadata.
    expect(isMobilePhone('+12015550123', 'US')).toBe(true);
    expect(isMobilePhone('+12015550123', 'US', { allowFixedLineOrMobile: false })).toBe(
      getPhoneNumberType('+12015550123', 'US') === 'MOBILE'
    );
  });

  it('integrates createPhoneTypeValidator with custom messages into usePhoneInput', () => {
    const mobileValidator = createPhoneTypeValidator(['MOBILE', 'FIXED_LINE_OR_MOBILE'], {
      message: 'Please enter a mobile number',
    });

    const { result } = renderHook(() =>
      usePhoneInput({
        defaultCountry: 'GB',
        validator: mobileValidator,
      })
    );

    act(() => result.current.setPhone('+442079460958'));
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationReason).toBe('invalid');
    expect(result.current.error).toBe('Please enter a mobile number');

    act(() => result.current.setPhone('+447400123456'));
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
