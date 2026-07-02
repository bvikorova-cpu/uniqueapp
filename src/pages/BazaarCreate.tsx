import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function BazaarCreate() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceEur, setPriceEur] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (!title || !priceEur) { toast({ title: "Title and price are required", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("bazaar_listings" as any).insert({
      user_id: user.id, title, description, price_eur: Number(priceEur), currency: "EUR", status: "active",
    });
    setSaving(false);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Listing created" });
    nav("/bazaar");
  };

  return (
    <>
      <FloatingHowItWorks title="How Bazaar Create works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <main className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">Create Listing</h1>
      <Card>
        <CardHeader><CardTitle>New item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          <Input type="number" inputMode="decimal" placeholder="Price (€)" value={priceEur} onChange={(e) => setPriceEur(e.target.value)} />
          <Button onClick={submit} disabled={saving} className="w-full">{saving ? "Saving…" : "Publish"}</Button>
        </CardContent>
      </Card>
    </main>
    </>
    );
}
