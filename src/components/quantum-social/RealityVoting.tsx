import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Vote, Atom, CheckCircle, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuantumAccess } from "@/hooks/useQuantumAccess";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PostWithVersions {
  id: string;
  base_content: string;
  is_collapsed: boolean;
  versions: { id: string; content: string; personality_tone: string; votes: number }[];
  totalVotes: number;
  userVoted: boolean;
}

export function RealityVoting({ onBack }: { onBack: () => void }) {
  const [posts, setPosts] = useState<PostWithVersions[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const access = useQuantumAccess();
  const canVote = access.hasQuantumProfilesSub || access.hasObserverSub || access.hasEntanglementSub;

  useEffect(() => {
    fetchVotablePosts();
  }, []);

  const fetchVotablePosts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: postsData } = await supabase
      .from("quantum_posts")
      .select("*")
      .eq("is_collapsed", false)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!postsData) { setLoading(false); return; }

    const enriched: PostWithVersions[] = [];
    for (const post of postsData) {
      const { data: versions } = await supabase
        .from("quantum_post_versions")
        .select("*")
        .eq("post_id", post.id);

      const { data: votes } = await supabase
        .from("quantum_reality_votes")
        .select("*")
        .eq("post_id", post.id);

      let userVoted = false;
      if (user) {
        userVoted = (votes || []).some(v => v.voter_id === user.id);
      }

      const versionVotes = (versions || []).map(v => ({
        ...v,
        votes: (votes || []).filter(vote => vote.chosen_version_id === v.id).length,
      }));

      enriched.push({
        id: post.id,
        base_content: post.base_content,
        is_collapsed: post.is_collapsed,
        versions: versionVotes,
        totalVotes: (votes || []).length,
        userVoted,
      });
    }

    setPosts(enriched);
    setLoading(false);
  };

  const castVote = async (postId: string, versionId: string) => {
    if (access.loading) { toast({ title: "Please wait", description: "Verifying your access…" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!canVote) {
      toast({ title: "Subscription required", description: "Voting requires an active Quantum subscription.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("quantum_reality_votes").insert([{
      post_id: postId,
      voter_id: user.id,
      chosen_version_id: versionId,
    }]);

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Already Voted", description: "You can only vote once per post", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to cast vote", variant: "destructive" });
      }
    } else {
      toast({ title: "Vote Cast!", description: "Your vote helps decide which reality survives" });
      fetchVotablePosts();
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Reality Voting'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reality Voting panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Vote className="h-5 w-5 text-violet-400" />
            Reality Voting
          </h2>
          <p className="text-xs text-muted-foreground">Vote to decide which quantum reality survives</p>
        </div>
      </div>

      {access.loading && (
        <div className="rounded-md border border-violet-500/20 bg-violet-500/5 p-3 space-y-2">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      )}

      {!access.loading && access.userId && !canVote && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex gap-2 items-start">
          <Lock className="h-4 w-4 mt-0.5" />
          <span>Voting is gated to Quantum subscribers. Activate any plan in Subscriptions to participate.</span>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading quantum posts...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
          <Atom className="h-12 w-12 mx-auto text-violet-400 mb-3 animate-spin" style={{ animationDuration: '8s' }} />
          <p className="text-muted-foreground">No posts available for voting. Create quantum posts first!</p>
        </div>
      ) : (
        posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-sm mb-1">{post.base_content}</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
                    {post.versions.length} versions
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    {post.totalVotes} votes
                  </Badge>
                </div>
              </div>
              {post.userVoted && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Voted
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              {post.versions.map((version) => {
                const pct = post.totalVotes > 0 ? (version.votes / post.totalVotes) * 100 : 0;
                return (
                  <div
                    key={version.id}
                    onClick={() => !post.userVoted && !access.loading && castVote(post.id, version.id)}
                    className={`rounded-lg border p-3 transition-all ${post.userVoted || access.loading ? 'border-white/10 opacity-70' : 'border-cyan-500/20 cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-500/5'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">{version.content}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">{version.personality_tone}</Badge>
                    </div>
                    {post.userVoted && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-12 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}
    </div>
    </>
  );
}
