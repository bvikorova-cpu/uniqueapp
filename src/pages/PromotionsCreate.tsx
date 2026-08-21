import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Upload, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const PROMO_CATEGORIES = ["business", "event", "restaurant", "beauty", "fitness", "shop", "service", "real_estate", "job", "other"];

export default function PromotionsCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [tier, setTier] = useState<"standard" | "top">("standard");
  const [category, setCategory] = useState("business");
  const [city, setCity] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Megaphone className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Sign in required</h2>
            <p className="text-muted-foreground">You need an account to publish a promotion.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFile = (f: File | null) => {
    if (!f) { setFile(null); setPreview(""); return; }
    if (f.size > 25 * 1024 * 1024) {
      toast.error("File is too large (max 25 MB)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const normalizeLink = (raw: string): string | null => {
    const v = raw.trim();
    if (!v) return null;
    const withProto = /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
    try {
      const u = new URL(withProto);
      if (!u.hostname.includes(".")) return null;
      return u.toString();
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please upload an image or video"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }

    // Open the checkout tab synchronously. Waiting until after the upload and
    // Edge Function call causes mobile browsers (and the embedded preview) to
    // treat Stripe as a blocked popup or attempt to render it inside an iframe.
    const checkoutWindow = window.open("about:blank", "_blank");
    if (checkoutWindow) {
      checkoutWindow.document.title = "Opening Stripe Checkout…";
      checkoutWindow.document.body.textContent = "Opening secure Stripe Checkout…";
    }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("promotions").upload(path, file, { cacheControl: "3600",
        upsert: false });
      if (upErr) throw upErr;

      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const publicPath = `/storage/v1/object/public/promotions/${path}`;

      const { data: inserted, error: insErr } = await supabase
        .from("promo_listings")
        .insert({ user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          media_url: publicPath,
          media_type: mediaType,
          link_url: normalizeLink(linkUrl),
          tier,
          category,
          city: city.trim() || null,
          status: "pending" })
        .select()
        .single();
      if (insErr) throw insErr;

      const { data: result, error: fnErr } = await supabase.functions.invoke("create-promo-subscription", {
        body: { listingId: inserted.id, tier },
      });
      if (fnErr) throw fnErr;
      if (result?.error) throw new Error(result.error);
      if (!result?.url) throw new Error("Could not open Stripe Checkout");

      const checkoutUrl = result.url as string;
      const parsedCheckoutUrl = new URL(checkoutUrl);
      if (parsedCheckoutUrl.protocol !== "https:") {
        throw new Error("Stripe returned an invalid checkout link");
      }
      if (checkoutWindow && !checkoutWindow.closed) {
        // Do not clear `opener` before navigation. Chrome on Android can sever
        // the WindowProxy immediately, leaving the user stuck on about:blank.
        checkoutWindow.location.href = parsedCheckoutUrl.toString();
      } else {
        window.location.assign(parsedCheckoutUrl.toString());
      }

    } catch (e: unknown) {
      checkoutWindow?.close();
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <SEO title="Publish a promotion — Unique" description="Publish your promotion on the Unique Promotions Board." />
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <Megaphone className="h-10 w-10 mx-auto text-primary mb-2" />
          <h1 className="text-3xl font-bold">Publish your promotion</h1>
          <p className="text-muted-foreground">Reach every visitor of Unique.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
              </div>
              <div>
                <Label htmlFor="desc">Short description</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={4} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full h-10 border border-input rounded-md bg-background px-3 text-sm capitalize">
                    {PROMO_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="promo-city">City / area</Label>
                  <Input id="promo-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                </div>
              </div>
              <div>
                <Label htmlFor="link">External link (optional)</Label>
                <Input id="link" type="text" inputMode="url" autoCapitalize="none" spellCheck={false} placeholder="example.com or https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              </div>
              <div>
                <Label>Media (image or video) *</Label>
                <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : "Click to upload (max 25 MB)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {preview && (
                  <div className="mt-3 rounded-lg overflow-hidden bg-muted aspect-video">
                    {file?.type.startsWith("video") ? (
                      <video src={preview} muted autoPlay loop playsInline className="w-full h-full object-contain" />
                    ) : (
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Choose your plan</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["standard", "top"] as const).map((t) => {
                const selected = tier === t;
                const isTop = t === "top";
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTier(t)}
                    className={`text-left rounded-xl border-2 p-5 transition ${
                      selected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isTop && <Crown className="h-5 w-5 text-primary" />}
                        <span className="font-bold text-lg">{isTop ? "TOP" : "Standard"}</span>
                      </div>
                      {isTop && <Badge className="bg-gradient-to-r from-primary to-accent text-white">Best</Badge>}
                    </div>
                    <div className="text-3xl font-black mb-1">
                      €{isTop ? 50 : 20}
                      <span className="text-sm font-normal text-muted-foreground"> / month</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isTop
                        ? "Pinned to the top of the board with premium styling."
                        : "Standard placement in the main grid."}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg" variant="premium" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {submitting ? "Publishing…" : `Publish for €${tier === "top" ? 50 : 20}/month`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
