import { useState } from "react";

export const TRANSLATION_LANGS = [
  { code: "en", label: "English" },
  { code: "sk", label: "Slovak" },
  { code: "cs", label: "Czech" },
  { code: "hu", label: "Magyar" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "pl", label: "Polski" },
  { code: "pt", label: "Português" },
  { code: "ro", label: "Română" },
  { code: "ru", label: "Русский" },
];
const KEY = "pet_translation_lang";

export function getPetTranslationLang() {
  return localStorage.getItem(KEY) || "en";
}

export default function PetLanguageSelector() {
  const [lang, setLang] = useState(getPetTranslationLang());
  return (
    <select value={lang} onChange={(e) => { setLang(e.target.value); localStorage.setItem(KEY, e.target.value); }}
      className="h-9 rounded-md border bg-background px-2 text-sm">
      {TRANSLATION_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}
