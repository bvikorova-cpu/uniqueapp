import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Coins, Loader2, Sparkles, Upload, X } from "lucide-react";

const CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel" },
  { value: "beauty", label: "Beauty & Spa" },
  { value: "tech", label: "Tech & Electronics" },
  { value: "general", label: "General" },
];

const TYPES = [
  { value: "discount_code", label: "Discount Code" },
  { value: "gift_card", label: "Gift Card" },
  { value: "voucher", label: "Voucher" },
  { value: "cashback", label: "Cashback Offer" },
  { value: "bogo", label: "Buy One Get One" },
];

export default function CouponCreate() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storeName, setStoreName] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState("general");
  const [couponType, setCouponType] = useState("discount_code");
  const [expiry, setExpiry] = useState("");
  const [location, setLocation] = useState("");
  const [terms, setTerms] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" }); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (!title || !storeName || !originalValue || !sellingPrice) {
      toast({ title: "Fill in title, store, value and price", variant: "destructive" }); return;
    }
    if (parseFloat(sellingPrice) >= parseFloat(originalValue)) {
      toast({ title: "Price must be lower than the coupon value", variant: "destructive" }); return;
    }
    if (!confirmed) { toast({ title: "Please confirm the coupon value is accurate", variant: "destructive" }); return; }

    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (file) {
        const name = `${user.id}/${Date.now()}.${file.name.split(".").pop()}`;
        const { error: upErr } = await supabase.storage.from("coupon_images").upload(name, file);
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from("coupon_images").getPublicUrl(name).data.publicUrl;
      }

      const { error } = await (supabase as any).rpc("publish_coupon_listing", {
        _title: title,
        _description: description || null,
        _store_name: storeName,
        _original_value: Number(originalValue),
        _selling_price: Number(sellingPrice),
        _category: category,
        _coupon_type: couponType,
        _expiry_date: expiry || null,
        _location: location || null,
        _terms_conditions: terms || null,
        _image_url: imageUrl,
        _discount_code: null,
      });
      if (error) throw error;
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Coupon published", description: "2 credits used. Contact details are auto-hidden." });
      nav(`/coupon-marketplace?category=${category}`);
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
      <SEO
        title="Post a coupon listing"
        description="Publish a coupon, gift card or voucher for 2 credits. No commission — you deal directly with the buyer."
        canonical="/coupon-marketplace/create"
      />
      <main className="container max-w-2xl py-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => nav("/coupon-marketplace")}>
          <ArrowLeft className="h-4 w-4" /> Back to Coupon Marketplace
        </Button>

        <div className="mb-6">
          <Badge variant="outline" className="mb-3 border-primary/40 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> New coupon
          </Badge>
          <h1 className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-3xl font-black text-transparent">
            Post a coupon
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 text-primary" /> Publishing costs 2 credits · no commission on your deal
          </p>
        </div>

        <Card className="border-primary/20 shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.5)]">
          <CardHeader><CardTitle>Coupon details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title (e.g. €50 gift card for 35)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Store / brand" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input type="number" inputMode="decimal" placeholder="Original value (€)" value={originalValue} onChange={(e) => setOriginalValue(e.target.value)} />
              <Input type="number" inputMode="decimal" placeholder="Your price (€)" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={couponType} onValueChange={setCouponType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              <Input placeholder="City / area (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <Textarea placeholder="Terms & conditions (optional)" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} />

            <div className="rounded-lg border border-dashed p-3">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Coupon preview" className="h-40 w-full rounded-md object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => { setFile(null); setPreview(""); }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" /> Add a photo (optional, max 5 MB)
                  <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
                </label>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
              <span>I confirm the coupon value / balance is accurate and the coupon is valid.</span>
            </label>

            <p className="text-xs text-muted-foreground">
              Contact details (e-mails, phone numbers, links, messenger names) are removed automatically. Buyers unlock the
              chat with you for 2 credits and you settle the payment directly between yourselves.
            </p>

            <Button className="w-full gap-2" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
              Publish · 2 credits
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
