import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';

const SUPPORTED = ['en', 'sk', 'cs', 'de', 'es', 'fr', 'it', 'hu', 'ru', 'ja', 'ko', 'zh'];
const localeModules = import.meta.glob<Record<string, unknown>>('./locales/*/translation.json');

function detectInitialLanguage(): string {
  // English is the default for everyone. Users can still switch via the language selector,
  // and that choice is persisted in localStorage.
  try {
    const stored = localStorage.getItem('preferred_language');
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    lng: 'en',
    fallbackLng: 'en',
    initImmediate: false,
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      // Surface untranslated keys in the browser console for QA.
      console.warn(`[i18n] Missing key "${key}" for language(s): ${Array.isArray(lngs) ? lngs.join(', ') : lngs}`);
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

async function loadLocale(lng: string) {
  if (lng === 'en' || i18n.hasResourceBundle(lng, 'translation')) return;
  const loader = localeModules[`./locales/${lng}/translation.json`];
  if (!loader) return;
  const mod = await loader();
  i18n.addResourceBundle(lng, 'translation', mod.default ?? mod, true, true);
}

const initialLanguage = detectInitialLanguage();
if (initialLanguage !== 'en') {
  loadLocale(initialLanguage)
    .then(() => i18n.changeLanguage(initialLanguage))
    .catch(() => i18n.changeLanguage('en'));
}

// persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('preferred_language', lng);
  } catch {}
});

export default i18n;
