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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Please upload an image or video"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("promotions").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      const mediaType = file.type.startsWith("video") ? "video" : "image";
      const publicPath = `/storage/v1/object/public/promotions/${path}`;

      const { data: inserted, error: insErr } = await supabase
        .from("promo_listings")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          media_url: publicPath,
          media_type: mediaType,
          link_url: linkUrl.trim() || null,
          tier,
          category,
          city: city.trim() || null,
          status: "pending",
        })
        .select()
        .single();
      if (insErr) throw insErr;

      const { data: checkout, error: fnErr } = await supabase.functions.invoke(
        "create-promo-subscription",
        { body: { listingId: inserted.id, tier } },
      );
      if (fnErr) throw fnErr;
      if (checkout?.url) {
        window.location.href = checkout.url;
      } else {
        throw new Error(checkout?.error || "Checkout failed");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
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
              <div>
                <Label htmlFor="link">External link (optional)</Label>
                <Input id="link" type="url" placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
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
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
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
              {submitting ? "Preparing checkout…" : `Continue to payment (€${tier === "top" ? 50 : 20}/mo)`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
