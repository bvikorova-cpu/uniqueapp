import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, Eye, Calendar, Loader2, Plus } from "lucide-react";
import { VirtualTourUploader } from "./VirtualTourUploader";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  status: string;
  views_count: number;
  virtual_tour_url: string | null;
  listing_expires_at: string | null;
  property_images: Array<{
    image_url: string;
  }>;
}

export function PropertyDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to view your properties.",
        });
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          city,
          status,
          views_count,
          virtual_tour_url,
          listing_expires_at,
          property_images (image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load properties.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVirtualTour = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setUploaderOpen(true);
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Property Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </>
  );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Properties Yet</CardTitle>
          <CardDescription>
            You haven't listed any properties yet. Create your first listing to get started!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={property.property_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge 
                className="absolute top-2 right-2"
                variant={property.status === 'active' ? 'default' : 'secondary'}
              >
                {property.status}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{property.title}</CardTitle>
              <CardDescription>{property.city}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {property.views_count} views
                </div>
                <div className="font-bold text-primary">
                  €{property.price.toLocaleString()}
                </div>
              </div>

              {property.listing_expires_at && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Expires: {new Date(property.listing_expires_at).toLocaleDateString()}
                </div>
              )}

              {property.virtual_tour_url ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Video className="h-4 w-4" />
                  Virtual tour active
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddVirtualTour(property.id)}
                  disabled={property.status !== 'active'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Virtual Tour
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProperty && (
        <VirtualTourUploader
          open={uploaderOpen}
          onOpenChange={setUploaderOpen}
          propertyId={selectedProperty}
          onSuccess={loadProperties}
        />
      )}
    </>
  );
}
