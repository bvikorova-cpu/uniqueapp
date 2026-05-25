import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Star, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Props { onBack: () => void; }

interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  course_title?: string;
  author?: string;
}

export function CourseReviewSystemView({ onBack }: Props) {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentReport, setSentimentReport] = useState<string | null>(null);
  const [newReview, setNewReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrolledCourseId, setEnrolledCourseId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("course_reviews")
      .select("id,course_id,user_id,rating,comment,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const rows = (data ?? []) as Review[];
    if (rows.length) {
      const courseIds = [...new Set(rows.map(r => r.course_id))];
      const userIds = [...new Set(rows.map(r => r.user_id))];
      const [{ data: courses }, { data: profs }] = await Promise.all([
        supabase.from("courses").select("id,title").in("id", courseIds),
        supabase.from("profiles_public" as any).select("id,username,full_name").in("id", userIds),
      ]);
      const cMap = new Map((courses ?? []).map((c: any) => [c.id, c.title]));
      const pMap = new Map((profs ?? []).map((p: any) => [p.id, p.username || p.full_name || "Student"]));
      rows.forEach(r => { r.course_title = cMap.get(r.course_id) || "Course"; r.author = pMap.get(r.user_id) || "Student"; });
    }
    setReviews(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("course_enrollments").select("course_id").eq("user_id", user.id).limit(1).maybeSingle();
      if (data?.course_id) setEnrolledCourseId(data.course_id);
    })();
  }, []);

  const analyzeSentiment = async () => {
    if (reviews.length === 0) { toast({ title: "No reviews to analyze yet", variant: "destructive" }); return; }
    setAnalyzing(true);
    try {
      const allReviews = reviews.map(r => `${r.rating}/5 - ${r.comment ?? ""}`).join("\n");
      const { data, error } = await supabase.functions.invoke("stock-content-ai", { body: { action: "analyze-reviews", reviews: allReviews } });
      if (error) throw error;
      setSentimentReport(data.result);
      toast({ title: "Analysis complete", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) { toast({ title: "Empty review", variant: "destructive" }); return; }
    if (!enrolledCourseId) { toast({ title: "Enroll in a course first", variant: "destructive" }); return; }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }
    const { error } = await supabase.from("course_reviews").insert({ course_id: enrolledCourseId, user_id: user.id, rating, comment: reviewText.trim() });
    setSubmitting(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Review submitted" });
    setNewReview(false); setReviewText(""); setRating(5);
    load();
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
            <p className="text-sm text-muted-foreground">{reviews.length} reviews with AI sentiment analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyzeSentiment} disabled={analyzing || reviews.length === 0}>
            {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Analysis (4 CR)
          </Button>
          {enrolledCourseId && (
            <Button onClick={() => setNewReview(!newReview)} className="bg-gradient-to-r from-amber-500 to-yellow-600">
              <Star className="w-4 h-4 mr-2" />Write Review
            </Button>
          )}
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
              <Button onClick={submitReview} disabled={submitting} className="bg-gradient-to-r from-amber-500 to-yellow-600">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Submit Review
              </Button>
              <Button variant="outline" onClick={() => setNewReview(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No reviews yet.</Card>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id} className="p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{review.course_title}</h3>
                    <Badge variant="outline">{review.rating}/5</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">by {review.author} • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-sm">{review.comment}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
