import { useState } from "react";
import { Bell, BellRing, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  productId: string;
  currentPriceCents: number;
}

export const PriceAlertDialog = ({ productId, currentPriceCents }: Props) => {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>(((currentPriceCents * 0.9) / 100).toFixed(2));
  const { alerts, createAlert, removeAlert } = usePriceAlerts(productId);

  const handleCreate = () => {
    const cents = Math.round(parseFloat(target) * 100);
    if (!cents || cents <= 0) return;
    createAlert({ productId, targetCents: cents });
    setOpen(false);
  };

  return (
    <>
      <FloatingHowItWorks title="How Price Alert Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {alerts.length > 0 ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4" />}
          Price Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notify me when price drops</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Current price: <span className="font-bold text-foreground">€{(currentPriceCents / 100).toFixed(2)}</span>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Target price (€)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleCreate}>
            Set Alert
          </Button>

          {alerts.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Active alerts</p>
              {alerts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>≤ €{(a.target_price_cents / 100).toFixed(2)}</span>
                  <Button size="icon" variant="ghost" onClick={() => removeAlert(a.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
};
