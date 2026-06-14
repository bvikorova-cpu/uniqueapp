import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BazaarItem {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  is_sold: boolean;
  image_url: string | null;
  created_at: string;
}

interface MyBazaarListingsProps {
  userId: string;
  isOwnProfile: boolean;
}

export const MyBazaarListings = ({ userId, isOwnProfile }: MyBazaarListingsProps) => {
  const [items, setItems] = useState<BazaarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, [userId]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("bazaar_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading bazaar items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("bazaar_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item deleted successfully");
      loadItems();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No listings yet</p>
        {isOwnProfile && (
          <Button onClick={() => navigate("/bazaar?action=create")}>
            Create Your First Listing
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isOwnProfile && (
        <div className="flex justify-end">
          <Button onClick={() => navigate("/bazaar?action=create")}>
            + New Listing
          </Button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-lg font-bold text-primary">€{item.price}</p>
                  </div>
                  <Badge variant={item.is_sold ? "secondary" : "default"}>
                    {item.is_sold ? "Sold" : "Active"}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  <Badge variant="outline" className="text-xs">{item.condition}</Badge>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/bazaar/${item.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/bazaar/${item.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
