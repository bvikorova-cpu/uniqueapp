import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, ShoppingCart, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Memory {
  id: string;
  title: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  memory_ids: string[];
  price: number;
  times_purchased: number;
  created_at: string;
}

const MemoryCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [myMemories, setMyMemories] = useState<Memory[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    memory_ids: [] as string[],
    price: 29.99,
  });

  useEffect(() => {
    fetchCollections();
    fetchMyMemories();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("memory_collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      });
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  const fetchMyMemories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("memories")
      .select("id, title")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to fetch memories", error);
    } else {
      setMyMemories(data || []);
    }
  };

  const createCollection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create collections",
        variant: "destructive",
      });
      return;
    }

    if (!newCollection.name || newCollection.memory_ids.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and select at least one memory",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("memory_collections").insert([
      {
        user_id: user.id,
        name: newCollection.name,
        description: newCollection.description,
        memory_ids: newCollection.memory_ids,
        price: newCollection.price,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Collection created successfully",
      });
      setIsCreating(false);
      setNewCollection({
        name: "",
        description: "",
        memory_ids: [],
        price: 29.99,
      });
      fetchCollections();
    }
  };

  const purchaseCollection = async (collection: Collection) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase collections",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("memory_collection_purchases").insert([
      {
        collection_id: collection.id,
        buyer_id: user.id,
        price_paid: collection.price,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to purchase collection",
        variant: "destructive",
      });
    } else {
      await supabase
        .from("memory_collections")
        .update({ times_purchased: collection.times_purchased + 1 })
        .eq("id", collection.id);

      toast({
        title: "Success",
        description: `Collection purchased for ${collection.price.toFixed(2)}€`,
      });
      fetchCollections();
    }
  };

  const toggleMemorySelection = (memoryId: string) => {
    setNewCollection((prev) => ({
      ...prev,
      memory_ids: prev.memory_ids.includes(memoryId)
        ? prev.memory_ids.filter((id) => id !== memoryId)
        : [...prev.memory_ids, memoryId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Memory Collections</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "Create Collection"}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Collection</CardTitle>
            <CardDescription>Bundle your memories together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Collection Name"
              value={newCollection.name}
              onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
            />
            <Textarea
              placeholder="Describe your collection..."
              value={newCollection.description}
              onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
              rows={3}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Memories:</label>
              {myMemories.length === 0 ? (
                <p className="text-sm text-muted-foreground">You don't have any memories yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {myMemories.map((memory) => (
                    <div key={memory.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={newCollection.memory_ids.includes(memory.id)}
                        onCheckedChange={() => toggleMemorySelection(memory.id)}
                      />
                      <label className="text-sm">{memory.title}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="1"
                max="200"
                value={newCollection.price}
                onChange={(e) => setNewCollection({ ...newCollection, price: parseFloat(e.target.value) })}
              />
              <span className="text-muted-foreground">€</span>
            </div>
            <Button onClick={createCollection} className="w-full" disabled={myMemories.length === 0}>
              Create Collection
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading collections...</p>
        ) : collections.length === 0 ? (
          <p className="text-muted-foreground">No collections available yet</p>
        ) : (
          collections.map((collection) => (
            <Dialog key={collection.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {collection.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{collection.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{collection.memory_ids.length} memories</Badge>
                        <div className="text-primary font-semibold">{collection.price.toFixed(2)}€</div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{collection.times_purchased} purchases</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{collection.name}</DialogTitle>
                  <DialogDescription>{collection.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Includes {collection.memory_ids.length} memories</p>
                    <Badge variant="outline">{collection.times_purchased} purchases</Badge>
                  </div>
                  <Button onClick={() => purchaseCollection(collection)} className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase for {collection.price.toFixed(2)}€
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryCollections;
