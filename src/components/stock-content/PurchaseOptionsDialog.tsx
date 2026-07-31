import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Euro, ImageIcon, Maximize2, Newspaper } from "lucide-react";

export type LicenseKey = "standard" | "extended" | "editorial";
export type ResolutionKey = "small" | "medium" | "large" | "original";

interface ResolutionMeta {
  url?: string;
  width?: number;
  price_multiplier?: number;
}

interface PurchaseOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    title: string;
    price_eur: number;
    license_pricing?: Record<string, number> | null;
    is_editorial?: boolean;
    resolutions?: Partial<Record<ResolutionKey, ResolutionMeta>> | null;
  } | null;
  onConfirm: (selection: {
    licenseType: LicenseKey;
    resolution: ResolutionKey;
    licenseFeeEur: number;
    assetPriceEur: number;
    totalEur: number;
  }) => void;
}


export function PurchaseOptionsDialog({ open, onOpenChange, item, onConfirm }: PurchaseOptionsDialogProps) {
  const base = Number(item?.price_eur || 0);
  const pricing = item?.license_pricing || {};

  const licenses = useMemo(() => {
    const all = [
      {
        type: "standard" as LicenseKey,
        name: "Standard License",
        icon: ImageIcon,
        fee: Number(pricing.standard ?? base),
        color: "from-blue-500 to-cyan-600",
        features: ["Web & social media use", "Up to 500,000 print copies", "Single end product"],
        hidden: !!item?.is_editorial,
      },
      {
        type: "extended" as LicenseKey,
        name: "Extended License",
        icon: Crown,
        fee: Number(pricing.extended ?? base * 5),
        color: "from-amber-500 to-orange-600",
        badge: "BEST VALUE",
        features: ["Unlimited print copies", "Resale & merchandise", "Multiple end products"],
        hidden: !!item?.is_editorial,
      },
      {
        type: "editorial" as LicenseKey,
        name: "Editorial License",
        icon: Newspaper,
        fee: Number(pricing.editorial ?? base * 0.5),
        color: "from-slate-500 to-gray-600",
        features: ["News & journalism only", "Documentary use", "Non-commercial only"],
        hidden: false,
      },
    ];
    return all.filter((l) => !l.hidden);
  }, [base, item?.is_editorial, JSON.stringify(pricing)]);

  const [license, setLicense] = useState<LicenseKey>("standard");
  const [resolution, setResolution] = useState<ResolutionKey>("large");

  useEffect(() => {
    if (open) {
      setLicense(licenses[0]?.type ?? "standard");
      setResolution("large");
    }
  }, [open, item?.id]);

  if (!item) return null;

  const activeLicense = licenses.find((l) => l.type === license) ?? licenses[0];

  const licenseFee = Math.max(0, Number(activeLicense?.fee || 0));
  // Seller sets a fixed asset price — resolution does NOT change it.
  const assetPrice = base;
  const total = licenseFee + assetPrice;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle>Complete your purchase</DialogTitle>
          <DialogDescription>
            Choose a license and download size for "{item.title}" — one single payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <h4 className="text-sm font-semibold mb-2">1. Platform license</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {licenses.map((lic) => {
                const Icon = lic.icon;
                const active = lic.type === license;
                return (
                  <Card
                    key={lic.type}
                    role="button"
                    tabIndex={0}
                    onClick={() => setLicense(lic.type)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLicense(lic.type); } }}
                    className={`relative p-4 cursor-pointer border-2 transition-all ${active ? "border-primary shadow-md" : "border-border hover:border-primary/50"}`}
                  >
                    {lic.badge && (
                      <Badge className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-[10px]">
                        {lic.badge}
                      </Badge>
                    )}
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${lic.color} flex items-center justify-center mb-2 shadow`}>
                      <Icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h5 className="font-bold text-sm">{lic.name}</h5>
                    <div className="flex items-baseline gap-0.5 mb-2">
                      <Euro className="w-3.5 h-3.5" />
                      <span className="text-lg font-black">{lic.fee.toFixed(2)}</span>
                    </div>
                    <ul className="space-y-1">
                      {lic.features.map((f, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1">
                          <Check className="w-2.5 h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">
              2. Download
            </h4>
            <Card className="p-4 border-2 border-primary shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
                  <Maximize2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-sm">Original / Full download</h5>
                  <p className="text-[11px] text-muted-foreground">All resolutions included — one fixed price set by the seller.</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-0.5 justify-end">
                    <Euro className="w-3.5 h-3.5" />
                    <span className="text-xl font-black">{assetPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>


          <Card className="p-4 bg-muted/40">
            <h4 className="text-sm font-semibold mb-3">Order summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  Platform license ({activeLicense?.name.replace(" License", "")})
                </span>
                <span className="font-semibold whitespace-nowrap">€{licenseFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  Asset price (fixed by seller)
                </span>
                <span className="font-semibold whitespace-nowrap">€{assetPrice.toFixed(2)}</span>

              </div>
              <Separator />
              <div className="flex items-center justify-between gap-2 text-base">
                <span className="font-bold">Total due</span>
                <span className="font-black whitespace-nowrap">€{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() =>
                onConfirm({
                  licenseType: license,
                  resolution,
                  licenseFeeEur: Number(licenseFee.toFixed(2)),
                  assetPriceEur: Number(assetPrice.toFixed(2)),
                  totalEur: Number(total.toFixed(2)),
                })
              }
            >
              Pay €{total.toFixed(2)} — single checkout
            </Button>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              You pass through the payment gateway only once. Both items are on one invoice.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
