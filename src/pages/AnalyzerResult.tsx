import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    shopping?: {
      links: string[];
      alternatives: string[];
    };
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

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('vision_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnalysis(data as unknown as AnalysisData);
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error("Failed to load analysis");
      navigate('/analyzer');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!analysis) return;
    
    try {
      const { error } = await supabase
        .from('vision_analyses')
        .update({ is_favorite: !analysis.is_favorite })
        .eq('id', analysis.id);

      if (error) throw error;
      
      setAnalysis({ ...analysis, is_favorite: !analysis.is_favorite });
      toast.success(analysis.is_favorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorite");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const info = analysis.detailed_info;
  const confidencePercent = Math.round((info.confidence || 0) * 100);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analyzer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleFavorite}>
              <Heart className={`w-4 h-4 ${analysis.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image */}
          <Card className="p-6">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              <img
                src={analysis.image_url}
                alt={analysis.main_identification}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </Card>

          {/* Analysis Results */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold">{info.mainIdentification}</h1>
                    <Badge variant={confidencePercent > 80 ? "default" : "secondary"}>
                      {confidencePercent}% confident
                    </Badge>
                  </div>
                  <Badge className="capitalize">{analysis.category}</Badge>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground">{info.details.description}</p>
                </div>

                {info.details.specifications?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Specifications</h2>
                      <ul className="list-disc list-inside space-y-1">
                        {info.details.specifications.map((spec, index) => (
                          <li key={index} className="text-muted-foreground">{spec}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {info.details.careInstructions && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Care Instructions</h2>
                      <p className="text-muted-foreground">{info.details.careInstructions}</p>
                    </div>
                  </>
                )}

                {info.details.safety && (
                  <>
                    <Separator />
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <h2 className="text-xl font-semibold mb-2 text-yellow-600">Safety Information</h2>
                      <p className="text-muted-foreground">{info.details.safety}</p>
                    </div>
                  </>
                )}

                {info.details.value && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Estimated Value</h2>
                      <p className="text-muted-foreground">{info.details.value}</p>
                    </div>
                  </>
                )}

                {info.details.whereToFind && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Where to Find</h2>
                      <p className="text-muted-foreground">{info.details.whereToFind}</p>
                      {info.shopping?.links && info.shopping.links.length > 0 && (
                        <Button className="mt-2" variant="outline">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Shop Similar Items
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {info.additionalInfo && info.additionalInfo !== info.details.description && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Additional Information</h2>
                      <p className="text-muted-foreground">{info.additionalInfo}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* AI Chat Follow-up */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Ask Follow-up Questions</h2>
                <Badge variant="secondary">Pro Feature</Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Upgrade to Pro to chat with AI about this analysis and get detailed answers to your questions.
              </p>
              <Button onClick={() => navigate('/analyzer/pricing')}>
                Upgrade to Pro
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
