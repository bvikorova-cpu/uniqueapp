import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Star, ThumbsUp, ThumbsDown, Loader2, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { toast } from "sonner";

const CREDITS_COST = 4;

interface Props { onBack: () => void; }

const mockReviews = [
  { id: 1, course: "Web Dev Bootcamp", author: "John D.", rating: 5, text: "Absolutely fantastic course! The projects were real-world and the instructor explained everything clearly.", sentiment: "positive", date: "Apr 2, 2026", helpful: 42 },
  { id: 2, course: "ML Fundamentals", author: "Sarah K.", rating: 4, text: "Great content but could use more practical examples in the later modules.", sentiment: "positive", date: "Apr 1, 2026", helpful: 28 },
  { id: 3, course: "Digital Marketing", author: "Mike R.", rating: 3, text: "Decent overview but felt outdated in some areas. The SEO section needs updating.", sentiment: "neutral", date: "Mar 28, 2026", helpful: 15 },
  { id: 4, course: "Python Advanced", author: "Emily T.", rating: 5, text: "Best Python course I've taken. The decorator and metaclass sections were mind-blowing.", sentiment: "positive", date: "Mar 25, 2026", helpful: 56 },
  { id: 5, course: "UX Design", author: "Alex W.", rating: 2, text: "Too theoretical, not enough hands-on projects. Expected more Figma tutorials.", sentiment: "negative", date: "Mar 22, 2026", helpful: 8 },
];

export function CourseReviewSystemView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentReport, setSentimentReport] = useState<string | null>(null);
  const [newReview, setNewReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const analyzeSentiment = async () => {
    setAnalyzing(true);
    try {
      const allReviews = mockReviews.map(r => `${r.rating}/5 - ${r.text}`).join("\n");
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'analyze-reviews', reviews: allReviews }
      });
      if (error) throw error;
      setSentimentReport(data.result);
      toast({ title: "Analysis Complete!", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (s: string) => {
    if (s === "positive") return "bg-emerald-500/10 text-emerald-600";
    if (s === "negative") return "bg-red-500/10 text-red-600";
    return "bg-amber-500/10 text-amber-600";
  };

  const submitReview = () => {
    if (!reviewText.trim()) { toast({ title: "Empty Review", variant: "destructive" }); return; }
    toast({ title: "Review Submitted!", description: "Thank you for your feedback" });
    setNewReview(false);
    setReviewText("");
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Course Reviews</h2>
            <p className="text-sm text-muted-foreground">{mockReviews.length} reviews with AI sentiment analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyzeSentiment} disabled={analyzing}>
            {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Analysis (4 CR)
          </Button>
          <Button onClick={() => setNewReview(!newReview)} className="bg-gradient-to-r from-amber-500 to-yellow-600">
            <Star className="w-4 h-4 mr-2" />Write Review
          </Button>
        </div>
      </div>

      {sentimentReport && (
        <Card className="mb-6 border-emerald-500/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-lg">AI Sentiment Analysis Report</h3>
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{sentimentReport}</div>
          </CardContent>
        </Card>
      )}

      {newReview && (
        <Card className="mb-6 border-amber-500/20">
          <CardContent className="pt-6 space-y-3">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                    <Star className={`w-7 h-7 transition-colors ${s <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <Textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." rows={4} />
            <div className="flex gap-2">
              <Button onClick={submitReview} className="bg-gradient-to-r from-amber-500 to-yellow-600">Submit Review</Button>
              <Button variant="outline" onClick={() => setNewReview(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {mockReviews.map(review => (
          <Card key={review.id} className="p-4 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{review.course}</h3>
                  <Badge className={getSentimentColor(review.sentiment)}>{review.sentiment}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">by {review.author} • {review.date}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm mb-3">{review.text}</p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => console.info("[Coming soon] Helpful ( )")}><ThumbsUp className="w-3 h-3 mr-1" />Helpful ({review.helpful})</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => console.info("[Coming soon] This action")}><ThumbsDown className="w-3 h-3 mr-1" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}