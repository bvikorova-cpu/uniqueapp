import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

interface CourseReviewsProps {
  courseId: string;
  userHasAccess: boolean;
}

export const CourseReviews = ({ courseId, userHasAccess }: CourseReviewsProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const { data: userReview } = useQuery({
    queryKey: ["user-review", courseId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: userHasAccess,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const reviewData = {
        course_id: courseId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      };

      if (userReview) {
        const { error } = await supabase
          .from("course_reviews")
          .update(reviewData)
          .eq("id", userReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_reviews")
          .insert(reviewData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", courseId] });
      toast({
        title: "Success",
        description: userReview ? "Review updated successfully" : "Review submitted successfully",
      });
      if (!userReview) {
        setRating(0);
        setComment("");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const StarRating = ({ value, interactive = false, onRate }: { value: number; interactive?: boolean; onRate?: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title="How Course Reviews works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Reviews</CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <StarRating value={Math.round(averageRating)} />
            </div>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        </CardHeader>
      </Card>

      {userHasAccess && !userReview && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Your Rating</p>
              <StarRating 
                value={hoverRating || rating} 
                interactive 
                onRate={setRating}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Your Comment (Optional)</p>
              <Textarea
                placeholder="Share your thoughts about this course..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={() => submitReview.mutate()}
              disabled={rating === 0 || submitReview.isPending}
            >
              Submit Review
            </Button>
          </CardContent>
        </Card>
      )}

      {userReview && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Your Rating</p>
              <StarRating value={userReview.rating} />
            </div>
            {userReview.comment && (
              <div>
                <p className="text-sm font-medium mb-2">Your Comment</p>
                <p className="text-muted-foreground">{userReview.comment}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Reviewed on {new Date(userReview.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews
          .filter((review) => review.id !== userReview?.id)
          .map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6 space-y-2">
                <StarRating value={review.rating} />
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      {isLoading && <p className="text-center text-muted-foreground">Loading reviews...</p>}
      {!isLoading && reviews.length === 0 && (
        <p className="text-center text-muted-foreground">No reviews yet. Be the first to review!</p>
      )}
    </div>
    </>
    );
};
