import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Heart, Eye, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalysisHistoryItem {
  id: string;
  image_url: string;
  category: string;
  main_identification: string;
  confidence_score: number;
  is_favorite: boolean;
  created_at: string;
  tags: string[];
}

export default function AnalyzerHistory() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('vision_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vision_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAnalyses(analyses.filter(a => a.id !== id));
      toast.success("Analysis deleted");
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error("Failed to delete analysis");
    }
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('vision_analyses')
        .update({ is_favorite: !currentState })
        .eq('id', id);

      if (error) throw error;
      
      setAnalyses(analyses.map(a => 
        a.id === id ? { ...a, is_favorite: !currentState } : a
      ));
      toast.success(currentState ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorite");
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (favoritesOnly && !analysis.is_favorite) return false;
    if (categoryFilter !== "all" && analysis.category !== categoryFilter) return false;
    if (searchQuery && !analysis.main_identification.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const categories = Array.from(new Set(analyses.map(a => a.category)));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/analyzer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Analysis History</h1>
              <p className="text-muted-foreground">
                {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={favoritesOnly ? "default" : "outline"}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Heart className={`w-4 h-4 mr-2 ${favoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>
          </div>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No analyses found</p>
            <Button onClick={() => navigate('/analyzer')}>
              Start Analyzing
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => (
              <Card key={analysis.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                    src={analysis.image_url}
                    alt={analysis.main_identification}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => navigate(`/analyzer/result/${analysis.id}`)}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {analysis.main_identification}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {analysis.category}
                        </Badge>
                        {analysis.confidence_score && (
                          <Badge variant="outline">
                            {Math.round(analysis.confidence_score * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {analysis.tags && analysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {analysis.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/analyzer/result/${analysis.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavorite(analysis.id, analysis.is_favorite)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          analysis.is_favorite ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAnalysis(analysis.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
