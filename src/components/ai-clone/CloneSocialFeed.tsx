import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Bot, MessageCircle, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface FeedItem {
  id: string;
  clone_name: string;
  event: string;
  time: string;
}

export function CloneSocialFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      const { data } = await supabase
        .from("personality_clones")
        .select("id, clone_name, created_at, total_conversations")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setFeed(data.map(d => ({
          id: d.id,
          clone_name: d.clone_name,
          event: d.total_conversations > 0 ? `Has had ${d.total_conversations} conversations` : "Just joined the network",
          time: d.created_at,
        })));
      }
    };
    fetchFeed();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Clone Social Feed - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Social Feed section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Social Feed.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Clone Network Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feed.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 bg-background/50 rounded-xl border border-border/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{item.clone_name}</span>{" "}
                    <span className="text-muted-foreground">{item.event}</span>
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
