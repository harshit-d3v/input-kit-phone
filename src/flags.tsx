import type { CSSProperties, ReactNode } from 'react';
import type { Country } from './countries';
import { FLAG_DATA } from './flag-data';

export interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code (e.g. 'US', 'IN', 'GB') */
  code: string;
  /** Accessible title; when omitted, the SVG is decorative (`aria-hidden="true"`) */
  title?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
}

/**
 * Return the raw 3x2 inline SVG markup for an ISO2 country code, or `undefined`
 * if no flag asset exists for that code.
 */
export function getFlagSvg(code: string): string | undefined {
  const entry = FLAG_DATA[code.trim().toUpperCase()];
  if (!entry) {
    return undefined;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${entry.viewBox}">${entry.body}</svg>`;
}

/**
 * Crisp inline SVG country flag that renders identically on Windows, macOS,
 * Linux, and mobile browsers with zero network/CDN fetches.
 */
export function CountryFlag({
  code,
  title,
  className,
  width = 20,
  height = 14,
  style,
}: CountryFlagProps) {
  const normalized = code.trim().toUpperCase();
  const entry = FLAG_DATA[normalized];

  if (!entry) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: width,
          height,
          fontSize: '0.6875rem',
          fontWeight: 600,
          lineHeight: 1,
          borderRadius: 2,
          ...style,
        }}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
      >
        {normalized || '?'}
      </span>
    );
  }

  return (
    <svg
      viewBox={entry.viewBox}
      width={width}
      height={height}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 2,
        flexShrink: 0,
        ...style,
      }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: entry.body }}
    />
  );
}

/**
 * Drop-in `renderFlag` helper for `<PhoneInput renderFlag={renderCountryFlag} />`.
 */
export function renderCountryFlag(country: Country): ReactNode {
  return <CountryFlag code={country.code} />;
}
