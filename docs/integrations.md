# Form integrations

`@input-kit/phone` is headless: wire `usePhoneInput` or `PhoneInput` into your form library with a controlled `value`, `onChange`, and validation fields (`isValid`, `error`, `onValidationChange`).

## Value contract

| Field | Meaning |
| --- | --- |
| `phone` | National digits stored by the hook (default) |
| `fullPhone` | National number plus dial code when `includeDialCode` is `true` |
| `onChange(phone, country)` | Same shape as `phone` / `includeDialCode` |
| E.164 for APIs | `parsePhoneValue(phone, country).e164` when `isValid` |

## Plain controlled input

```tsx
import { useState } from 'react';
import { usePhoneInput } from '@input-kit/phone';

function ControlledPhone() {
  const [value, setValue] = useState('');
  const { inputProps, countryButtonProps, isValid, error } = usePhoneInput({
    value,
    onChange: (phone) => setValue(phone),
    defaultCountry: 'US',
    required: true,
  });

  return (
    <div>
      <button type="button" {...countryButtonProps}>Country</button>
      <input {...inputProps} />
      {!isValid && error ? <span>{error}</span> : null}
    </div>
  );
}
```

## React Hook Form

```tsx
import { Controller, useForm } from 'react-hook-form';
import { PhoneInput } from '@input-kit/phone';

type FormValues = { phone: string };

function RhfPhoneField() {
  const { control, formState: { errors } } = useForm<FormValues>({
    defaultValues: { phone: '' },
  });

  return (
    <Controller
      name="phone"
      control={control}
      rules={{ required: 'Phone number is required' }}
      render={({ field }) => (
        <PhoneInput
          value={field.value}
          onChange={(phone) => field.onChange(phone)}
          onBlur={field.onBlur}
          defaultCountry="US"
          required
        />
      )}
    />
  );
}
```

Use `onValidationChange` when you want RHF errors driven by the library validator:

```tsx
const { setError, clearErrors } = useFormContext<FormValues>();

<PhoneInput
  onValidationChange={({ isValid, message }) => {
    if (isValid) clearErrors('phone');
    else if (message) setError('phone', { type: 'manual', message });
  }}
/>
```

## Formik

```tsx
import { useFormik } from 'formik';
import { PhoneInput } from '@input-kit/phone';

function FormikPhone() {
  const formik = useFormik({ initialValues: { phone: '' }, onSubmit: () => {} });

  return (
    <PhoneInput
      value={formik.values.phone}
      onChange={(phone) => formik.setFieldValue('phone', phone)}
      onBlur={() => formik.setFieldTouched('phone', true)}
      defaultCountry="GB"
    />
  );
}
```

## Zod

Validate on submit with `parsePhoneValue` or `validatePhoneNumber`:

```tsx
import { z } from 'zod';
import { parsePhoneValue, getCountryByCode } from '@input-kit/phone';

const us = getCountryByCode('US');

const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .superRefine((value, ctx) => {
    const parsed = parsePhoneValue(value, us);
    if (!parsed.isValid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid phone number' });
    }
  });
```

Map `ValidationReason` to i18n strings in UI layers (`required`, `too_short`, `too_long`, `invalid`).
