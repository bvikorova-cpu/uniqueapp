import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyDetailDialog } from "@/components/property/PropertyDetailDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, ArrowLeft } from "lucide-react";

export default function PropertyFavorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("property_favorites")
        .select("property_id, created_at, properties:property_id(*, property_images(image_url, is_primary))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data || []).map((r: any) => r.properties).filter(Boolean));
      setLoading(false);
    })();
  }, [user]);

  const view = async (id: string) => {
    const { data } = await supabase
      .from("properties")
      .select("*, property_images(image_url, is_primary), property_videos(video_url)")
      .eq("id", id)
      .single();
    setSelected(data);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24">
        <Button variant="ghost" size="sm" onClick={() => navigate("/property-marketplace")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to marketplace
        </Button>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <Heart className="h-7 w-7 text-red-500 fill-red-500" /> My Favorite Properties
        </h1>
        <p className="text-muted-foreground mb-8">Quickly revisit the listings you saved.</p>

        {!user ? (
          <Card className="p-12 text-center">
            <p>Please sign in to view your favorites.</p>
            <Button className="mt-4" onClick={() => navigate("/auth")}>Sign in</Button>
          </Card>
        ) : loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg">No favorites yet</p>
            <p className="text-sm text-muted-foreground mb-4">Tap the heart on any listing to save it here.</p>
            <Button onClick={() => navigate("/property-marketplace")}>Browse properties</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => <PropertyCard key={p.id} property={p} onViewDetails={view} />)}
          </div>
        )}

        <PropertyDetailDialog property={selected} open={open} onOpenChange={setOpen} />
      </div>
    </div>
  );
}
