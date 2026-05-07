import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Euro, Smartphone, Monitor, Tv, Maximize2 } from "lucide-react";

export type ResolutionKey = "small" | "medium" | "large" | "original";

interface ResolutionMeta {
  url?: string;
  width?: number;
  price_multiplier?: number;
}

interface ResolutionSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePrice: number; // already-licensed price in EUR
  resolutions?: Partial<Record<ResolutionKey, ResolutionMeta>> | null;
  onSelect: (resolution: ResolutionKey, finalPriceEur: number) => void;
}

const DEFAULTS: Record<ResolutionKey, { label: string; sub: string; mult: number; width: number; icon: any }> = {
  small:    { label: "Small",    sub: "Web & social",      mult: 0.4, width: 640,  icon: Smartphone },
  medium:   { label: "Medium",   sub: "Blogs & email",     mult: 0.7, width: 1280, icon: Monitor },
  large:    { label: "Large",    sub: "HD print & web",    mult: 1.0, width: 1920, icon: Tv },
  original: { label: "Original", sub: "Max resolution",    mult: 1.5, width: 0,    icon: Maximize2 },
};

export function ResolutionSelectorDialog({ open, onOpenChange, basePrice, resolutions, onSelect }: ResolutionSelectorDialogProps) {
  const keys: ResolutionKey[] = ["small", "medium", "large", "original"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose download size</DialogTitle>
          <DialogDescription>Pick the resolution that fits your project</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {keys.map((k) => {
            const d = DEFAULTS[k];
            const meta = resolutions?.[k] || {};
            const mult = Number(meta.price_multiplier ?? d.mult);
            const width = Number(meta.width ?? d.width);
            const price = Math.max(0.01, basePrice * mult);
            const Icon = d.icon;
            return (
              <Card
                key={k}
                className="p-4 cursor-pointer border-2 hover:border-primary transition-all hover:-translate-y-1"
                onClick={() => onSelect(k, price)}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2 shadow-md">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="font-bold text-sm">{d.label}</h4>
                <p className="text-[11px] text-muted-foreground mb-1">{d.sub}</p>
                {width > 0 ? (
                  <Badge variant="outline" className="text-[10px] mb-2">{width}px wide</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] mb-2">Full size</Badge>
                )}
                <div className="flex items-baseline gap-0.5 mb-2">
                  <Euro className="w-3.5 h-3.5" />
                  <span className="text-lg font-black">{price.toFixed(2)}</span>
                </div>
                <ul className="space-y-1 mb-3">
                  <li className="text-[10px] text-muted-foreground flex items-start gap-1">
                    <Check className="w-2.5 h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{Math.round(mult * 100)}% of base price</span>
                  </li>
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
