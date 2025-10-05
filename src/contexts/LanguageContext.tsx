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
      
      // Home page
      'home.hero.badge': '💰 Vyhraj až 100.000 € každý mesiac!',
      'home.hero.title': 'Vitaj v',
      'home.hero.subtitle': 'Sociálna sieť, kde tvoj talent môže zmeniť tvoj život. Súťaž, hlasuj, nakupuj a zarábaj s priateľmi!',
      'home.hero.search': 'Hľadaj služby... (napr. hry, vzdelávanie, dating)',
      'home.hero.cta': 'Vstúp do súťaže',
      'home.services.title': 'Naše',
      'home.services.title2': 'služby',
      'home.services.subtitle': 'Kompletná platforma pre všetky tvoje potreby',
      'home.services.feed': 'Zdieľaj momenty a komunikuj s priateľmi',
      'home.services.videos': 'Sleduj a vytváraj krátke videá',
      'home.services.messenger': 'Chatuj so známymi v reálnom čase',
      'home.services.megatalent': 'Súťaž o 100.000 € každý mesiac',
      'home.services.megaforum': 'Diskutuj a zdieľaj názory s komunitou',
      'home.services.psychologist': 'AI asistent pre duševné zdravie 24/7',
      'home.services.education': 'Online doučovanie, kvízy a kurzy',
      'home.services.vacationer': 'Rezervuj dovolenky a zájazdy online',
      'home.services.dating': 'Nájdi si partnera a nové priateľstvá',
      'home.services.first_aid': 'Návody na poskytnutie prvej pomoci',
      'home.services.fit_slim': 'Cvičebné plány a zdravé recepty',
      'home.services.marketplace': 'Poskytovanie, predaj a kúpa služieb poskytovaných na celom svete',
      'home.services.bazaar': 'Predávaj a kupuj od ostatných používateľov',
      'home.services.referral': 'Získaj 5 € za každého priateľa',
      'home.services.games': 'Hraj obľúbené online hry zadarmo',
      'home.services.jobs': 'Nájdi si prácu alebo zamestnanca',
      'home.services.influ_king': 'Staň sa influencerom a zarábaj',
      'home.services.auction': 'Ponúkaj a vydražuj produkty z celého sveta',
      'home.services.ai_generation': 'Vytváraj obrázky pomocou umelej inteligencie',
      'home.services.best_friend': 'Tvoj AI priateľ, ktorý ťa nikdy neopustí',
      'home.services.cooking': 'Zdravé recepty a jedálnické lístky',
      
      // Auth page
      'auth.welcome': 'Vitajte',
      'auth.description': 'Prihláste sa alebo vytvorte nový účet',
      'auth.back_to_login': '← Späť na prihlásenie',
      'auth.email': 'Email',
      'auth.email_placeholder': 'vas@email.com',
      'auth.password': 'Heslo',
      'auth.full_name': 'Celé meno',
      'auth.name_placeholder': 'Vaše meno',
      'auth.forgot_password': 'Zabudli ste heslo?',
      'auth.login_btn': 'Prihlásiť sa',
      'auth.register_btn': 'Registrovať sa',
      'auth.login_tab': 'Prihlásenie',
      'auth.register_tab': 'Registrácia',
      'auth.loading_login': 'Prihlasovanie...',
      'auth.loading_register': 'Registrácia...',
      'auth.loading_reset': 'Odesilanie...',
      'auth.reset_link': 'Odoslať odkaz na obnovenie',
      'auth.error_login': 'Chyba pri prihlásení',
      'auth.error_register': 'Chyba pri registrácii',
      'auth.error': 'Chyba',
      'auth.success_register': 'Registrácia úspešná!',
      'auth.success_register_desc': 'Skontrolujte svoj email pre potvrdenie.',
      'auth.success_login': 'Prihlásenie úspešné!',
      'auth.success_reset': 'Email bol odoslaný!',
      'auth.success_reset_desc': 'Skontrolujte svoj email pre odkaz na obnovenie hesla.',
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
      
      // Home page
      'home.hero.badge': '💰 Win up to €100,000 every month!',
      'home.hero.title': 'Welcome to',
      'home.hero.subtitle': 'A social network where your talent can change your life. Compete, vote, shop and earn with friends!',
      'home.hero.search': 'Search services... (e.g. games, education, dating)',
      'home.hero.cta': 'Enter the competition',
      'home.services.title': 'Our',
      'home.services.title2': 'services',
      'home.services.subtitle': 'Complete platform for all your needs',
      'home.services.feed': 'Share moments and communicate with friends',
      'home.services.videos': 'Watch and create short videos',
      'home.services.messenger': 'Chat with friends in real time',
      'home.services.megatalent': 'Compete for €100,000 every month',
      'home.services.megaforum': 'Discuss and share opinions with the community',
      'home.services.psychologist': 'AI assistant for mental health 24/7',
      'home.services.education': 'Online tutoring, quizzes and courses',
      'home.services.vacationer': 'Book holidays and trips online',
      'home.services.dating': 'Find a partner and new friendships',
      'home.services.first_aid': 'First aid instructions',
      'home.services.fit_slim': 'Workout plans and healthy recipes',
      'home.services.marketplace': 'Providing, selling and buying services worldwide',
      'home.services.bazaar': 'Sell and buy from other users',
      'home.services.referral': 'Get €5 for each friend',
      'home.services.games': 'Play popular online games for free',
      'home.services.jobs': 'Find a job or employee',
      'home.services.influ_king': 'Become an influencer and earn',
      'home.services.auction': 'Offer and auction products from around the world',
      'home.services.ai_generation': 'Create images using artificial intelligence',
      'home.services.best_friend': 'Your AI friend who will never leave you',
      'home.services.cooking': 'Healthy recipes and meal plans',
      
      // Auth page
      'auth.welcome': 'Welcome',
      'auth.description': 'Sign in or create a new account',
      'auth.back_to_login': '← Back to login',
      'auth.email': 'Email',
      'auth.email_placeholder': 'your@email.com',
      'auth.password': 'Password',
      'auth.full_name': 'Full name',
      'auth.name_placeholder': 'Your name',
      'auth.forgot_password': 'Forgot password?',
      'auth.login_btn': 'Sign in',
      'auth.register_btn': 'Register',
      'auth.login_tab': 'Login',
      'auth.register_tab': 'Registration',
      'auth.loading_login': 'Signing in...',
      'auth.loading_register': 'Registering...',
      'auth.loading_reset': 'Sending...',
      'auth.reset_link': 'Send reset link',
      'auth.error_login': 'Login error',
      'auth.error_register': 'Registration error',
      'auth.error': 'Error',
      'auth.success_register': 'Registration successful!',
      'auth.success_register_desc': 'Check your email for confirmation.',
      'auth.success_login': 'Login successful!',
      'auth.success_reset': 'Email sent!',
      'auth.success_reset_desc': 'Check your email for password reset link.',
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
