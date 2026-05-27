import { usePhoneInput } from '@input-kit/phone';

export function App() {
  const {
    inputProps,
    countryButtonProps,
    filteredCountries,
    isOpen,
    isValid,
    error,
    country,
    selectCountry,
    setSearchQuery,
    searchQuery,
    labels,
  } = usePhoneInput({
    defaultCountry: 'US',
    required: true,
  });

  return (
    <main className="page">
      <h1>Styled phone input</h1>
      <p>Hook-only UI with minimal CSS — same pattern as a custom product form.</p>

      <div className="phone-field">
        <button type="button" className="country-trigger" {...countryButtonProps}>
          <span>{country?.flag ?? '🌐'}</span>
          <span>{country?.dialCode ?? labels.selectCountry}</span>
        </button>

        <input className="phone-input" {...inputProps} aria-invalid={!isValid} />

        {isOpen && (
          <div className="dropdown" role="presentation">
            <input
              className="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={labels.countrySearchPlaceholder}
              aria-label={labels.searchCountriesAriaLabel}
            />
            <ul className="country-list" role="listbox" aria-label={labels.countryOptionsAriaLabel}>
              {filteredCountries.map((candidate) => (
                <li key={candidate.code}>
                  <button type="button" onClick={() => selectCountry(candidate)}>
                    {candidate.flag} {candidate.displayName ?? candidate.name} {candidate.dialCode}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {!isValid && error ? <p className="error">{error}</p> : null}
    </main>
  );
}
