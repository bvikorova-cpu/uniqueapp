import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // multiplier vs EUR base
  flag: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: "EUR", symbol: "€", rate: 1, flag: "🇪🇺", label: "Euro" },
  { code: "USD", symbol: "$", rate: 1.08, flag: "🇺🇸", label: "US Dollar" },
  { code: "GBP", symbol: "£", rate: 0.85, flag: "🇬🇧", label: "British Pound" },
  { code: "CHF", symbol: "CHF ", rate: 0.97, flag: "🇨🇭", label: "Swiss Franc" },
  { code: "PLN", symbol: "zł ", rate: 4.3, flag: "🇵🇱", label: "Polish Złoty" },
  { code: "CZK", symbol: "Kč ", rate: 25, flag: "🇨🇿", label: "Czech Koruna" },
  { code: "INR", symbol: "₹", rate: 90, flag: "🇮🇳", label: "Indian Rupee" },
  { code: "BRL", symbol: "R$", rate: 5.5, flag: "🇧🇷", label: "Brazilian Real" },
  { code: "JPY", symbol: "¥", rate: 162, flag: "🇯🇵", label: "Japanese Yen" },
];

const STORAGE_KEY = "global-currency";
const LEGACY_KEY = "subscription-currency";

export const formatPrice = (eurAmount: number, currency: Currency) => {
  const v = eurAmount * currency.rate;
  const rounded = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${currency.symbol}${rounded.toLocaleString()}`;
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (eurAmount: number) => string;
  currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const detectInitial = (): Currency => {
  if (typeof window === "undefined") return CURRENCIES[0];
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (saved) {
      const f = CURRENCIES.find((c) => c.code === saved);
      if (f) return f;
    }
    const locale = navigator.language || "en-EU";
    const region = locale.split("-")[1]?.toUpperCase();
    const map: Record<string, string> = {
      US: "USD", GB: "GBP", CH: "CHF", PL: "PLN", CZ: "CZK",
      IN: "INR", BR: "BRL", JP: "JPY",
    };
    const code = map[region || ""] || "EUR";
    return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  } catch {
    return CURRENCIES[0];
  }
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);

  useEffect(() => {
    setCurrencyState(detectInitial());
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c.code); } catch {}
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        format: (v: number) => formatPrice(v, currency),
        currencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Safe fallback if used outside provider
    return {
      currency: CURRENCIES[0],
      setCurrency: () => {},
      format: (v: number) => formatPrice(v, CURRENCIES[0]),
      currencies: CURRENCIES,
    } as CurrencyContextValue;
  }
  return ctx;
};
