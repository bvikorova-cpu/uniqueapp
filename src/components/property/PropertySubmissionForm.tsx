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
import { Upload } from "lucide-react";

const LISTING_PACKAGES = [
  { id: "basic", name: "Basic", price: 29, duration: 30, features: ["Základná prezentácia", "30 dní aktívne"] },
  { id: "premium", name: "Premium", price: 79, duration: 60, features: ["Rozšírená prezentácia", "Propagácia", "60 dní aktívne"] },
  { id: "featured", name: "Featured", price: 149, duration: 90, features: ["TOP pozícia", "Maximálna viditeľnosť", "90 dní aktívne"] },
];

export default function PropertySubmissionForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("basic");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    propertyType: "",
    area: "",
    rooms: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.location) {
      toast.error("Prosím vyplňte všetky povinné polia");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Musíte byť prihlásený");
        navigate("/auth");
        return;
      }

      // Create property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          location: formData.location,
          property_type: formData.propertyType,
          area_sqm: formData.area ? parseFloat(formData.area) : undefined,
          rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Upload images
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${property.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);

        await supabase
          .from("property_images")
          .insert({
            property_id: property.id,
            image_url: publicUrl,
            is_primary: images.indexOf(image) === 0,
          });
      }

      // Upload videos
      for (const video of videos) {
        const fileExt = video.name.split('.').pop();
        const fileName = `${property.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("property-videos")
          .upload(fileName, video);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("property-videos")
          .getPublicUrl(fileName);

        await supabase
          .from("property_videos")
          .insert({
            property_id: property.id,
            video_url: publicUrl,
          });
      }

      // Create payment session
      const selectedPkg = LISTING_PACKAGES.find(pkg => pkg.id === selectedPackage);
      if (!selectedPkg) throw new Error("Balík nenájdený");

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-property-listing-payment",
        {
          body: {
            propertyId: property.id,
            packageType: selectedPackage,
            durationDays: selectedPkg.duration,
            price: selectedPkg.price,
          },
        }
      );

      if (paymentError) throw paymentError;

      // Redirect to Stripe checkout
      window.open(paymentData.url, '_blank');
      toast.success("Nehnuteľnosť vytvorená! Dokončite platbu.");
      navigate("/property-marketplace");

    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Chyba pri vytváraní inzerátu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pridať nehnuteľnosť</CardTitle>
          <CardDescription>Vyplňte informácie o vašej nehnuteľnosti</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Názov *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Napr. 3-izbový byt v centre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Podrobný popis nehnuteľnosti..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Cena (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="150000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokácia *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Bratislava, Staré Mesto"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Typ</Label>
                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Byt</SelectItem>
                    <SelectItem value="house">Dom</SelectItem>
                    <SelectItem value="land">Pozemok</SelectItem>
                    <SelectItem value="commercial">Komerčná nehnuteľnosť</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Plocha (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleInputChange("area", e.target.value)}
                  placeholder="75"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Počet izieb</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => handleInputChange("rooms", e.target.value)}
                  placeholder="3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotografie</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {images.length > 0 ? `${images.length} fotiek vybraných` : "Kliknite pre nahranie fotiek"}
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Video (voliteľné)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {videos.length > 0 ? `${videos.length} videí vybraných` : "Kliknite pre nahranie videa"}
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Vyberte balík</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LISTING_PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold">€{pkg.price}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Vytváram..." : "Vytvoriť inzerát a prejsť na platbu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
