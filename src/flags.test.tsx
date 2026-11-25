import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CountryFlag, getFlagSvg, renderCountryFlag } from './flags';
import { getCountryByCode } from './countries';

describe('@input-kit/phone/flags', () => {
  it('returns raw SVG markup for valid country codes', () => {
    const svg = getFlagSvg('in');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 513 342"');
    expect(getFlagSvg('ZZ')).toBeUndefined();
  });

  it('renders decorative inline SVG by default and accessible img role when titled', () => {
    const { container, rerender } = render(<CountryFlag code="us" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();

    rerender(<CountryFlag code="US" title="United States" className="custom-flag" />);
    const titledSvg = container.querySelector('svg');
    expect(titledSvg?.getAttribute('role')).toBe('img');
    expect(titledSvg?.getAttribute('aria-label')).toBe('United States');
    expect(titledSvg?.getAttribute('aria-hidden')).toBeNull();
    expect(titledSvg?.getAttribute('class')).toBe('custom-flag');
  });

  it('falls back to ISO code span for unknown country codes', () => {
    const { container } = render(<CountryFlag code="zz" title="Unknown" />);
    const span = container.querySelector('span');
    expect(span?.textContent).toBe('ZZ');
    expect(span?.getAttribute('role')).toBe('img');
    expect(span?.getAttribute('aria-label')).toBe('Unknown');
  });

  it('renders a flag element via renderCountryFlag', () => {
    const gb = getCountryByCode('GB')!;
    const { container } = render(<>{renderCountryFlag(gb)}</>);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
