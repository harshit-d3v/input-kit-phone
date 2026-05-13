# Test Demo for @input-kit/phone

This folder contains demo and test files for the phone input package.

## Files

| File | Description |
|------|-------------|
| `index.html` | Visual demo with React CDN - shows all features |
| `serve.cjs` | Simple HTTP server for serving the demo |

## Run Tests

### Visual Test (HTML Demo) - RECOMMENDED

```bash
# Start the server
cd input-kit-phone
node test-demo/serve.cjs

# Then open http://localhost:3000 in your browser
```

Or simply open `test-demo/index.html` directly in your browser.

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Demo Features

### 1. Basic Phone Input (US)
- Default US country selection
- Format as you type: (415) 555-2671
- Country dropdown with search

### 2. International Format (Auto-detect)
- Type +1 for US, +44 for UK, +49 for Germany
- Auto-detects country from dial code
- Shows formatted international numbers

### 3. With Validation (Required)
- Required field validation
- Min length validation (7 digits)
- Max length validation per country

### 4. German Format
- German phone number format
- Variable length support
- Local formatting rules

### 5. Japanese Format
- Japanese phone number format
- Mobile number formatting
- Country-specific patterns

## Keyboard Navigation

- **Tab**: Navigate between input and country selector
- **Enter/Space**: Open/close country dropdown
- **Arrow Down/Up**: Navigate country list
- **Escape**: Close dropdown
- **Type to search**: Filter countries in dropdown

## What's Tested

### Country Selection
- Flag display
- Dial code display
- Country search/filter
- Keyboard navigation

### Phone Formatting
- National format (US: (415) 555-2671)
- International format (+1 415 555 2671)
- Auto-formatting as you type
- Country-specific patterns

### Validation
- Required fields
- Minimum length (7 digits)
- Maximum length per country
- Error messages

### Auto-detection
- Detects country from +prefix
- Updates formatting rules
- Maintains number value
