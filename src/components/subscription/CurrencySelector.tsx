import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CURRENCIES,
  formatPrice,
  useCurrency,
  type Currency,
} from "@/contexts/CurrencyContext";

export type { Currency };
export { CURRENCIES, formatPrice };

/**
 * Backwards-compatible hook. Now reads/writes the global currency context
 * so that the user's choice persists across the entire app.
 */
export const useDetectedCurrency = () => {
  const { currency, setCurrency } = useCurrency();
  return [currency, setCurrency] as const;
};

interface CurrencySelectorProps {
  value: Currency;
  onChange: (c: Currency) => void;
}

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
