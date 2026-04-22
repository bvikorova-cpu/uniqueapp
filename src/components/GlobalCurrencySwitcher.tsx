import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Props {
  variant?: "navbar" | "inline";
}

export const GlobalCurrencySwitcher = ({ variant = "navbar" }: Props) => {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "navbar" ? "ghost" : "outline"}
          size={variant === "navbar" ? "icon" : "sm"}
          className={variant === "navbar" ? "" : "gap-2 rounded-full"}
          aria-label="Change currency"
        >
          {variant === "navbar" ? (
            <span className="text-base leading-none">{currency.flag}</span>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span className="text-base leading-none">{currency.flag}</span>
              <span className="font-semibold">{currency.code}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{c.flag}</span>
            <span className="flex-1">
              <span className="font-semibold">{c.code}</span>
              <span className="text-xs text-muted-foreground ml-2">{c.label}</span>
            </span>
            {currency.code === c.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
