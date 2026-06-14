import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowLeft, Check, Building2, Camera, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { SellerConnectGate } from "@/components/commerce/SellerConnectGate";

const LISTING_PACKAGES = [
  { id: "basic", name: "Basic", price: 29, duration: 30, features: ["Basic presentation", "30 days active"], color: "from-sky-500/10 to-blue-500/10", border: "border-sky-500/20" },
  { id: "premium", name: "Premium", price: 79, duration: 60, features: ["Extended presentation", "Promotion", "60 days active"], color: "from-primary/10 to-accent/10", border: "border-primary/20" },
  { id: "featured", name: "Featured", price: 149, duration: 90, features: ["TOP position", "Maximum visibility", "90 days active"], color: "from-amber-500/10 to-yellow-500/10", border: "border-amber-500/20" },
];

export default function PropertySubmissionForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", location: "", propertyType: "", area: "", rooms: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const MAX_IMAGE_MB = 10;
  const MAX_VIDEO_MB = 100;
  const MAX_IMAGES = 20;
  const MAX_VIDEOS = 3;

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
    if (videos.length > MAX_VIDEOS) { toast.error(`Max ${MAX_VIDEOS} videos`); return; }
    for (const img of images) {
      if (!img.type.startsWith("image/")) { toast.error(`Invalid image: ${img.name}`); return; }
      if (img.size > MAX_IMAGE_MB * 1024 * 1024) { toast.error(`Image too large (>${MAX_IMAGE_MB}MB): ${img.name}`); return; }
    }
    for (const v of videos) {
      if (!v.type.startsWith("video/")) { toast.error(`Invalid video: ${v.name}`); return; }
      if (v.size > MAX_VIDEO_MB * 1024 * 1024) { toast.error(`Video too large (>${MAX_VIDEO_MB}MB): ${v.name}`); return; }
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); navigate("/auth"); return; }

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
          property_type: formData.propertyType || 'apartment',
          area_sqm: formData.area ? parseInt(formData.area) : 50,
          rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
          status: 'draft',
        } as any)
        .select().single();

      if (propertyError) throw propertyError;

      await Promise.all(images.map(async (image, idx) => {
        const fileExt = (image.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${property.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("property-images").upload(fileName, image, { contentType: image.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(fileName);
        const { error: imgErr } = await supabase.from("property_images").insert({ property_id: property.id, image_url: publicUrl, is_primary: idx === 0 });
        if (imgErr) throw imgErr;
      }));

      await Promise.all(videos.map(async (video) => {
        const fileExt = (video.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fileName = `${property.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("property-videos").upload(fileName, video, { contentType: video.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("property-videos").getPublicUrl(fileName);
        const { error: vErr } = await supabase.from("property_videos").insert({ property_id: property.id, video_url: publicUrl });
        if (vErr) throw vErr;
      }));

      toast.success("Property submitted! Proceeding to payment...");
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-property-listing-checkout', {
        body: { propertyId: property.id, packageType: selectedPackage }
      });
      if (checkoutError) throw checkoutError;
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        toast.error("Checkout could not start. Please contact support.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Error creating listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <Button variant="ghost" onClick={() => navigate("/property-marketplace")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Mini Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 p-6 mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Add Property Listing</h1>
                <p className="text-white/70 text-sm">Fill in the details and choose a package</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <SellerConnectGate />
          </div>

          <Card className="backdrop-blur-xl bg-card/80 border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="E.g., 3-bedroom apartment downtown" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Detailed property description..." rows={5} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} placeholder="150000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="City, District" required />
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
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area (m²)</Label>
                    <Input type="number" value={formData.area} onChange={(e) => handleInputChange("area", e.target.value)} placeholder="75" />
                  </div>
                  <div className="space-y-2">
                    <Label>Rooms</Label>
                    <Input type="number" value={formData.rooms} onChange={(e) => handleInputChange("rooms", e.target.value)} placeholder="3" />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Camera className="w-4 h-4" /> Photos</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-sky-500/50 transition-colors cursor-pointer bg-card/60">
                    <Input type="file" accept="image/*" multiple onChange={(e) => e.target.files && setImages(Array.from(e.target.files))} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{images.length > 0 ? `${images.length} photos selected` : "Click to upload photos"}</p>
                    </label>
                  </div>
                </div>

                {/* Video Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Video (optional)</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-sky-500/50 transition-colors cursor-pointer bg-card/60">
                    <Input type="file" accept="video/*" multiple onChange={(e) => e.target.files && setVideos(Array.from(e.target.files))} className="hidden" id="video-upload" />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{videos.length > 0 ? `${videos.length} videos selected` : "Click to upload video"}</p>
                    </label>
                  </div>
                </div>

                {/* Package Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-black">Select Package</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {LISTING_PACKAGES.map((pkg) => (
                      <Card
                        key={pkg.id}
                        className={`cursor-pointer transition-all bg-gradient-to-br ${pkg.color} ${pkg.border} ${
                          selectedPackage === pkg.id ? "ring-2 ring-primary scale-[1.02]" : "hover:scale-[1.01]"
                        }`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-black">{pkg.name}</CardTitle>
                          <CardDescription className="text-2xl font-black bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">€{pkg.price}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-1 text-sm">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-3 h-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Listing & Proceed to Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
