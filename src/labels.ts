import type { PhoneInputLabels } from './types';

export const DEFAULT_PHONE_INPUT_LABELS: PhoneInputLabels = {
  selectCountry: 'Select country',
  countrySearchPlaceholder: 'Search countries...',
  noCountriesFound: 'No countries found',
  searchCountriesAriaLabel: 'Search countries',
  countryOptionsAriaLabel: 'Country options',
  countryButtonAriaLabel: 'Open country selector',
  countryResultsAnnouncement: '{count} countries',
  validationRequired: 'Phone number is required',
  validationTooShort: 'Phone number is too short',
  validationTooLong: 'Phone number is too long',
  validationInvalid: 'Invalid phone number',
};

const LABELS_BY_LANGUAGE: Record<string, Partial<PhoneInputLabels>> = {
  en: DEFAULT_PHONE_INPUT_LABELS,
  fr: {
    selectCountry: 'Choisir un pays',
    countrySearchPlaceholder: 'Rechercher un pays...',
    noCountriesFound: 'Aucun pays trouvé',
    searchCountriesAriaLabel: 'Rechercher des pays',
    countryOptionsAriaLabel: 'Options de pays',
    countryButtonAriaLabel: 'Ouvrir le sélecteur de pays',
    countryResultsAnnouncement: '{count} pays',
    validationRequired: 'Le numéro de téléphone est requis',
    validationTooShort: 'Le numéro de téléphone est trop court',
    validationTooLong: 'Le numéro de téléphone est trop long',
    validationInvalid: 'Numéro de téléphone invalide',
  },
  de: {
    selectCountry: 'Land auswählen',
    countrySearchPlaceholder: 'Land suchen...',
    noCountriesFound: 'Keine Länder gefunden',
    searchCountriesAriaLabel: 'Länder suchen',
    countryOptionsAriaLabel: 'Länderoptionen',
    countryButtonAriaLabel: 'Länderauswahl öffnen',
    countryResultsAnnouncement: '{count} Länder',
    validationRequired: 'Telefonnummer ist erforderlich',
    validationTooShort: 'Telefonnummer ist zu kurz',
    validationTooLong: 'Telefonnummer ist zu lang',
    validationInvalid: 'Ungültige Telefonnummer',
  },
  es: {
    selectCountry: 'Seleccionar país',
    countrySearchPlaceholder: 'Buscar país...',
    noCountriesFound: 'No se encontraron países',
    searchCountriesAriaLabel: 'Buscar países',
    countryOptionsAriaLabel: 'Opciones de país',
    countryButtonAriaLabel: 'Abrir selector de país',
    countryResultsAnnouncement: '{count} países',
    validationRequired: 'El número de teléfono es obligatorio',
    validationTooShort: 'El número de teléfono es demasiado corto',
    validationTooLong: 'El número de teléfono es demasiado largo',
    validationInvalid: 'Número de teléfono no válido',
  },
  pt: {
    selectCountry: 'Selecionar país',
    countrySearchPlaceholder: 'Pesquisar país...',
    noCountriesFound: 'Nenhum país encontrado',
    searchCountriesAriaLabel: 'Pesquisar países',
    countryOptionsAriaLabel: 'Opções de país',
    countryButtonAriaLabel: 'Abrir seletor de país',
    countryResultsAnnouncement: '{count} países',
    validationRequired: 'O número de telefone é obrigatório',
    validationTooShort: 'O número de telefone é muito curto',
    validationTooLong: 'O número de telefone é muito longo',
    validationInvalid: 'Número de telefone inválido',
  },
  it: {
    selectCountry: 'Seleziona paese',
    countrySearchPlaceholder: 'Cerca paese...',
    noCountriesFound: 'Nessun paese trovato',
    searchCountriesAriaLabel: 'Cerca paesi',
    countryOptionsAriaLabel: 'Opzioni paese',
    countryButtonAriaLabel: 'Apri selettore paese',
    countryResultsAnnouncement: '{count} paesi',
    validationRequired: 'Il numero di telefono è obbligatorio',
    validationTooShort: 'Il numero di telefono è troppo corto',
    validationTooLong: 'Il numero di telefono è troppo lungo',
    validationInvalid: 'Numero di telefono non valido',
  },
  ja: {
    selectCountry: '国を選択',
    countrySearchPlaceholder: '国を検索...',
    noCountriesFound: '国が見つかりません',
    searchCountriesAriaLabel: '国を検索',
    countryOptionsAriaLabel: '国の候補',
    countryButtonAriaLabel: '国のセレクターを開く',
    countryResultsAnnouncement: '{count} 件の国',
    validationRequired: '電話番号は必須です',
    validationTooShort: '電話番号が短すぎます',
    validationTooLong: '電話番号が長すぎます',
    validationInvalid: '無効な電話番号です',
  },
  ko: {
    selectCountry: '국가 선택',
    countrySearchPlaceholder: '국가 검색...',
    noCountriesFound: '국가를 찾을 수 없습니다',
    searchCountriesAriaLabel: '국가 검색',
    countryOptionsAriaLabel: '국가 옵션',
    countryButtonAriaLabel: '국가 선택기 열기',
    countryResultsAnnouncement: '국가 {count}개',
    validationRequired: '전화번호는 필수입니다',
    validationTooShort: '전화번호가 너무 짧습니다',
    validationTooLong: '전화번호가 너무 깁니다',
    validationInvalid: '유효하지 않은 전화번호입니다',
  },
  zh: {
    selectCountry: '选择国家',
    countrySearchPlaceholder: '搜索国家...',
    noCountriesFound: '未找到国家',
    searchCountriesAriaLabel: '搜索国家',
    countryOptionsAriaLabel: '国家选项',
    countryButtonAriaLabel: '打开国家选择器',
    countryResultsAnnouncement: '{count} 个国家',
    validationRequired: '请输入电话号码',
    validationTooShort: '电话号码过短',
    validationTooLong: '电话号码过长',
    validationInvalid: '无效的电话号码',
  },
  ar: {
    selectCountry: 'اختر الدولة',
    countrySearchPlaceholder: 'ابحث عن دولة...',
    noCountriesFound: 'لم يتم العثور على دول',
    searchCountriesAriaLabel: 'ابحث عن الدول',
    countryOptionsAriaLabel: 'خيارات الدول',
    countryButtonAriaLabel: 'افتح محدد الدولة',
    countryResultsAnnouncement: '{count} دولة',
    validationRequired: 'رقم الهاتف مطلوب',
    validationTooShort: 'رقم الهاتف قصير جدًا',
    validationTooLong: 'رقم الهاتف طويل جدًا',
    validationInvalid: 'رقم هاتف غير صالح',
  },
  hi: {
    selectCountry: 'देश चुनें',
    countrySearchPlaceholder: 'देश खोजें...',
    noCountriesFound: 'कोई देश नहीं मिला',
    searchCountriesAriaLabel: 'देश खोजें',
    countryOptionsAriaLabel: 'देश विकल्प',
    countryButtonAriaLabel: 'देश चयन खोलें',
    countryResultsAnnouncement: '{count} देश',
    validationRequired: 'फ़ोन नंबर आवश्यक है',
    validationTooShort: 'फ़ोन नंबर बहुत छोटा है',
    validationTooLong: 'फ़ोन नंबर बहुत लंबा है',
    validationInvalid: 'अमान्य फ़ोन नंबर',
  },
};

function getPrimaryLanguage(locale?: string | readonly string[]): string | undefined {
  const locales = Array.isArray(locale) ? locale : locale ? [locale] : [];
  const firstLocale = locales.find(Boolean);
  return firstLocale ? firstLocale.toLowerCase().split('-')[0] : undefined;
}

export function resolvePhoneInputLabels(
  locale?: string | readonly string[],
  overrides?: Partial<PhoneInputLabels>
): PhoneInputLabels {
  const language = getPrimaryLanguage(locale);
  const localizedDefaults = language ? LABELS_BY_LANGUAGE[language] : undefined;

  return {
    ...DEFAULT_PHONE_INPUT_LABELS,
    ...localizedDefaults,
    ...overrides,
  };
}