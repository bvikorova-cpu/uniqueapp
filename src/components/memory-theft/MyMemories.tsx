import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Eye, DollarSign, Star } from "lucide-react";

interface Memory {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  is_verified: boolean;
  times_stolen: number;
  rating: number;
  created_at: string;
}

const MyMemories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    content: { text: "", audio_url: "", visual_urls: [] },
    category: "adventure",
    price: 5.99,
  });

  useEffect(() => {
    fetchMyMemories();
  }, []);

  const fetchMyMemories = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your memories",
        variant: "destructive",
      });
    } else {
      setMemories(data || []);
    }
    setLoading(false);
  };

  const createMemory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create memories",
        variant: "destructive",
      });
      return;
    }

    if (!newMemory.title || !newMemory.description || !newMemory.content.text) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("memories").insert([
      {
        user_id: user.id,
        title: newMemory.title,
        description: newMemory.description,
        content: newMemory.content,
        category: newMemory.category,
        price: newMemory.price,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create memory",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Memory created successfully",
      });
      setIsCreating(false);
      setNewMemory({
        title: "",
        description: "",
        content: { text: "", audio_url: "", visual_urls: [] },
        category: "adventure",
        price: 5.99,
      });
      fetchMyMemories();
    }
  };

  const deleteMemory = async (id: string) => {
    const { error } = await supabase.from("memories").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Memory deleted successfully",
      });
      fetchMyMemories();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Memories</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Upload className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "Upload Memory"}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Memory</CardTitle>
            <CardDescription>Share your experience with the world</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Memory Title"
              value={newMemory.title}
              onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            />
            <Textarea
              placeholder="Describe your memory..."
              value={newMemory.description}
              onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
              rows={3}
            />
            <Textarea
              placeholder="Full memory content (the experience you're sharing)..."
              value={newMemory.content.text}
              onChange={(e) =>
                setNewMemory({
                  ...newMemory,
                  content: { ...newMemory.content, text: e.target.value },
                })
              }
              rows={6}
            />
            <Select
              value={newMemory.category}
              onValueChange={(value) => setNewMemory({ ...newMemory, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="love">Love</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="1"
                max="50"
                value={newMemory.price}
                onChange={(e) => setNewMemory({ ...newMemory, price: parseFloat(e.target.value) })}
              />
              <span className="text-muted-foreground">€ (You'll get 70%)</span>
            </div>
            <Button onClick={createMemory} className="w-full">
              Create Memory
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading your memories...</p>
        ) : memories.length === 0 ? (
          <p className="text-muted-foreground">No memories yet. Upload your first one!</p>
        ) : (
          memories.map((memory) => (
            <Card key={memory.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{memory.title}</CardTitle>
                    <CardDescription className="mt-1">{memory.description}</CardDescription>
                  </div>
                  {memory.is_verified && (
                    <Badge variant="default">Verified</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{memory.category}</Badge>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{memory.price.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{memory.times_stolen} steals</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{memory.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyMemories;
