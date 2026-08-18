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
import { ArrowLeft, Coins, Loader2, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Fashion" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports" },
  { value: "books", label: "Books & Media" },
  { value: "vehicles", label: "Vehicles" },
  { value: "hobby", label: "Hobby" },
  { value: "other", label: "Other" },
];

const CONDITIONS = ["Like New", "Very Good", "Good", "Used"];

export default function BazaarCreate() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("electronics");
  const [condition, setCondition] = useState("Good");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (!title || !price) { toast({ title: "Title and price are required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i].file;
        const ext = file.name.split(".").pop();
        const name = `${user.id}-${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from("bazaar_images").upload(name, file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("bazaar_images").getPublicUrl(name);
        urls.push(publicUrl);
      }

      const { data, error } = await (supabase as any).rpc("publish_bazaar_item", {
        _title: title,
        _description: description,
        _category: category,
        _price: Number(price),
        _location: location,
        _condition: condition,
        _listing_type: "sell",
        _image_urls: urls.length ? urls : null,
      });
      if (error) throw error;
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Listing published", description: "2 credits used. Contact details are auto-hidden." });
      nav(`/bazaar?category=${category}${data ? "" : ""}`);
    } catch (e: any) {
      const msg = String(e?.message || "");
      toast({
        title: "Could not publish",
        description: msg.includes("INSUFFICIENT_CREDITS")
          ? "Not enough credits — publishing costs 2 credits."
          : msg || "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO title="Post a Bazaar listing" description="Publish a Bazaar listing for 2 credits. No commission — deal directly with buyers." canonical="/bazaar/create" />
      <main className="container max-w-2xl py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => nav("/bazaar")}>
          <ArrowLeft className="h-4 w-4" /> Back to Bazaar
        </Button>

        <div className="mb-6">
          <Badge variant="outline" className="mb-3 border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> New listing
          </Badge>
          <h1 className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-3xl font-black text-transparent">
            Post a listing
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-primary" /> Publishing costs 2 credits · no commission on your sale
          </p>
        </div>

        <Card className="border-primary/20 shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.5)]">
          <CardHeader><CardTitle>Item details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input type="number" inputMode="decimal" placeholder="Price (€)" value={price} onChange={(e) => setPrice(e.target.value)} />
              <Input placeholder="City / area" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
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
              E-mails, phone numbers, links and messaging apps are removed automatically — buyers unlock your chat for 2 credits.
            </p>

            <Button onClick={submit} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
              {saving ? "Publishing…" : "Publish · 2 credits"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
