import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, BedDouble, Eye, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyExpirationBadge } from "./PropertyExpirationBadge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  city: string;
  area_sqm: number;
  rooms: number | null;
  bedrooms: number | null;
  property_type: string;
  is_featured: boolean;
  views_count: number;
  status: string;
  listing_expires_at: string | null;
  property_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface PropertyCardProps {
  property: Property;
  onViewDetails: (id: string) => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const primaryImage = property.property_images?.find(img => img.is_primary)?.image_url
    || property.property_images?.[0]?.image_url
    || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';

  useEffect(() => {
    if (!user) return;
    supabase
      .from("property_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", property.id)
      .maybeSingle()
      .then(({ data }) => setFavorited(!!data));
  }, [user, property.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to save properties");
      return;
    }
    setFavLoading(true);
    try {
      if (favorited) {
        await supabase.from("property_favorites").delete().eq("user_id", user.id).eq("property_id", property.id);
        setFavorited(false);
        toast.success("Removed from favorites");
      } else {
        await supabase.from("property_favorites").insert({ user_id: user.id, property_id: property.id });
        setFavorited(true);
        toast.success("Added to favorites");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setFavLoading(false);
    }
  };

  const handleView = async () => {
    try {
      const { data: currentProperty } = await supabase
        .from('properties')
        .select('views_count')
        .eq('id', property.id)
        .single();
      if (currentProperty) {
        await supabase
          .from('properties')
          .update({ views_count: (currentProperty.views_count || 0) + 1 })
          .eq('id', property.id);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
    onViewDetails(property.id);
  };

  return (
    <>
      <FloatingHowItWorks title={"Property Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {property.is_featured && (
        <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-purple-600">
          Featured
        </Badge>
      )}
      
      <div className="relative h-48 overflow-hidden">
        <img 
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-white text-sm">
          <Eye className="h-3 w-3" />
          <span>{property.views_count}</span>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{property.property_type}</Badge>
          <div className="flex gap-2 items-center">
            <PropertyExpirationBadge 
              expiresAt={property.listing_expires_at} 
              status={property.status}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFavorite} disabled={favLoading} aria-label={favorited ? "Remove from favorites" : "Add to favorites"}>
              <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
        <CardTitle className="text-xl">{property.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {property.city}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Maximize2 className="h-4 w-4" />
            <span>{property.area_sqm} m²</span>
          </div>
          {property.rooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              <span>{property.rooms} rooms</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <div className="text-2xl font-bold text-primary">
              €{property.price.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              €{Math.round(property.price / property.area_sqm)}/m²
            </div>
          </div>
          <Button onClick={handleView}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
