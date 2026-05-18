import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Maximize2, BedDouble, Eye, Heart, Calendar, Video, Phone, Mail, Share2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContactSellerDialog } from "./ContactSellerDialog";
import { PropertyChatDialog } from "./PropertyChatDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PropertyDetailDialogProps {
  property: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailDialog({ property, open, onOpenChange }: PropertyDetailDialogProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<"contact" | "viewing">("contact");

  useEffect(() => {
    if (!user || !property?.id) { setIsFavorite(false); return; }
    supabase
      .from("property_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", property.id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, property?.id]);

  const handleContact = (type: "contact" | "viewing" = "contact") => {
    setInquiryType(type);
    setContactDialogOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) { toast.error("Please sign in to save properties"); return; }
    if (isFavorite) {
      await supabase.from("property_favorites").delete().eq("user_id", user.id).eq("property_id", property.id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("property_favorites").insert({ user_id: user.id, property_id: property.id });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  if (!property) return null;

  const images = property.property_images?.map((img: any) => img.image_url) || [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold">{property.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.city}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Image Carousel */}
        <div className="relative rounded-lg overflow-hidden mt-4">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image: string, index: number) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${property.title} - ${index + 1}`}
                    className="w-full h-[400px] object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
          
          {property.is_featured && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-purple-600">
              Featured
            </Badge>
          )}
          
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-white text-sm">
            <Eye className="h-3 w-3" />
            <span>{property.views_count}</span>
          </div>
        </div>

        {/* Price and Type */}
        <div className="flex items-center justify-between py-4 border-y">
          <div>
            <div className="text-3xl font-bold text-primary">
              €{property.price.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              €{Math.round(property.price / property.area_sqm)}/m²
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {property.property_type}
          </Badge>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
            <Maximize2 className="h-6 w-6 mb-2 text-primary" />
            <span className="text-sm text-muted-foreground">Area</span>
            <span className="font-semibold">{property.area_sqm} m²</span>
          </div>
          
          {property.rooms && (
            <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
              <BedDouble className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm text-muted-foreground">Rooms</span>
              <span className="font-semibold">{property.rooms}</span>
            </div>
          )}
          
          {property.bedrooms && (
            <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
              <BedDouble className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm text-muted-foreground">Bedrooms</span>
              <span className="font-semibold">{property.bedrooms}</span>
            </div>
          )}
          
          <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
            <Calendar className="h-6 w-6 mb-2 text-primary" />
            <span className="text-sm text-muted-foreground">Listed</span>
            <span className="font-semibold">
              {new Date(property.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="py-4">
          <h3 className="text-xl font-semibold mb-3">Description</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="py-4">
            <h3 className="text-xl font-semibold mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature: string, index: number) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Virtual Tour */}
        {property.virtual_tour_url && (
          <div className="py-4">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Video className="h-5 w-5" />
              3D Virtual Tour
            </h3>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={property.virtual_tour_url}
                className="w-full h-full border-0"
                allow="xr-spatial-tracking; gyroscope; accelerometer"
                allowFullScreen
                title="Virtual Tour"
              />
            </div>
          </div>
        )}

        {/* Videos */}
        {property.property_videos && property.property_videos.length > 0 && (
          <div className="py-4">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Tour
            </h3>
            <video
              src={property.property_videos[0].video_url}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Location */}
        <div className="py-4">
          <h3 className="text-xl font-semibold mb-3">Location</h3>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{property.address || property.location}</span>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button onClick={() => setChatOpen(true)} className="flex-1 min-w-[180px]" size="lg" disabled={!!user && user.id === property.user_id}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Message Seller
          </Button>
          <Button onClick={() => handleContact("contact")} variant="outline" className="flex-1 min-w-[180px]" size="lg">
            <Mail className="h-4 w-4 mr-2" />
            Contact Owner
          </Button>
          <Button onClick={() => handleContact("viewing")} variant="outline" className="flex-1 min-w-[180px]" size="lg">
            <Phone className="h-4 w-4 mr-2" />
            Request Viewing
          </Button>
        </div>

        <ContactSellerDialog 
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          propertyId={property.id}
          propertyTitle={property.title}
          inquiryType={inquiryType}
        />
        <PropertyChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          propertyId={property.id}
          propertyTitle={property.title}
          sellerId={property.user_id}
        />
      </DialogContent>
    </Dialog>
  );
}
