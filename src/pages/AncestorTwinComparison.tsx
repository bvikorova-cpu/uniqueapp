import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FacialFeatureOverlay } from "@/components/ancestor-twin/FacialFeatureOverlay";
import { SimilarityHeatmap } from "@/components/ancestor-twin/SimilarityHeatmap";

interface HistoricalMatch {
  name: string;
  era: string;
  similarity: number;
  bio?: string;
  imageUrl?: string;
  reason?: string;
}

interface MatchRecord {
  id: string;
  tier: string;
  user_image_url: string;
  matches: HistoricalMatch[];
  created_at: string;
}

export default function AncestorTwinComparison() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('id');
  const matchIndex = parseInt(searchParams.get('index') || '0');
  
  const [matchRecord, setMatchRecord] = useState<MatchRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchMatchRecord(matchId);
    } else {
      navigate('/ancestor-twin/history');
    }
  }, [matchId]);

  const fetchMatchRecord = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('historical_matches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setMatchRecord(data as unknown as MatchRecord);
    } catch (error: any) {
      console.error('Error fetching match:', error);
      toast.error("Failed to load comparison");
      navigate('/ancestor-twin/history');
    } finally {
      setLoading(false);
    }
  };

  const shareComparison = async () => {
    if (!matchRecord) return;
    
    const url = `${window.location.origin}/ancestor-twin/comparison?id=${matchRecord.id}&index=${matchIndex}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Historical Twin Comparison',
          text: `Check out my detailed comparison with ${currentMatch?.name}!`,
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (!matchRecord || !matchRecord.matches[matchIndex]) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Match not found</p>
          <Button onClick={() => navigate('/ancestor-twin/history')} className="mt-4">
            Go to History
          </Button>
        </div>
      </div>
    );
  }

  const currentMatch = matchRecord.matches[matchIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ancestor-twin/history')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          
          <Button onClick={shareComparison} variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share Comparison
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Detailed Comparison</h1>
          <p className="text-xl text-muted-foreground">
            You & {currentMatch.name}
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
              {currentMatch.similarity}% Similarity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Photo</CardTitle>
              <CardDescription>With facial feature analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <FacialFeatureOverlay 
                imageUrl={matchRecord.user_image_url} 
                similarity={currentMatch.similarity}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{currentMatch.name}</CardTitle>
              <CardDescription>{currentMatch.era}</CardDescription>
            </CardHeader>
            <CardContent>
              <FacialFeatureOverlay 
                imageUrl={currentMatch.imageUrl || '/placeholder.svg'} 
                similarity={currentMatch.similarity}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Similarity Heatmap</CardTitle>
            <CardDescription>Facial regions with highest similarity</CardDescription>
          </CardHeader>
          <CardContent>
            <SimilarityHeatmap 
              userImageUrl={matchRecord.user_image_url}
              matchImageUrl={currentMatch.imageUrl || '/placeholder.svg'}
              similarity={currentMatch.similarity}
            />
          </CardContent>
        </Card>

        {currentMatch.reason && (
          <Card>
            <CardHeader>
              <CardTitle>Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">{currentMatch.reason}</p>
            </CardContent>
          </Card>
        )}

        {currentMatch.bio && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>About {currentMatch.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed">{currentMatch.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
