import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import sk from './locales/sk/translation.json';
import cs from './locales/cs/translation.json';
import de from './locales/de/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';
import it from './locales/it/translation.json';
import hu from './locales/hu/translation.json';
import ru from './locales/ru/translation.json';
import ja from './locales/ja/translation.json';
import ko from './locales/ko/translation.json';
import zh from './locales/zh/translation.json';

const SUPPORTED = ['en', 'sk', 'cs', 'de', 'es', 'fr', 'it', 'hu', 'ru', 'ja', 'ko', 'zh'];

function detectInitialLanguage(): string {
  // 1. user previously chose a language
  try {
    const stored = localStorage.getItem('preferred_language');
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}
  // 2. browser language
  if (typeof navigator !== 'undefined') {
    const browserLangs = navigator.languages || [navigator.language];
    for (const raw of browserLangs) {
      const code = raw.toLowerCase().split('-')[0];
      if (SUPPORTED.includes(code)) return code;
    }
  }
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sk: { translation: sk },
      cs: { translation: cs },
      de: { translation: de },
      es: { translation: es },
      fr: { translation: fr },
      it: { translation: it },
      hu: { translation: hu },
      ru: { translation: ru },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
    },
    lng: detectInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('preferred_language', lng);
  } catch {}
});

export default i18n;
