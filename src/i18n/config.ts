import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import sk from './locales/sk/translation.json';
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';
import cs from './locales/cs/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sk: { translation: sk },
      en: { translation: en },
      de: { translation: de },
      cs: { translation: cs },
      es: { translation: es },
      fr: { translation: fr },
    },
    lng: 'en', // Predvolený jazyk
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
