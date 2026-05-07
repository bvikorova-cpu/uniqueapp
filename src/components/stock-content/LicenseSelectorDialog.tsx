import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Euro, Crown, Newspaper, ImageIcon } from "lucide-react";

interface LicenseSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    title: string;
    price_eur: number;
    license_pricing?: Record<string, number> | null;
    is_editorial?: boolean;
  } | null;
  onSelect: (licenseType: "standard" | "extended" | "editorial", priceEur: number) => void;
}

export function LicenseSelectorDialog({ open, onOpenChange, item, onSelect }: LicenseSelectorDialogProps) {
  if (!item) return null;

  const base = Number(item.price_eur || 0);
  const pricing = item.license_pricing || {};
  const standardPrice = Number(pricing.standard ?? base);
  const extendedPrice = Number(pricing.extended ?? base * 5);
  const editorialPrice = Number(pricing.editorial ?? base * 0.5);

  const licenses = [
    {
      type: "standard" as const,
      name: "Standard License",
      icon: ImageIcon,
      price: standardPrice,
      color: "from-blue-500 to-cyan-600",
      features: [
        "Web & social media use",
        "Up to 500,000 print copies",
        "Marketing materials",
        "Single end product",
      ],
      hidden: item.is_editorial,
    },
    {
      type: "extended" as const,
      name: "Extended License",
      icon: Crown,
      price: extendedPrice,
      color: "from-amber-500 to-orange-600",
      badge: "BEST VALUE",
      features: [
        "Unlimited print copies",
        "Resale & merchandise",
        "Templates for sale",
        "Multiple end products",
      ],
      hidden: item.is_editorial,
    },
    {
      type: "editorial" as const,
      name: "Editorial License",
      icon: Newspaper,
      price: editorialPrice,
      color: "from-slate-500 to-gray-600",
      features: [
        "News & journalism only",
        "Documentary use",
        "Educational publications",
        "Non-commercial only",
      ],
      hidden: false,
    },
  ].filter((l) => !l.hidden);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a license</DialogTitle>
          <DialogDescription>
            Select the right license for "{item.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {licenses.map((lic) => {
            const Icon = lic.icon;
            return (
              <Card
                key={lic.type}
                className="relative p-5 cursor-pointer border-2 hover:border-primary transition-all hover:-translate-y-1"
                onClick={() => onSelect(lic.type, lic.price)}
              >
                {lic.badge && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600">
                    {lic.badge}
                  </Badge>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lic.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-1">{lic.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <Euro className="w-4 h-4" />
                  <span className="text-2xl font-black">{lic.price.toFixed(2)}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {lic.features.map((f, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="sm">Select</Button>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
