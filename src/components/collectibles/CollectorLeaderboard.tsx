import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Crown, Gem, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function CollectorLeaderboard({ userId }: Props) {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["collectible-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_collectibles")
        .select("user_id, collectible_type")
        .order("acquired_at", { ascending: false });
      if (error) throw error;

      const userMap: Record<string, { count: number; types: Set<string> }> = {};
      data?.forEach((item: any) => {
        if (!userMap[item.user_id]) userMap[item.user_id] = { count: 0, types: new Set() };
        userMap[item.user_id].count++;
        if (item.collectible_type) userMap[item.user_id].types.add(item.collectible_type);
      });

      return Object.entries(userMap)
        .map(([uid, info]) => ({
          userId: uid,
          itemCount: info.count,
          uniqueTypes: info.types.size,
          isYou: uid === userId,
        }))
        .sort((a, b) => b.itemCount - a.itemCount)
        .slice(0, 50);
    },
  });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <FloatingHowItWorks title={"Collector Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Collector Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collector Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold">Collector Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top collectors ranked by portfolio size and diversity</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="top" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="top" className="gap-2"><Crown className="h-4 w-4" /> Top Collectors</TabsTrigger>
          <TabsTrigger value="diverse" className="gap-2"><Gem className="h-4 w-4" /> Most Diverse</TabsTrigger>
        </TabsList>

        <TabsContent value="top">
          <Card className="p-4 space-y-2">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading leaderboard...</p>
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((entry, i) => (
                <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-lg ${entry.isYou ? "bg-primary/10 border border-primary/30" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold w-8">{medals[i] || `#${i + 1}`}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {entry.isYou ? "You" : `Collector ${entry.userId.slice(0, 6)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.uniqueTypes} unique types</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{entry.itemCount} items</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No collectors yet. Be the first!</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="diverse">
          <Card className="p-4 space-y-2">
            {leaderboard?.sort((a, b) => b.uniqueTypes - a.uniqueTypes).map((entry, i) => (
              <div key={entry.userId} className={`flex items-center justify-between p-3 rounded-lg ${entry.isYou ? "bg-primary/10 border border-primary/30" : "bg-muted/50"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold w-8">{medals[i] || `#${i + 1}`}</span>
                  <div>
                    <p className="font-medium text-sm">
                      {entry.isYou ? "You" : `Collector ${entry.userId.slice(0, 6)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.itemCount} total items</p>
                  </div>
                </div>
                <Badge variant="secondary">{entry.uniqueTypes} types</Badge>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
