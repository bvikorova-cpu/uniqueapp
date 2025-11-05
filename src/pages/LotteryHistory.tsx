import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  History,
  Star,
  Search,
  Calendar,
  Trash2,
  ArrowLeft,
  Filter,
  Download,
  Share2,
} from "lucide-react";
import { format } from "date-fns";

const LOTTERY_TYPES = [
  { id: "all", name: "All Types" },
  { id: "eurojackpot", name: "EuroJackpot" },
  { id: "lotto", name: "Lotto 6/49" },
  { id: "powerball", name: "Powerball" },
  { id: "megamillions", name: "Mega Millions" },
];

interface LotteryGeneration {
  id: string;
  lottery_type: string;
  main_numbers: number[];
  bonus_numbers: number[] | null;
  is_favorite: boolean;
  created_at: string;
}

export default function LotteryHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generations, setGenerations] = useState<LotteryGeneration[]>([]);
  const [filteredGenerations, setFilteredGenerations] = useState<LotteryGeneration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterGenerations();
  }, [generations, searchQuery, selectedType, showFavoritesOnly, sortBy]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    await loadGenerations();
    setLoading(false);
  };

  const loadGenerations = async () => {
    try {
      const { data, error } = await supabase
        .from("lottery_generations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error("Error loading generations:", error);
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      });
    }
  };

  const filterGenerations = () => {
    let filtered = [...generations];

    // Filter by lottery type
    if (selectedType !== "all") {
      filtered = filtered.filter((gen) => gen.lottery_type === selectedType);
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter((gen) => gen.is_favorite);
    }

    // Filter by search query (search in numbers)
    if (searchQuery) {
      const searchNumbers = searchQuery.split(",").map((n) => n.trim()).filter(Boolean);
      filtered = filtered.filter((gen) => {
        const allNumbers = [...gen.main_numbers, ...(gen.bonus_numbers || [])].map(String);
        return searchNumbers.every((searchNum) =>
          allNumbers.some((num) => num.includes(searchNum))
        );
      });
    }

    // Sort
    if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredGenerations(filtered);
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("lottery_generations")
        .update({ is_favorite: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setGenerations((prev) =>
        prev.map((gen) =>
          gen.id === id ? { ...gen, is_favorite: !currentStatus } : gen
        )
      );

      toast({
        title: currentStatus ? "Removed from favorites" : "Added to favorites",
        description: currentStatus
          ? "Generation removed from favorites"
          : "Generation marked as favorite",
      });
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this generation?")) return;

    try {
      const { error } = await supabase
        .from("lottery_generations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGenerations((prev) => prev.filter((gen) => gen.id !== id));

      toast({
        title: "Deleted",
        description: "Generation deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting generation:", error);
      toast({
        title: "Error",
        description: "Failed to delete generation",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csv = [
      ["Date", "Lottery Type", "Main Numbers", "Bonus Numbers", "Favorite"],
      ...filteredGenerations.map((gen) => [
        format(new Date(gen.created_at), "PPp"),
        gen.lottery_type,
        gen.main_numbers.join("-"),
        gen.bonus_numbers?.join("-") || "",
        gen.is_favorite ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lottery-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();

    toast({
      title: "Exported",
      description: "History exported to CSV file",
    });
  };

  const getLotteryTypeName = (type: string) => {
    return LOTTERY_TYPES.find((t) => t.id === type)?.name || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-12 px-4 bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/lottery-ai")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generator
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Generation History</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage all your lottery number generations
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-6 px-4 border-b bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by numbers (e.g., 7, 14, 21)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lottery Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERY_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
              Favorites Only
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <div className="ml-auto text-sm text-muted-foreground flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {filteredGenerations.length} of {generations.length} generations
            </div>
          </div>
        </div>
      </section>

      {/* Generations List */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredGenerations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No generations found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedType !== "all" || showFavoritesOnly
                    ? "Try adjusting your filters"
                    : "Start generating lottery numbers to see them here"}
                </p>
                <Button onClick={() => navigate("/lottery-ai")}>
                  Generate Numbers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredGenerations.map((generation) => (
                <Card key={generation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getLotteryTypeName(generation.lottery_type)}
                          {generation.is_favorite && (
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(generation.created_at), "PPp")}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(generation.id, generation.is_favorite)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              generation.is_favorite ? "fill-yellow-500 text-yellow-500" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGeneration(generation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Main Numbers</p>
                        <div className="flex flex-wrap gap-2">
                          {generation.main_numbers.map((num, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-lg font-bold px-4 py-2 bg-primary/10"
                            >
                              {num}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {generation.bonus_numbers && generation.bonus_numbers.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Bonus Numbers</p>
                          <div className="flex flex-wrap gap-2">
                            {generation.bonus_numbers.map((num, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-lg font-bold px-4 py-2 bg-secondary/10"
                              >
                                {num}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
