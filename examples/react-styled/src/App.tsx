import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  PhoneInput,
  getCountryByCode,
  parsePhoneValue,
  usePhoneInput,
  type Country,
  type ValidationResult,
} from '@input-kit/phone';

const QUICK_COUNTRIES = ['US', 'GB', 'IN', 'DE'] as const;
const LOCALES = ['en', 'fr', 'de', 'es', 'hi', 'ja'] as const;

export function App() {
  const [controlledCountry, setControlledCountry] = useState('US');
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>('en');
  const headlessContainerRef = useRef<HTMLDivElement | null>(null);
  const headlessButtonRef = useRef<HTMLButtonElement | null>(null);
  const shouldReturnFocusRef = useRef(false);
  const pendingKeyUpCleanupRef = useRef<(() => void) | null>(null);

  const {
    inputProps,
    countryButtonProps,
    countrySearchProps,
    dropdownProps,
    getCountryOptionProps,
    filteredCountries,
    highlightedIndex,
    activeCountry,
    countryResultsText,
    isOpen,
    isValid,
    error,
    phone,
    e164,
    country,
    closeDropdown,
    labels,
  } = usePhoneInput({
    country: controlledCountry,
    onCountryChange: (next) => {
      if (next) {
        setControlledCountry(next.code);
      }
    },
    locale,
    required: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (
        headlessContainerRef.current &&
        event.target instanceof Node &&
        !headlessContainerRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen, closeDropdown]);

  useEffect(() => () => {
    pendingKeyUpCleanupRef.current?.();
  }, []);

  useEffect(() => {
    if (!isOpen && shouldReturnFocusRef.current) {
      shouldReturnFocusRef.current = false;
      headlessButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleHeadlessSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    countrySearchProps.onKeyDown(event);
    if (event.key === 'Escape') {
      shouldReturnFocusRef.current = true;
    } else if (event.key === 'Enter' && activeCountry) {
      // Wait for keyup before focusing the trigger so trailing Enter keypress events do not re-open it.
      const key = event.key;
      pendingKeyUpCleanupRef.current?.();
      const handleKeyUp = (upEvent: globalThis.KeyboardEvent) => {
        if (upEvent.key !== key) return;
        window.removeEventListener('keyup', handleKeyUp);
        pendingKeyUpCleanupRef.current = null;
        headlessButtonRef.current?.focus();
      };
      window.addEventListener('keyup', handleKeyUp);
      pendingKeyUpCleanupRef.current = () => {
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  };

  // Reference PhoneInput section state
  const [refSearchable, setRefSearchable] = useState(true);
  const [refPhone, setRefPhone] = useState('');
  const [refCountry, setRefCountry] = useState<Country | undefined>(() => getCountryByCode('GB'));
  const [refValidation, setRefValidation] = useState<ValidationResult | null>(null);
  const refE164 = refValidation?.isValid && refPhone ? parsePhoneValue(refPhone, refCountry).e164 : undefined;

  return (
    <main className="page">
      <header className="page-header">
        <h1>@input-kit/phone</h1>
        <p>Headless ARIA combobox hook and unstyled reference component.</p>
      </header>

      <section className="card" aria-labelledby="headless-heading">
        <div className="card-header">
          <h2 id="headless-heading">Headless hook (<code>usePhoneInput</code>)</h2>
          <div className="controls-row">
            <div className="pill-group" role="group" aria-label="Controlled country">
              {QUICK_COUNTRIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`pill-btn ${controlledCountry === code ? 'active' : ''}`}
                  onClick={() => setControlledCountry(code)}
                >
                  {code}
                </button>
              ))}
            </div>

            <label className="locale-label">
              <span>Locale</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as (typeof LOCALES)[number])}
              >
                {LOCALES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="phone-field" ref={headlessContainerRef}>
          <button
            ref={headlessButtonRef}
            type="button"
            className="country-trigger"
            {...countryButtonProps}
          >
            <span className="flag-pill">{country?.code ?? '??'}</span>
            <span>{country?.dialCode ?? labels.selectCountry}</span>
          </button>

          <input
            className="phone-input"
            aria-label="Headless phone number"
            {...inputProps}
            aria-invalid={!isValid}
          />

          <div role="status" aria-live="polite" className="sr-only">
            {isOpen ? countryResultsText : ''}
          </div>

          {isOpen && (
            <div className="dropdown">
              <input
                className="search"
                {...countrySearchProps}
                onKeyDown={handleHeadlessSearchKeyDown}
                autoFocus
              />
              <ul className="country-list" {...dropdownProps}>
                {filteredCountries.map((candidate, index) => (
                  <li
                    key={candidate.code}
                    {...getCountryOptionProps(candidate, index)}
                    className={`country-option ${
                      candidate.code === country?.code ? 'selected' : ''
                    } ${index === highlightedIndex ? 'highlighted' : ''}`}
                  >
                    <span className="flag-pill">{candidate.code}</span>
                    <span className="country-name">{candidate.displayName ?? candidate.name}</span>
                    <span className="country-dial">{candidate.dialCode}</span>
                  </li>
                ))}
                {filteredCountries.length === 0 && (
                  <li className="no-results">{labels.noCountriesFound}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {!isValid && error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}

        <dl className="readout">
          <div>
            <dt>phone</dt>
            <dd data-testid="headless-phone">{phone || '—'}</dd>
          </div>
          <div>
            <dt>e164</dt>
            <dd data-testid="headless-e164">{e164 ?? '—'}</dd>
          </div>
          <div>
            <dt>country</dt>
            <dd data-testid="headless-country">{country?.code ?? '—'}</dd>
          </div>
          <div>
            <dt>status</dt>
            <dd data-testid="headless-valid">{isValid ? 'Valid' : 'Invalid'}</dd>
          </div>
        </dl>
      </section>

      <section className="card" aria-labelledby="component-heading">
        <div className="card-header">
          <h2 id="component-heading">Reference component (<code>&lt;PhoneInput /&gt;</code>)</h2>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={refSearchable}
              onChange={(event) => setRefSearchable(event.target.checked)}
            />
            <span>Searchable</span>
          </label>
        </div>

        <PhoneInput
          defaultCountry="GB"
          searchable={refSearchable}
          renderFlag={(c) => <span className="flag-pill">{c.code}</span>}
          containerClassName="ref-phone-field"
          selectorClassName="country-trigger"
          inputClassName="phone-input"
          aria-label="Reference phone number"
          onCountryChange={setRefCountry}
          onValidationChange={setRefValidation}
          onChange={(nextPhone, nextCountry) => {
            setRefPhone(nextPhone);
            setRefCountry(nextCountry);
          }}
        />

        {refValidation && !refValidation.isValid && refValidation.error ? (
          <p className="error" role="alert">
            {refValidation.error}
          </p>
        ) : null}

        <dl className="readout">
          <div>
            <dt>onChange phone</dt>
            <dd data-testid="ref-phone">{refPhone || '—'}</dd>
          </div>
          <div>
            <dt>e164</dt>
            <dd data-testid="ref-e164">{refE164 ?? '—'}</dd>
          </div>
          <div>
            <dt>onChange country</dt>
            <dd data-testid="ref-country">{refCountry?.code ?? 'GB'}</dd>
          </div>
          <div>
            <dt>status</dt>
            <dd data-testid="ref-valid">{refValidation?.isValid === false ? 'Invalid' : 'Valid'}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
