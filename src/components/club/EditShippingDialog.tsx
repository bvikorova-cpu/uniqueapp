import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { ClubMembership } from "@/hooks/useClubMembership";

interface Props {
  membership: ClubMembership;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

interface Form {
  recipient_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
  note: string;
}

const initialFromMembership = (m: ClubMembership): Form => {
  const addr = m.shipping_address?.address ?? m.shipping_address ?? {};
  return {
    recipient_name: m.recipient_name ?? m.shipping_address?.name ?? "",
    phone: m.phone ?? m.shipping_address?.phone ?? "",
    line1: addr.line1 ?? "",
    line2: addr.line2 ?? "",
    city: addr.city ?? "",
    postal_code: addr.postal_code ?? "",
    state: addr.state ?? "",
    country: (addr.country ?? "SK").toUpperCase(),
    note: m.shipping_note ?? "",
  };
};

export function EditShippingDialog({ membership, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(() => initialFromMembership(membership));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-club-shipping", {
        body: form,
      });
      if (error || (data as any)?.error) {
        throw new Error((data as any)?.error ?? error?.message ?? "Update failed");
      }
      toast({ title: "Shipping details saved" });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({
        title: "Couldn't save",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Physical VIP Card — Shipping</DialogTitle>
          <DialogDescription>
            We'll print your NFC card with the recipient name and ship it to this address.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Recipient name *</Label>
              <Input value={form.recipient_name} onChange={(e) => set("recipient_name", e.target.value)} />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+421 …" />
            </div>
          </div>
          <div>
            <Label>Address line 1 *</Label>
            <Input value={form.line1} onChange={(e) => set("line1", e.target.value)} />
          </div>
          <div>
            <Label>Address line 2</Label>
            <Input value={form.line2} onChange={(e) => set("line2", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Postal code *</Label>
              <Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
            </div>
            <div>
              <Label>City *</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <Label>State/Region</Label>
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Country (ISO 2) *</Label>
            <Input
              value={form.country}
              onChange={(e) => set("country", e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
              placeholder="SK"
            />
          </div>
          <div>
            <Label>Delivery note (optional)</Label>
            <Textarea
              maxLength={300}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Buzzer, floor, gate code…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving…" : "Save shipping details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
