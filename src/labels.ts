import type { PhoneInputLabels } from './types';

export const DEFAULT_PHONE_INPUT_LABELS: PhoneInputLabels = {
  selectCountry: 'Select country',
  countrySearchPlaceholder: 'Search countries...',
  noCountriesFound: 'No countries found',
  searchCountriesAriaLabel: 'Search countries',
  countryOptionsAriaLabel: 'Country options',
  countryButtonAriaLabel: 'Open country selector',
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
  },
  de: {
    selectCountry: 'Land auswählen',
    countrySearchPlaceholder: 'Land suchen...',
    noCountriesFound: 'Keine Länder gefunden',
    searchCountriesAriaLabel: 'Länder suchen',
    countryOptionsAriaLabel: 'Länderoptionen',
    countryButtonAriaLabel: 'Länderauswahl öffnen',
  },
  es: {
    selectCountry: 'Seleccionar país',
    countrySearchPlaceholder: 'Buscar país...',
    noCountriesFound: 'No se encontraron países',
    searchCountriesAriaLabel: 'Buscar países',
    countryOptionsAriaLabel: 'Opciones de país',
    countryButtonAriaLabel: 'Abrir selector de país',
  },
  pt: {
    selectCountry: 'Selecionar país',
    countrySearchPlaceholder: 'Pesquisar país...',
    noCountriesFound: 'Nenhum país encontrado',
    searchCountriesAriaLabel: 'Pesquisar países',
    countryOptionsAriaLabel: 'Opções de país',
    countryButtonAriaLabel: 'Abrir seletor de país',
  },
  it: {
    selectCountry: 'Seleziona paese',
    countrySearchPlaceholder: 'Cerca paese...',
    noCountriesFound: 'Nessun paese trovato',
    searchCountriesAriaLabel: 'Cerca paesi',
    countryOptionsAriaLabel: 'Opzioni paese',
    countryButtonAriaLabel: 'Apri selettore paese',
  },
  ja: {
    selectCountry: '国を選択',
    countrySearchPlaceholder: '国を検索...',
    noCountriesFound: '国が見つかりません',
    searchCountriesAriaLabel: '国を検索',
    countryOptionsAriaLabel: '国の候補',
    countryButtonAriaLabel: '国のセレクターを開く',
  },
  ko: {
    selectCountry: '국가 선택',
    countrySearchPlaceholder: '국가 검색...',
    noCountriesFound: '국가를 찾을 수 없습니다',
    searchCountriesAriaLabel: '국가 검색',
    countryOptionsAriaLabel: '국가 옵션',
    countryButtonAriaLabel: '국가 선택기 열기',
  },
  zh: {
    selectCountry: '选择国家',
    countrySearchPlaceholder: '搜索国家...',
    noCountriesFound: '未找到国家',
    searchCountriesAriaLabel: '搜索国家',
    countryOptionsAriaLabel: '国家选项',
    countryButtonAriaLabel: '打开国家选择器',
  },
  ar: {
    selectCountry: 'اختر الدولة',
    countrySearchPlaceholder: 'ابحث عن دولة...',
    noCountriesFound: 'لم يتم العثور على دول',
    searchCountriesAriaLabel: 'ابحث عن الدول',
    countryOptionsAriaLabel: 'خيارات الدول',
    countryButtonAriaLabel: 'افتح محدد الدولة',
  },
  hi: {
    selectCountry: 'देश चुनें',
    countrySearchPlaceholder: 'देश खोजें...',
    noCountriesFound: 'कोई देश नहीं मिला',
    searchCountriesAriaLabel: 'देश खोजें',
    countryOptionsAriaLabel: 'देश विकल्प',
    countryButtonAriaLabel: 'देश चयन खोलें',
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