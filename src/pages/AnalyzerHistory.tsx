import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Heart, Eye, Filter, Search, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AnalysisHistoryItem {
  id: string; image_url: string; category: string; main_identification: string;
  confidence_score: number; is_favorite: boolean; created_at: string; tags: string[];
}

export default function AnalyzerHistory() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase.from('vision_analyses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) { toast.error("Failed to load history"); }
    finally { setIsLoading(false); }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase.from('vision_analyses').delete().eq('id', id);
      if (error) throw error;
      setAnalyses(analyses.filter(a => a.id !== id));
      toast.success("Analysis deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from('vision_analyses').update({ is_favorite: !currentState }).eq('id', id);
      if (error) throw error;
      setAnalyses(analyses.map(a => a.id === id ? { ...a, is_favorite: !currentState } : a));
    } catch { toast.error("Failed to update"); }
  };

  const filteredAnalyses = analyses.filter(a => {
    if (favoritesOnly && !a.is_favorite) return false;
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (searchQuery && !a.main_identification.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(analyses.map(a => a.category)));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <FloatingHowItWorks
        title="Analyzer History"
        intro="Every analysis you've run, in one place."
        steps={[
          { title: "Browse chronologically", desc: "Newest first with thumbnails." },
          { title: "Reopen a report", desc: "See the full breakdown again." },
          { title: "Filter", desc: "By type \u2014 product, health, doc, etc." },
          { title: "Move to collection", desc: "Organize into folders." },
          { title: "Delete", desc: "Remove sensitive analyses anytime." }
        ]}
      />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/analyzer')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <Scan className="w-6 h-6 text-cyan-400" /> Analysis History
              </h1>
              <p className="text-muted-foreground text-sm">
                {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
          </div>
        </div>

        <Card className="p-4 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <Input placeholder="Search analyses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 border-cyan-500/20" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 border-cyan-500/20">
                <Filter className="w-4 h-4 mr-2 text-cyan-400" /><SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant={favoritesOnly ? "default" : "outline"} onClick={() => setFavoritesOnly(!favoritesOnly)} className="border-cyan-500/20">
              <Heart className={`w-4 h-4 mr-2 ${favoritesOnly ? 'fill-current' : ''}`} /> Favorites
            </Button>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <Card className="p-12 text-center border-cyan-500/20">
            <Scan className="w-16 h-16 mx-auto text-cyan-400/50 mb-4" />
            <p className="text-muted-foreground mb-4">No analyses found</p>
            <Button onClick={() => navigate('/analyzer')} className="bg-gradient-to-r from-cyan-600 to-blue-600">Start Analyzing</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis, i) => (
              <motion.div key={analysis.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-lg hover:shadow-cyan-500/10 transition-all border-cyan-500/10 hover:border-cyan-500/30">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img src={analysis.image_url} alt={analysis.main_identification}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate(`/analyzer/result/${analysis.id}`)} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold truncate">{analysis.main_identification}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="capitalize bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">{analysis.category}</Badge>
                        {analysis.confidence_score && (
                          <Badge variant="outline" className="text-xs border-cyan-500/20">{Math.round(analysis.confidence_score * 100)}%</Badge>
                        )}
                      </div>
                    </div>
                    {analysis.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {analysis.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] bg-cyan-500/5">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">{new Date(analysis.created_at).toLocaleDateString()}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-cyan-500/20" onClick={() => navigate(`/analyzer/result/${analysis.id}`)}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500/20" onClick={() => toggleFavorite(analysis.id, analysis.is_favorite)}>
                        <Heart className={`w-4 h-4 ${analysis.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500/20" onClick={() => deleteAnalysis(analysis.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
