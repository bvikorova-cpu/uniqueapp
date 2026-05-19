import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loadLocale, SUPPORTED_LANGUAGES } from "@/i18n/config";

const ALL_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

// Only show languages that we actually ship translation bundles for.
export const languages = ALL_LANGUAGES.filter(l => SUPPORTED_LANGUAGES.includes(l.code));

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Load preferred language from profile when the user logs in.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      const pref = data?.preferred_language;
      if (!cancelled && pref && pref !== i18n.language && languages.some(l => l.code === pref)) {
        i18n.changeLanguage(pref);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageChange = async (language: typeof languages[0]) => {
    setSearchTerm("");
    try { localStorage.setItem("preferred_language", language.code); } catch {}
    await loadLocale(language.code);
    await i18n.changeLanguage(language.code);
    if (user) {
      await supabase
        .from("profiles")
        .update({ preferred_language: language.code })
        .eq("id", user.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto bg-background z-50">
        <div className="p-2 sticky top-0 bg-background z-10">
          <Input
            placeholder="Search language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto">
          {filteredLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className={`cursor-pointer ${
                currentLanguage.code === language.code ? 'bg-accent' : ''
              }`}
            >
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </DropdownMenuItem>
          ))}
          {filteredLanguages.length === 0 && (
            <div className="p-2 text-center text-sm text-muted-foreground">
              No language found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
