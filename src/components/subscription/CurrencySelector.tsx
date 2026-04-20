import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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

const STORAGE_KEY = "subscription-currency";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (c: Currency) => void;
}

/** Auto-detects currency from the browser locale on first mount. */
export const useDetectedCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const found = CURRENCIES.find((c) => c.code === saved);
        if (found) {
          setCurrency(found);
          return;
        }
      }
      const locale = navigator.language || "en-EU";
      const region = locale.split("-")[1]?.toUpperCase();
      const map: Record<string, string> = {
        US: "USD", GB: "GBP", CH: "CHF", PL: "PLN", CZ: "CZK",
        IN: "INR", BR: "BRL", JP: "JPY",
      };
      const code = map[region || ""] || "EUR";
      const found = CURRENCIES.find((c) => c.code === code);
      if (found) setCurrency(found);
    } catch {
      // ignore
    }
  }, []);

  const update = (c: Currency) => {
    setCurrency(c);
    try { localStorage.setItem(STORAGE_KEY, c.code); } catch {}
  };

  return [currency, update] as const;
};

export const formatPrice = (eurAmount: number, currency: Currency) => {
  const v = eurAmount * currency.rate;
  // Round nicely depending on magnitude
  const rounded = v >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
  return `${currency.symbol}${rounded.toLocaleString()}`;
};

export const CurrencySelector = ({ value, onChange }: CurrencySelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full">
          <Globe className="h-4 w-4" />
          <span className="text-base leading-none">{value.flag}</span>
          <span className="font-semibold">{value.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => onChange(c)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{c.flag}</span>
            <span className="flex-1">
              <span className="font-semibold">{c.code}</span>
              <span className="text-xs text-muted-foreground ml-2">{c.label}</span>
            </span>
            {value.code === c.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
