import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BazaarPhotoUploader, type PendingPhoto } from "@/components/bazaar/BazaarPhotoUploader";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Coins, Gavel, Loader2 } from "lucide-react";

export const AUCTION_CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "collectibles", label: "Collectibles" },
  { value: "art", label: "Art & Design" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home & Garden" },
  { value: "vehicles", label: "Vehicles" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

const CONDITIONS = ["New", "Like New", "Very Good", "Good", "Used"];

const DURATIONS = [
  { value: "6", label: "6 hours" },
  { value: "12", label: "12 hours" },
  { value: "24", label: "24 hours" },
  { value: "48", label: "2 days" },
  { value: "72", label: "3 days" },
  { value: "168", label: "7 days" },
];

export default function AuctionCreate() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("electronics");
  const [condition, setCondition] = useState("Good");
  const [duration, setDuration] = useState("24");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (!title || !startingPrice) { toast({ title: "Title and starting price are required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i].file;
        const ext = file.name.split(".").pop();
        const name = `${user.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("auction_images").upload(name, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("auction_images").getPublicUrl(name);
        urls.push(publicUrl);
      }

      const { error } = await (supabase as any).rpc("publish_auction_item", {
        _title: title,
        _description: description,
        _category: category,
        _starting_price: Number(startingPrice),
        _buyout_price: buyoutPrice ? Number(buyoutPrice) : null,
        _condition: condition,
        _location: location,
        _duration_hours: Number(duration),
        _image_urls: urls.length ? urls : null,
      });
      if (error) throw error;
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Auction published", description: "2 credits used. Bidding is now open." });
      nav(`/auction?category=${category}`);
    } catch (e: any) {
      const msg = String(e?.message || "");
      toast({
        title: "Could not publish",
        description: msg.includes("INSUFFICIENT_CREDITS")
          ? "Not enough credits — publishing an auction costs 2 credits."
          : msg || "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO title="Start an auction — 2 credits" description="Publish an auction for 2 credits and let buyers bid. No commission — you settle the deal directly." canonical="/auction/create" />
      <main className="container max-w-2xl py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => nav("/auction")}>
          <ArrowLeft className="h-4 w-4" /> Back to Auctions
        </Button>

        <div className="mb-6">
          <Badge variant="outline" className="mb-3 border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            <Gavel className="mr-2 h-3.5 w-3.5" /> New auction
          </Badge>
          <h1 className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-3xl font-black text-transparent">
            Start an auction
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-primary" /> Publishing costs 2 credits · bidding is free · no commission
          </p>
        </div>

        <Card className="border-primary/20 shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.5)]">
          <CardHeader><CardTitle>Item details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input type="number" inputMode="decimal" placeholder="Starting price (€)" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} />
              <Input type="number" inputMode="decimal" placeholder="Buy-now price (€, optional)" value={buyoutPrice} onChange={(e) => setBuyoutPrice(e.target.value)} />
              <Input placeholder="City / area" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {AUCTION_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <BazaarPhotoUploader photos={photos} onChange={setPhotos} />

            <p className="text-xs text-muted-foreground">
              E-mails, phone numbers, links and messaging apps are removed automatically — bidders unlock your chat for 2 credits.
            </p>

            <Button onClick={submit} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
              {saving ? "Publishing…" : "Publish auction · 2 credits"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
