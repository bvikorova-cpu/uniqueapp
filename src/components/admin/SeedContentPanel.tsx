import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Admin-only tool to populate the platform with demo content so the
 * homepage, Megatalent feed and Megaforum don't feel empty pre-launch.
 * Every seeded row is prefixed with `[DEMO]` for easy bulk-purge later.
 */
export function SeedContentPanel() {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (target: "all" | "megatalent" | "forum" | "purge") => {
    setBusy(target);
    try {
      const { data, error } = await supabase.functions.invoke("admin-seed-content", {
        body: { target },
      });
      if (error) throw error;
      const r = (data as any)?.results ?? {};
      toast.success(
        target === "purge" ? "Demo content removed" : "Demo content seeded",
        {
          description: Object.entries(r)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · "),
        }
      );
    } catch (e: any) {
      toast.error(e.message || "Seed failed");
    } finally {
      setBusy(null);
    }
  };

  const Btn = ({ id, label, icon: Icon, variant = "default" }: any) => (
    <Button onClick={() => run(id)} disabled={!!busy} variant={variant} className="gap-2">
      {busy === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </Button>
  );

  return (
    <Card className="p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" /> Seed Demo Content
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Populates Megatalent and Megaforum with a handful of <code>[DEMO]</code>-tagged
          rows so empty feeds don't deter new visitors. Safe to re-run; bulk-purge removes
          everything created here.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Btn id="all" label="Seed all" icon={Sparkles} />
        <Btn id="megatalent" label="Megatalent only" icon={Sparkles} variant="outline" />
        <Btn id="forum" label="Forum only" icon={Sparkles} variant="outline" />
        <Btn id="purge" label="Purge demo rows" icon={Trash2} variant="destructive" />
      </div>
    </Card>
  );
}
