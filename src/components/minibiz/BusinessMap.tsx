import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface Business {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface BusinessMapProps {
  businesses: Business[];
}

export default function BusinessMap({ businesses }: BusinessMapProps) {
  const businessesWithLocation = businesses.filter(
    (b) => b.latitude && b.longitude
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="bg-muted rounded-lg h-[600px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="text-center z-10">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interactive Map Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              {businessesWithLocation.length} businesses with location data
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              {businessesWithLocation.slice(0, 5).map((business) => (
                <div key={business.id} className="flex items-center gap-2 justify-center">
                  <MapPin className="h-3 w-3" />
                  <span>{business.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
