import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LanguageCode = string;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('language');
    return (saved as LanguageCode) || 'sk';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translations = getTranslations(language);
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translation function
const getTranslations = (lang: LanguageCode): Record<string, string> => {
  const baseTranslations: Record<string, Record<string, string>> = {
    sk: {
      // Navbar
      'nav.feed': 'Feed',
      'nav.jobs': 'Práca',
      'nav.games': 'Hry',
      'nav.megatalent': 'Megatalent',
      'nav.other_services': 'Ostatné služby',
      'nav.videos': 'Videá',
      'nav.messenger': 'Messenger',
      'nav.influ_king': 'Influ-King',
      'nav.megaforum': 'Megafórum',
      'nav.psychologist': 'Psychológ',
      'nav.vacationer': 'Vacationer',
      'nav.dating': 'Zoznamka',
      'nav.first_aid': 'Prvá pomoc',
      'nav.fit_slim': 'Fit & Slim',
      'nav.cooking': 'Varenie',
      'nav.marketplace': 'Ja spravím',
      'nav.bazaar': 'Bazár',
      'nav.referral': 'Pozvi priateľa',
      'nav.education': 'Vzdelávanie',
      'nav.terms': 'Podmienky',
      'nav.login': 'Prihlásiť sa',
      'nav.register': 'Registrácia',
      'nav.logout': 'Odhlásiť sa',
      'nav.my_profile': 'Môj profil',
      'nav.premium': 'Premium',
      
      // Common
      'common.search': 'Hľadať',
      'common.search_language': 'Hľadať jazyk...',
      'common.no_language_found': 'Žiadny jazyk sa nenašiel',
      'common.save': 'Uložiť',
      'common.cancel': 'Zrušiť',
      'common.edit': 'Upraviť',
      'common.delete': 'Vymazať',
      'common.loading': 'Načítava sa...',
    },
    en: {
      // Navbar
      'nav.feed': 'Feed',
      'nav.jobs': 'Jobs',
      'nav.games': 'Games',
      'nav.megatalent': 'Megatalent',
      'nav.other_services': 'Other Services',
      'nav.videos': 'Videos',
      'nav.messenger': 'Messenger',
      'nav.influ_king': 'Influ-King',
      'nav.megaforum': 'Megaforum',
      'nav.psychologist': 'Psychologist',
      'nav.vacationer': 'Vacationer',
      'nav.dating': 'Dating',
      'nav.first_aid': 'First Aid',
      'nav.fit_slim': 'Fit & Slim',
      'nav.cooking': 'Cooking',
      'nav.marketplace': 'I will do',
      'nav.bazaar': 'Bazaar',
      'nav.referral': 'Invite a friend',
      'nav.education': 'Education',
      'nav.terms': 'Terms',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      'nav.my_profile': 'My Profile',
      'nav.premium': 'Premium',
      
      // Common
      'common.search': 'Search',
      'common.search_language': 'Search language...',
      'common.no_language_found': 'No language found',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.loading': 'Loading...',
    },
    cs: {
      // Navbar
      'nav.feed': 'Feed',
      'nav.jobs': 'Práce',
      'nav.games': 'Hry',
      'nav.megatalent': 'Megatalent',
      'nav.other_services': 'Ostatní služby',
      'nav.videos': 'Videa',
      'nav.messenger': 'Messenger',
      'nav.influ_king': 'Influ-King',
      'nav.megaforum': 'Megafórum',
      'nav.psychologist': 'Psycholog',
      'nav.vacationer': 'Vacationer',
      'nav.dating': 'Seznamka',
      'nav.first_aid': 'První pomoc',
      'nav.fit_slim': 'Fit & Slim',
      'nav.cooking': 'Vaření',
      'nav.marketplace': 'Udělám to',
      'nav.bazaar': 'Bazar',
      'nav.referral': 'Pozvi přítele',
      'nav.education': 'Vzdělávání',
      'nav.terms': 'Podmínky',
      'nav.login': 'Přihlásit se',
      'nav.register': 'Registrace',
      'nav.logout': 'Odhlásit se',
      'nav.my_profile': 'Můj profil',
      'nav.premium': 'Premium',
      
      // Common
      'common.search': 'Hledat',
      'common.search_language': 'Hledat jazyk...',
      'common.no_language_found': 'Žádný jazyk nenalezen',
      'common.save': 'Uložit',
      'common.cancel': 'Zrušit',
      'common.edit': 'Upravit',
      'common.delete': 'Smazat',
      'common.loading': 'Načítá se...',
    },
    de: {
      // Navbar
      'nav.feed': 'Feed',
      'nav.jobs': 'Jobs',
      'nav.games': 'Spiele',
      'nav.megatalent': 'Megatalent',
      'nav.other_services': 'Weitere Dienste',
      'nav.videos': 'Videos',
      'nav.messenger': 'Messenger',
      'nav.influ_king': 'Influ-King',
      'nav.megaforum': 'Megaforum',
      'nav.psychologist': 'Psychologe',
      'nav.vacationer': 'Urlauber',
      'nav.dating': 'Dating',
      'nav.first_aid': 'Erste Hilfe',
      'nav.fit_slim': 'Fit & Slim',
      'nav.cooking': 'Kochen',
      'nav.marketplace': 'Ich mache es',
      'nav.bazaar': 'Basar',
      'nav.referral': 'Freund einladen',
      'nav.education': 'Bildung',
      'nav.terms': 'Bedingungen',
      'nav.login': 'Anmelden',
      'nav.register': 'Registrieren',
      'nav.logout': 'Abmelden',
      'nav.my_profile': 'Mein Profil',
      'nav.premium': 'Premium',
      
      // Common
      'common.search': 'Suchen',
      'common.search_language': 'Sprache suchen...',
      'common.no_language_found': 'Keine Sprache gefunden',
      'common.save': 'Speichern',
      'common.cancel': 'Abbrechen',
      'common.edit': 'Bearbeiten',
      'common.delete': 'Löschen',
      'common.loading': 'Lädt...',
    },
  };

  // For languages not fully translated, fall back to English
  return baseTranslations[lang] || baseTranslations.en || {};
};
