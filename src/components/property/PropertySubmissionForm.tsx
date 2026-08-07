import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowLeft, Building2, Coins, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const LISTING_CREDIT_COST = 25;
const LISTING_DAYS = 60;
const MAX_IMAGE_MB = 10;
const MAX_IMAGES = 20;

export default function PropertySubmissionForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", location: "", propertyType: "", area: "", rooms: "",
  });
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("ai_credits")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      setBalance(data?.credits_remaining ?? 0);
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.title || !formData.description || !formData.price || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0 || priceNum > 100_000_000) {
      toast.error("Invalid price");
      return;
    }
    if (images.length > MAX_IMAGES) { toast.error(`Max ${MAX_IMAGES} photos`); return; }
    for (const img of images) {
      if (!img.type.startsWith("image/")) { toast.error(`Invalid image: ${img.name}`); return; }
      if (img.size > MAX_IMAGE_MB * 1024 * 1024) { toast.error(`Image too large (>${MAX_IMAGE_MB}MB): ${img.name}`); return; }
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); navigate("/auth"); return; }

      // 1) Charge the flat listing fee (atomic, writes the credits ledger row)
      const { data: newBalance, error: creditError } = await supabase.rpc("deduct_ai_credits_atomic", {
        _user_id: user.id,
        _amount: LISTING_CREDIT_COST,
      });
      if (creditError) {
        toast.error("Not enough credits", {
          description: `Publishing a listing costs ${LISTING_CREDIT_COST} credits (€10).`,
          action: { label: "Top up", onClick: () => navigate("/ai-credits") },
        });
        return;
      }
      setBalance(typeof newBalance === "number" ? newBalance : null);

      // 2) Create the listing (live immediately)
      const expiresAt = new Date(Date.now() + LISTING_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          title: formData.title.trim().slice(0, 200),
          description: formData.description.trim().slice(0, 5000),
          price: priceNum,
          location: formData.location.trim(),
          address: formData.location.trim(),
          city: formData.location.trim(),
          property_type: formData.propertyType || "apartment",
          area_sqm: formData.area ? parseInt(formData.area) : 50,
          rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
          status: "active",
          listing_expires_at: expiresAt,
        } as any)
        .select().single();

      if (propertyError) throw propertyError;

      // 3) Upload photos
      await Promise.all(images.map(async (image, idx) => {
        const fileExt = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const fileName = `${property.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("property-images").upload(fileName, image, { contentType: image.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(fileName);
        const { error: imgErr } = await supabase.from("property_images").insert({ property_id: property.id, image_url: publicUrl, is_primary: idx === 0 });
        if (imgErr) throw imgErr;
      }));

      toast.success("Listing published", { description: `${LISTING_CREDIT_COST} credits used. Live for ${LISTING_DAYS} days.` });
      navigate("/my-properties");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error creating listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How posting a listing works"
        steps={[
          { title: "Describe the property", desc: "Title, description, price in EUR, location, size and type." },
          { title: "Add photos", desc: `Up to ${MAX_IMAGES} photos, max ${MAX_IMAGE_MB}MB each. The first one becomes the cover.` },
          { title: `Pay ${LISTING_CREDIT_COST} credits`, desc: "A flat €10 fee is deducted from your credit balance — no commission on the sale." },
          { title: "Go live", desc: `The listing is published instantly for ${LISTING_DAYS} days and buyers message you directly.` },
        ]}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6 pt-24">
          <Button variant="ghost" onClick={() => navigate("/property-marketplace")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-6 mb-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-primary-foreground">Post a property listing</h1>
                  <p className="text-primary-foreground/80 text-sm">
                    Flat fee {LISTING_CREDIT_COST} credits (€10) · live {LISTING_DAYS} days · 0% commission
                  </p>
                </div>
              </div>
            </div>

            <Card className="mb-6 border-primary/30 bg-card/80 backdrop-blur-xl">
              <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Your balance:</span>
                  <Badge variant="outline">{balance === null ? "—" : `${balance} credits`}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/ai-credits")}>Top up credits</Button>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-card/80 border-border/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="E.g., Sea-view villa with private pool" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Detailed property description…" rows={6} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (€) *</Label>
                      <Input id="price" type="number" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} placeholder="150000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input id="location" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="City, district" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (m²)</Label>
                      <Input id="area" type="number" value={formData.area} onChange={(e) => handleInputChange("area", e.target.value)} placeholder="85" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Rooms</Label>
                      <Input id="rooms" type="number" value={formData.rooms} onChange={(e) => handleInputChange("rooms", e.target.value)} placeholder="3" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Photos (max {MAX_IMAGES})</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, MAX_IMAGES))}
                      />
                      <Label htmlFor="images" className="cursor-pointer text-sm text-primary font-medium">
                        Click to select photos
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">The first photo becomes the cover image.</p>
                    </div>
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {images.map((img, i) => (
                          <Badge key={`${img.name}-${i}`} variant="secondary" className="gap-1">
                            {img.name.slice(0, 22)}
                            <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} aria-label={`Remove ${img.name}`}>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing…</>
                    ) : (
                      <><Coins className="w-4 h-4 mr-2" /> Publish listing · {LISTING_CREDIT_COST} credits</>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {LISTING_CREDIT_COST} credits (€10) are deducted once when publishing. No commission on your sale.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
