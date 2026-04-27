import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Heart, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface AnalysisData {
  id: string;
  image_url: string;
  category: string;
  main_identification: string;
  confidence_score: number;
  detailed_info: {
    mainIdentification: string;
    confidence: number;
    category: string;
    details: {
      description: string;
      specifications: string[];
      careInstructions: string;
      safety: string;
      value: string;
      whereToFind: string;
    };
    tags: string[];
    additionalInfo: string;
    shopping?: { links: string[]; alternatives: string[] };
  };
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export default function AnalyzerResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAnalysis(); }, [id]);

  const loadAnalysis = async () => {
    try {
      const { data, error } = await supabase.from('vision_analyses').select('*').eq('id', id).single();
      if (error) throw error;
      setAnalysis(data as unknown as AnalysisData);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load analysis");
      navigate('/analyzer');
    } finally { setIsLoading(false); }
  };

  const toggleFavorite = async () => {
    if (!analysis) return;
    try {
      const { error } = await supabase.from('vision_analyses').update({ is_favorite: !analysis.is_favorite }).eq('id', analysis.id);
      if (error) throw error;
      setAnalysis({ ...analysis, is_favorite: !analysis.is_favorite });
      toast.success(analysis.is_favorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) { toast.error("Failed to update favorite"); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (!analysis) return null;
  const info = analysis.detailed_info;
  const confidencePercent = Math.round((info.confidence || 0) * 100);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyzer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleFavorite} className="border-cyan-500/20">
              <Heart className={`w-4 h-4 ${analysis.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" className="border-cyan-500/20" onClick={() => toast.info("This action — coming soon")}><Share2 className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="border-cyan-500/20" onClick={() => toast.info("This action — coming soon")}><Download className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-6 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 border border-cyan-500/10">
                <img src={analysis.image_url} alt={analysis.main_identification} className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{tag}</Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card className="p-6 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl sm:text-3xl font-black">{info.mainIdentification}</h1>
                    <Badge className={confidencePercent > 80 ? "bg-cyan-500/20 text-cyan-400" : ""}>
                      {confidencePercent}% confident
                    </Badge>
                  </div>
                  <Badge className="capitalize bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{analysis.category}</Badge>
                </div>
                <Separator className="bg-cyan-500/20" />
                <div>
                  <h2 className="text-lg font-bold mb-2 text-cyan-400">Description</h2>
                  <p className="text-muted-foreground text-sm">{info.details.description}</p>
                </div>
                {info.details.specifications?.length > 0 && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-cyan-400">Specifications</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {info.details.specifications.map((spec, i) => <li key={i} className="text-muted-foreground text-sm">{spec}</li>)}
                    </ul>
                  </div>
                </>)}
                {info.details.careInstructions && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-cyan-400">Care Instructions</h2>
                    <p className="text-muted-foreground text-sm">{info.details.careInstructions}</p>
                  </div>
                </>)}
                {info.details.safety && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h2 className="text-lg font-bold mb-2 text-red-400">⚠️ Safety Information</h2>
                    <p className="text-muted-foreground text-sm">{info.details.safety}</p>
                  </div>
                </>)}
                {info.details.value && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-emerald-400">Estimated Value</h2>
                    <p className="text-muted-foreground text-sm">{info.details.value}</p>
                  </div>
                </>)}
                {info.details.whereToFind && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-blue-400">Where to Find</h2>
                    <p className="text-muted-foreground text-sm">{info.details.whereToFind}</p>
                    {info.shopping?.links?.length ? (
                      <Button className="mt-2 bg-gradient-to-r from-cyan-600 to-blue-600" variant="default" onClick={() => toast.info("Shop Similar Items — coming soon")}>
                        <ShoppingBag className="w-4 h-4 mr-2" /> Shop Similar Items
                      </Button>
                    ) : null}
                  </div>
                </>)}
                {info.additionalInfo && info.additionalInfo !== info.details.description && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-cyan-400">Additional Information</h2>
                    <p className="text-muted-foreground text-sm">{info.additionalInfo}</p>
                  </div>
                </>)}
              </div>
            </Card>

            <Card className="p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-background">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Ask Follow-up Questions</h2>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Pro Feature</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Upgrade to Pro to chat with AI about this analysis.
              </p>
              <Button onClick={() => navigate('/analyzer/pricing')} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                <Sparkles className="w-4 h-4 mr-2" /> Upgrade to Pro
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
