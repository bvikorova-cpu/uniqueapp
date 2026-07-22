import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { History,
  Star,
  Search,
  Calendar,
  Trash2,
  ArrowLeft,
  Filter,
  Download,
  Sparkles } from "lucide-react";
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

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { filterGenerations(); }, [generations, searchQuery, selectedType, showFavoritesOnly, sortBy]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { navigate("/auth"); return; }
    setUser(session.user);
    await loadGenerations();
    setLoading(false);
  };

  const loadGenerations = async () => {
    try {
      const { data, error } = await supabase.from("lottery_generations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error("Error loading generations:", error);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    }
  };

  const filterGenerations = () => {
    let filtered = [...generations];
    if (selectedType !== "all") filtered = filtered.filter((gen) => gen.lottery_type === selectedType);
    if (showFavoritesOnly) filtered = filtered.filter((gen) => gen.is_favorite);
    if (searchQuery) {
      const searchNumbers = searchQuery.split(",").map((n) => n.trim()).filter(Boolean);
      filtered = filtered.filter((gen) => {
        const allNumbers = [...gen.main_numbers, ...(gen.bonus_numbers || [])].map(String);
        return searchNumbers.every((searchNum) => allNumbers.some((num) => num.includes(searchNum)));
      });
    }
    if (sortBy === "oldest") filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFilteredGenerations(filtered);
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("lottery_generations").update({ is_favorite: !currentStatus }).eq("id", id);
      if (error) throw error;
      setGenerations((prev) => prev.map((gen) => gen.id === id ? { ...gen, is_favorite: !currentStatus } : gen));
      toast({ title: currentStatus ? "Removed from favorites" : "Added to favorites" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update favorite status", variant: "destructive" });
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this generation?")) return;
    try {
      const { error } = await supabase.from("lottery_generations").delete().eq("id", id);
      if (error) throw error;
      setGenerations((prev) => prev.filter((gen) => gen.id !== id));
      toast({ title: "Deleted", description: "Generation deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete generation", variant: "destructive" });
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
    ].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lottery-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast({ title: "Exported", description: "History exported to CSV file" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative pt-20 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <Button variant="ghost" onClick={() => navigate("/lottery-ai")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generator
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
              <History className="w-4 h-4" />
              <span className="font-medium">Generation History</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Your Number History
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              View, manage, and export all your AI-generated lottery number combinations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-6 px-4 border-b border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by numbers (e.g., 7, 14, 21)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/80 backdrop-blur-sm border-border/50"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-card/80 backdrop-blur-sm border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERY_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-card/80 backdrop-blur-sm border-border/50">
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
              className={!showFavoritesOnly ? "border-border/50" : "bg-gradient-to-r from-primary to-accent text-primary-foreground"}
            >
              <Star className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
              Favorites Only
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="border-border/50">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                <CardContent className="py-12 text-center">
                  <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-black mb-2">No generations found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedType !== "all" || showFavoritesOnly
                      ? "Try adjusting your filters"
                      : "Start generating lottery numbers to see them here"}
                  </p>
                  <Button onClick={() => navigate("/lottery-ai")} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Numbers
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredGenerations.map((generation, i) => (
                <motion.div
                  key={generation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 font-black">
                            {generation.lottery_type}
                            {generation.is_favorite && (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(generation.created_at), "PPp")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(generation.id, generation.is_favorite)} className="h-8 w-8">
                            <Star className={`h-4 w-4 ${generation.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteGeneration(generation.id)} className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-2">Main Numbers</p>
                          <div className="flex flex-wrap gap-2">
                            {generation.main_numbers.map((num, idx) => (
                              <div key={idx} className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-black text-primary-foreground shadow-md shadow-primary/20">
                                {num}
                              </div>
                            ))}
                          </div>
                        </div>
                        {generation.bonus_numbers && generation.bonus_numbers.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-muted-foreground mb-2">Bonus Numbers</p>
                            <div className="flex flex-wrap gap-2">
                              {generation.bonus_numbers.map((num, idx) => (
                                <div key={idx} className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-sm font-black text-white shadow-md shadow-orange-500/20">
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
