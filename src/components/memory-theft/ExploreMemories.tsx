import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, DollarSign, Star, Eye, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Memory {
  id: string;
  title: string;
  description: string;
  content: any;
  category: string;
  price: number;
  is_verified: boolean;
  times_stolen: number;
  rating: number;
  created_at: string;
}

const ExploreMemories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    filterMemories();
  }, [memories, searchQuery, categoryFilter]);

  const fetchMemories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch memories",
        variant: "destructive",
      });
    } else {
      setMemories(data || []);
    }
    setLoading(false);
  };

  const filterMemories = () => {
    let filtered = memories;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((m) => m.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMemories(filtered);
  };

  const stealMemory = async (memory: Memory) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to steal memories",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("memory_purchases").insert([
      {
        memory_id: memory.id,
        buyer_id: user.id,
        price_paid: memory.price,
        rating,
        review,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to steal memory",
        variant: "destructive",
      });
    } else {
      // Update times_stolen
      await supabase
        .from("memories")
        .update({ times_stolen: memory.times_stolen + 1 })
        .eq("id", memory.id);

      toast({
        title: "Success",
        description: `Memory stolen for ${memory.price.toFixed(2)}€`,
      });
      setSelectedMemory(null);
      setRating(5);
      setReview("");
      fetchMemories();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="love">Love</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading memories...</p>
        ) : filteredMemories.length === 0 ? (
          <p className="text-muted-foreground">No memories found</p>
        ) : (
          filteredMemories.map((memory) => (
            <Dialog key={memory.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{memory.title}</CardTitle>
                        <CardDescription className="mt-1">{memory.description}</CardDescription>
                      </div>
                      {memory.is_verified && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{memory.category}</Badge>
                        <div className="flex items-center gap-1 text-primary font-semibold">
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
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {memory.title}
                    {memory.is_verified && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>{memory.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Memory Content:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {memory.content.text}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{memory.category}</Badge>
                    <div className="flex items-center gap-1 text-lg font-bold text-primary">
                      <DollarSign className="h-5 w-5" />
                      <span>{memory.price.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate this memory (1-5 stars):</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leave a review (optional):</label>
                    <Textarea
                      placeholder="Share your thoughts about this memory..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={() => stealMemory(memory)} className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Steal This Memory for {memory.price.toFixed(2)}€
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

export default ExploreMemories;
