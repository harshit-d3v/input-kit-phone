/**
 * Demo/Test file for @input-kit/phone
 * 
 * This file demonstrates how to use the phone input component
 * Run with: npx tsx test-demo/demo.tsx
 */

import React, { useState } from 'react';
import { PhoneInput, usePhoneInput, countries, getCountryByCode, formatPhone, validatePhone } from '../src/index';

// Demo 1: Basic Phone Input with Hook
function BasicExample() {
  const [phone, setPhone] = useState('');

  return (
    <div>
      <h3>Basic Phone Input Component</h3>
      <PhoneInput
        value={phone}
        onChange={(value) => setPhone(value)}
        defaultCountry="US"
        containerClassName="phone-demo-container"
        selectorClassName="phone-demo-selector"
        inputClassName="phone-demo-input"
      />
      <p style={{ marginTop: '10px' }}>
        Phone: {phone || '-'}
      </p>
    </div>
  );
}

// Demo 2: Different Default Countries
function CountryExample() {
  const countries_list = ['US', 'GB', 'DE', 'FR', 'JP'];
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [phone, setPhone] = useState('');

  const { inputProps, country, isValid } = usePhoneInput({
    value: phone,
    onChange: (value) => setPhone(value),
    defaultCountry: selectedCountry,
  });

  return (
    <div>
      <h3>Different Default Countries</h3>
      <div style={{ marginBottom: '10px' }}>
        {countries_list.map((code) => {
          const c = getCountryByCode(code);
          return (
            <button
              key={code}
              onClick={() => setSelectedCountry(code)}
              style={{
                padding: '8px 12px',
                margin: '0 5px 5px 0',
                border: selectedCountry === code ? '2px solid #3b82f6' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {c?.flag} {c?.name}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem' }}>{country?.flag}</span>
        <span>{country?.dialCode}</span>
        <input
          {...inputProps}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>
      <p>Phone: {phone} | Valid: {isValid ? 'Yes' : 'No'}</p>
    </div>
  );
}

// Demo 3: Phone Formatting Utility
function FormattingExample() {
  const [rawPhone, setRawPhone] = useState('5551234567');
  const country = getCountryByCode('US');
  const formatted = formatPhone(rawPhone, country);
  const isValid = validatePhone(rawPhone, country);

  return (
    <div>
      <h3>Phone Formatting Utility</h3>
      <input
        type="text"
        value={rawPhone}
        onChange={(e) => setRawPhone(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter digits only"
        style={{ padding: '10px', width: '200px', marginRight: '10px' }}
      />
      <div style={{ marginTop: '10px', fontFamily: 'monospace' }}>
        <p>Raw: {rawPhone}</p>
        <p>Formatted (US): {formatted}</p>
        <p>Valid: {isValid ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

// Demo 4: Country List
function CountryListExample() {
  const [search, setSearch] = useState('');
  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  return (
    <div>
      <h3>Country List ({countries.length} supported calling regions)</h3>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search countries..."
        style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
      />
      <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
        {filtered.slice(0, 20).map((c) => (
          <div
            key={c.code}
            style={{
              padding: '10px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
            <span style={{ flex: 1 }}>{c.name}</span>
            <span style={{ color: '#666' }}>{c.dialCode}</span>
          </div>
        ))}
        {filtered.length > 20 && (
          <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>
            ... and {filtered.length - 20} more
          </div>
        )}
      </div>
    </div>
  );
}

// Demo 5: Validation States
function ValidationExample() {
  const [phone, setPhone] = useState('');
  const { inputProps, country, isValid, fullPhone } = usePhoneInput({
    value: phone,
    onChange: (value) => setPhone(value),
    defaultCountry: 'US',
    includeDialCode: true,
  });

  return (
    <div>
      <h3>Validation & E.164 Format</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>{country?.flag} {country?.dialCode}</span>
        <input
          {...inputProps}
          style={{
            flex: 1,
            padding: '10px',
            border: `2px solid ${isValid ? '#10b981' : phone ? '#ef4444' : '#ccc'}`,
            borderRadius: '4px',
          }}
        />
      </div>
      <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '14px' }}>
        <p>Local: {phone || '-'}</p>
        <p>E.164: {fullPhone || '-'}</p>
        <p style={{ color: isValid ? '#10b981' : '#ef4444' }}>
          Status: {isValid ? 'Valid' : phone ? 'Invalid' : 'Empty'}
        </p>
      </div>
    </div>
  );
}

// Main Demo App
export function DemoApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>@input-kit/phone Demo</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Complete world country-code coverage with {countries.length} supported calling regions.</p>
      
      <BasicExample />
      <hr style={{ margin: '30px 0' }} />
      
      <CountryExample />
      <hr style={{ margin: '30px 0' }} />
      
      <FormattingExample />
      <hr style={{ margin: '30px 0' }} />
      
      <CountryListExample />
      <hr style={{ margin: '30px 0' }} />
      
      <ValidationExample />
    </div>
  );
}

// Export individual examples for testing
export { BasicExample, CountryExample, FormattingExample, CountryListExample, ValidationExample };

// Default export
export default DemoApp;
