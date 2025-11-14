import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url?: string;
  };
}

interface UserReviewsProps {
  userId: string;
}

export const UserReviews = ({ userId }: UserReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_swap_reviews')
        .select('id, rating, comment, created_at, reviewer_id')
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles separately
      const reviewerIds = [...new Set((data || []).map(r => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', reviewerIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]));

      const reviewsWithProfiles = (data || []).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        reviewer: profilesMap.get(r.reviewer_id) || { full_name: 'Unknown User' },
      }));

      setReviews(reviewsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Loading reviews...</p>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No reviews yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={review.reviewer.avatar_url} />
              <AvatarFallback>
                {review.reviewer.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{review.reviewer.full_name}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {review.comment}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};