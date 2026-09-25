import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const KLP_PRINT_PREORDER_CREDITS = 50; // €25
export const KLP_MEGA_BUNDLE_CREDITS = 100; // €50
const LANGS = ["English", "Slovak", "Hungarian", "German", "Spanish", "French"];

type Pkg = "print" | "mega";

export function KlpBookPreorder({ onMegaPurchased }: { onMegaPurchased?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ language: "English", full_name: "", address_line: "", city: "", postal_code: "", country: "", phone: "", email: user?.email ?? "", note: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const open = (p: Pkg) => {
    if (!user) { navigate("/auth"); return; }
    setF((prev) => ({ ...prev, email: prev.email || user.email || "" }));
    setPkg(p);
  };

  const submit = async () => {
    if (!pkg) return;
    if (!f.full_name.trim() || !f.address_line.trim() || !f.city.trim() || !f.postal_code.trim() || !f.country.trim()) {
      toast({ title: "Missing details", description: "Fill in name, address, city, postal code and country.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await (supabase as any).rpc("kids_book_preorder_create", {
      _package: pkg, _language: f.language, _full_name: f.full_name, _address_line: f.address_line, _city: f.city,
      _postal_code: f.postal_code, _country: f.country, _phone: f.phone, _email: f.email, _note: f.note,
    });
    setBusy(false);
    if (error) {
      if (/INSUFFICIENT_CREDITS/i.test(error.message)) {
        const cost = pkg === "mega" ? `${KLP_MEGA_BUNDLE_CREDITS} credits (€50)` : `${KLP_PRINT_PREORDER_CREDITS} credits (€25)`;
        toast({ title: "Not enough credits", description: `This costs ${cost}. Top up and try again.`, variant: "destructive" });
        navigate("/ai-credits");
      } else {
        toast({ title: "Preorder failed", description: error.message, variant: "destructive" });
      }
      return;
    }
    toast({ title: "Preorder confirmed 🎉", description: pkg === "mega" ? "PDF + e-book in all 6 languages unlocked. We'll notify you when the book ships." : "We'll notify you when your book ships." });
    if (pkg === "mega") onMegaPurchased?.();
    setPkg(null);
  };

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="border-primary/40">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-primary" /> Printed book · Preorder</div>
            <p className="text-sm text-muted-foreground">A real printed Learning Encyclopedia delivered to your door, in the language of your choice.</p>
            <Button className="mt-auto gap-2" onClick={() => open("print")}>
              <Package className="h-4 w-4" /> Preorder · {KLP_PRINT_PREORDER_CREDITS} credits (€25)
            </Button>
          </CardContent>
        </Card>
        <Card className="border-accent/60 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-accent" /> Mega bundle
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">Best value</Badge>
            </div>
            <p className="text-sm text-muted-foreground">PDF in all 6 languages + e-book in all 6 languages + printed book (preorder).</p>
            <Button className="mt-auto gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={() => open("mega")}>
              <Sparkles className="h-4 w-4" /> Get mega bundle · {KLP_MEGA_BUNDLE_CREDITS} credits (€50)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={pkg !== null} onOpenChange={(o) => !o && setPkg(null)}>
        <DialogContent className="max-h-[95dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{pkg === "mega" ? "Mega bundle" : "Printed book preorder"}</DialogTitle>
            <DialogDescription>
              {pkg === "mega"
                ? `${KLP_MEGA_BUNDLE_CREDITS} credits (€50). Digital access unlocks immediately; the printed book ships when ready.`
                : `${KLP_PRINT_PREORDER_CREDITS} credits (€25). You'll get a notification when your book ships.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-sm font-medium">Printed book language</div>
              <div className="flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <Button key={l} type="button" size="sm" variant={f.language === l ? "default" : "outline"} onClick={() => setF((p) => ({ ...p, language: l }))}>{l}</Button>
                ))}
              </div>
            </div>
            <Input placeholder="Recipient full name *" value={f.full_name} onChange={set("full_name")} maxLength={120} />
            <Input placeholder="Street and number *" value={f.address_line} onChange={set("address_line")} maxLength={250} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City *" value={f.city} onChange={set("city")} maxLength={120} />
              <Input placeholder="Postal code *" value={f.postal_code} onChange={set("postal_code")} maxLength={20} />
            </div>
            <Input placeholder="Country *" value={f.country} onChange={set("country")} maxLength={80} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Phone" value={f.phone} onChange={set("phone")} maxLength={40} />
              <Input placeholder="Email" type="email" value={f.email} onChange={set("email")} maxLength={160} />
            </div>
            <Textarea placeholder="Note for delivery (optional)" value={f.note} onChange={set("note")} maxLength={500} />
            <Button className="w-full gap-2" onClick={submit} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay {pkg === "mega" ? `${KLP_MEGA_BUNDLE_CREDITS} credits (€50)` : `${KLP_PRINT_PREORDER_CREDITS} credits (€25)`} & preorder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
