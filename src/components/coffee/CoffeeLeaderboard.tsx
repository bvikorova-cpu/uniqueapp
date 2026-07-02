import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CoffeeLeaderboard = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['coffee-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coffee_profiles')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading leaderboard...</div>;

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <>
      <FloatingHowItWorks title={"Coffee Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Coffee Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coffee Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Top Coffee Enthusiasts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard?.map((profile, index) => (
            <div key={profile.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="w-12 flex justify-center">
                  {getMedalIcon(index)}
                </div>
                <div>
                  <p className="font-semibold">User {profile.user_id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.total_checkins} check-ins • {profile.total_reviews} reviews
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{profile.total_points}</p>
                <p className="text-sm text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};