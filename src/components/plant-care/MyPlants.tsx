import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const MyPlants = () => {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (error: any) {
      console.error('Error fetching plants:', error);
      toast({
        title: "Error",
        description: "Failed to load your plants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Plant Removed",
        description: "Plant has been removed from your garden",
      });

      fetchPlants();
    } catch (error: any) {
      console.error('Error deleting plant:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"My Plants - How it works"} steps={[{ title: 'Open', desc: 'Access the My Plants section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Plants.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-6">
        <p className="text-center">Loading your plants...</p>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            My Garden ({plants.length})
          </h2>
        </div>

        {plants.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Leaf className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No plants in your garden yet</p>
            <p className="text-sm">Identify plants to add them here</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.map((plant) => (
              <Card key={plant.id} className="overflow-hidden">
                {plant.image_url && (
                  <img 
                    src={plant.image_url} 
                    alt={plant.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{plant.name}</h3>
                  {plant.scientific_name && (
                    <p className="text-sm italic text-muted-foreground mb-2">
                      {plant.scientific_name}
                    </p>
                  )}
                  {plant.plant_type && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold">Type:</span> {plant.plant_type}
                    </p>
                  )}
                  {plant.location && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold">Location:</span> {plant.location}
                    </p>
                  )}
                  {plant.notes && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {plant.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    Added: {format(new Date(plant.created_at), 'MMM d, yyyy')}
                  </p>
                  <Button
                    onClick={() => handleDelete(plant.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};