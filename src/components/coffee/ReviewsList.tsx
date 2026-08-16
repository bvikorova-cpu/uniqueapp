import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ReviewsList = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['coffee-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_reviews')
        .select(`
          *,
          cafe:coffee_cafes(name, city, country)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const rows = data ?? [];
      const userIds = Array.from(new Set(rows.map((r: any) => r.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await (supabase as any)
          .from('profiles_public')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
        rows.forEach((r: any) => {
          r.profile = profileMap.get(r.user_id) || null;
        });
      }
      return rows;
    }
  });

  if (isLoading) return <div>Loading reviews...</div>;

  return (
    <>
      <FloatingHowItWorks title={"Reviews List - How it works"} steps={[{ title: 'Open', desc: 'Access the Reviews List section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reviews List.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the output, share, save or purchase where available.' }]} />
      <div className="space-y-4">
      {reviews?.map((review: any) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{review.cafe?.name}</CardTitle>
                <CardDescription>
                  {review.cafe?.city}, {review.cafe?.country}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={review.profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{(review.profile?.full_name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{review.profile?.full_name || 'User'}</span>
            </div>
            <p className="text-sm">{review.review_text}</p>
            {review.is_featured && (
              <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Featured Review
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
    </>
  );
};
