import { Eye, Users, MessageCircle, Heart, Share2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStoryAnalytics } from "@/hooks/useStoryAnalytics";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  storyId: string;
}

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card/50 border border-border/50">
    <Icon className="h-4 w-4 text-primary" />
    <div className="text-xl font-bold">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

export const StoryAnalyticsPanel = ({ storyId }: Props) => {
  const { data, isLoading } = useStoryAnalytics(storyId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  if (!data) return <p className="text-sm text-muted-foreground">No analytics yet.</p>;

  return (
    <>
      <FloatingHowItWorks title="How Story Analytics Panel works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-4 space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider">Story Insights</h3>
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Eye} label="Views" value={data.views_count} />
        <Stat icon={Users} label="Unique" value={data.unique_viewers} />
        <Stat icon={MessageCircle} label="Replies" value={data.replies_count} />
        <Stat icon={Heart} label="Reactions" value={data.reactions_count} />
        <Stat icon={Share2} label="Shares" value={data.shares_count} />
        <Stat icon={Clock} label="Avg ms" value={data.avg_view_duration_ms} />
      </div>
    </Card>
    </>
    );
};
