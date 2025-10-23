import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Phone, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Business {
  id: string;
  name: string;
  description?: string;
  address: string;
  category: string;
  logo_url?: string;
  cover_image_url?: string;
  total_rating: number;
  review_count: number;
  is_open_now: boolean;
  phone?: string;
  whatsapp?: string;
}

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: business.cover_image_url
            ? `url(${business.cover_image_url})`
            : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
        }}
      >
        {business.logo_url && (
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-background border-2 border-background shadow-lg overflow-hidden">
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {business.is_open_now && (
          <Badge className="absolute top-4 right-4 bg-green-500">
            <Clock className="h-3 w-3 mr-1" />
            Open Now
          </Badge>
        )}
      </div>

      <CardHeader onClick={() => navigate(`/minibiz/${business.id}`)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="group-hover:text-primary transition-colors">
              {business.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {business.address}
            </CardDescription>
          </div>
          <Badge variant="outline">{business.category}</Badge>
        </div>
      </CardHeader>

      <CardContent onClick={() => navigate(`/minibiz/${business.id}`)}>
        {business.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {business.total_rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({business.review_count} reviews)
            </span>
          </div>

          <div className="flex gap-2">
            {business.phone && (
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${business.phone}`;
              }}>
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {business.whatsapp && (
              <Button size="sm" variant="outline" onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${business.whatsapp}`, '_blank');
              }}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
