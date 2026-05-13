import { useState } from "react";
import { TrendingUp, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCreatorFund } from "@/hooks/useCreatorFund";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  userId?: string;
}

export function CreatorFundDialog({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data, loading, updateSettings } = useCreatorFund(userId);
  const isOwn = !userId || userId === user?.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          {isOwn ? "Creator Fund" : "Štatistiky"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOwn ? <Settings className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {isOwn ? "Creator Fund nastavenia" : "Creator metriky"}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto my-6" />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {(isOwn || data?.show_total_earned) && (
                <div className="rounded-md border border-border/50 p-2">
                  <p className="text-base font-semibold">€{Number(data?.total_earned_eur ?? 0).toFixed(0)}</p>
                  <span className="text-muted-foreground">Zarobené</span>
                </div>
              )}
              {(isOwn || data?.show_subscriber_count) && (
                <div className="rounded-md border border-border/50 p-2">
                  <p className="text-base font-semibold">{data?.subscriber_count ?? 0}</p>
                  <span className="text-muted-foreground">Subs</span>
                </div>
              )}
              {(isOwn || data?.show_tip_count) && (
                <div className="rounded-md border border-border/50 p-2">
                  <p className="text-base font-semibold">{data?.tip_count ?? 0}</p>
                  <span className="text-muted-foreground">Tipy</span>
                </div>
              )}
            </div>

            {isOwn && (
              <div className="space-y-3 border-t border-border/40 pt-3">
                <p className="text-xs text-muted-foreground">Verejne zobraziť:</p>
                {[
                  { key: "show_total_earned", label: "Celkový zárobok" },
                  { key: "show_subscriber_count", label: "Počet predplatiteľov" },
                  { key: "show_tip_count", label: "Počet tipov" },
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between">
                    <Label htmlFor={opt.key}>{opt.label}</Label>
                    <Switch
                      id={opt.key}
                      checked={(data as any)?.[opt.key] ?? false}
                      onCheckedChange={(v) => updateSettings({ [opt.key]: v } as any)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
