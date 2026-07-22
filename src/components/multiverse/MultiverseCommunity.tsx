import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, MessageSquare, Star, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface MultiverseCommunityProps {
  onBack: () => void;
}

interface ExplorerRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  universes: number;
  specialty: string | null;
}

const MultiverseCommunity = ({ onBack }: MultiverseCommunityProps) => {
  const { data: explorers = [], isLoading } = useQuery({
    queryKey: ["multiverse-explorers"],
    queryFn: async (): Promise<ExplorerRow[]> => {
      const { data, error } = await supabase.rpc("get_multiverse_explorers", { limit_count: 12 });
      if (error) throw error;
      return ((data ?? []) as any[]).map((r) => ({ user_id: r.user_id,
        display_name: r.display_name,
        avatar_url: r.avatar_url,
        universes: Number(r.universes) || 0,
        specialty: r.specialty }));
    },
    staleTime: 60_000 });
  return (
    <>
      <FloatingHowItWorks
        title='Multiverse Community'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Multiverse Community panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub</Button>

      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-violet-400" />
            Multiverse Community
          </CardTitle>
          <CardDescription>Connect with other multiverse explorers and share discoveries</CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-400" /></div>
      ) : explorers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No explorers yet — be the first to unlock a universe!</p>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {explorers.map((explorer) => (
            <Card key={explorer.user_id} className="border-border/40 hover:border-violet-500/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm truncate">{explorer.display_name}</h3>
                  <Badge variant="outline" className="text-xs"><Star className="w-3 h-3 mr-1" />{explorer.universes}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{explorer.universes} universes{explorer.specialty ? ` · ${explorer.specialty}` : ""}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => {
                    const followed = JSON.parse(localStorage.getItem("multiverse_followed") || "[]");
                    if (followed.includes(explorer.user_id)) { toast.info(`Already following ${explorer.display_name}`); return; }
                    followed.push(explorer.user_id);
                    localStorage.setItem("multiverse_followed", JSON.stringify(followed));
                    toast.success(`Following ${explorer.display_name}!`);
                  }}>
                    <Users className="w-3 h-3 mr-1" /> Follow
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => { window.location.href = `/messenger?to=${explorer.user_id}`; }}>
                    <MessageSquare className="w-3 h-3 mr-1" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default MultiverseCommunity;
