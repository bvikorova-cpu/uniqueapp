import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // multiplier vs EUR base
  flag: string;
  label: string;
}

// EUR-only — platform memory rule: Currency: EUR (€) exclusively.
// The currency selector remains in the API for backwards compatibility,
// but only the Euro is exposed. Do NOT add other currencies.
export const CURRENCIES: Currency[] = [
  { code: "EUR", symbol: "€", rate: 1, flag: "🇪🇺", label: "Euro" },
];

export const formatPrice = (eurAmount: number, _currency: Currency) => {
  const rounded = eurAmount >= 100 ? Math.round(eurAmount) : Math.round(eurAmount * 10) / 10;
  return `€${rounded.toLocaleString()}`;
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (eurAmount: number) => string;
  currencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const detectInitial = (): Currency => CURRENCIES[0];

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES[0]);

  useEffect(() => {
    setCurrencyState(detectInitial());
  }, []);

  const setCurrency = (_c: Currency) => {
    // EUR-only: ignore — the platform rule does not allow switching.
    setCurrencyState(CURRENCIES[0]);
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
