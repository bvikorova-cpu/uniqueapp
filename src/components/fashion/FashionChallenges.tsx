import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Users, Award, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function FashionChallenges() {
  const queryClient = useQueryClient();
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { data: challenges } = useQuery({
    queryKey: ['fashion-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fashion_challenges').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: myDesigns } = useQuery({
    queryKey: ['my-designs-for-challenges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from('fashion_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    }
  });

  const { data: submissions } = useQuery({
    queryKey: ['challenge-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fashion_challenge_submissions').select(`*,fashion_designs(title, image_url)`).order('vote_count', { ascending: false }).limit(50);
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return data;
      const { data: votes } = await supabase.from('fashion_challenge_votes').select('submission_id').eq('user_id', user.id);
      const voteMap = new Set(votes?.map(v => v.submission_id) || []);
      return data?.map(sub => ({ ...sub, hasVoted: voteMap.has(sub.id) }));
    }
  });

  const submitMutation = useMutation({
    mutationFn: async ({ challengeId, designId }: { challengeId: string; designId: string }) => {
      const { data, error } = await supabase.functions.invoke('submit-fashion-challenge', { body: { challengeId, designId } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-submissions'] });
      setShowSubmitDialog(false);
      toast.success("Design submitted successfully!");
    },
    onError: (error: any) => toast.error(error.message || "Error submitting design")
  });

  const voteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase.functions.invoke('vote-fashion-challenge', { body: { submissionId } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['challenge-submissions'] }),
    onError: (error: any) => toast.error(error.message || "Error voting")
  });

  const handleSubmit = () => {
    if (!selectedChallenge || !selectedDesignId) return;
    submitMutation.mutate({ challengeId: selectedChallenge.id, designId: selectedDesignId });
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <FloatingHowItWorks title="How Fashion Challenges works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Active Challenges</CardTitle></CardHeader>
        <CardContent>
          {challenges && challenges.length > 0 ? (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                        <p className="text-muted-foreground mb-3">{challenge.description}</p>
                        <Badge variant="secondary" className="mr-2">{challenge.theme}</Badge>
                        <Badge variant="outline"><Trophy className="h-3 w-3 mr-1" />{challenge.prize_description}</Badge>
                      </div>
                      <Dialog open={showSubmitDialog && selectedChallenge?.id === challenge.id} onOpenChange={(open) => { setShowSubmitDialog(open); if (!open) setSelectedChallenge(null); }}>
                        <DialogTrigger asChild><Button onClick={() => setSelectedChallenge(challenge)}>Submit Design</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Submit to Challenge</DialogTitle><DialogDescription>Choose one of your designs to submit</DialogDescription></DialogHeader>
                          <div className="space-y-4">
                            <div><Label>Select Design</Label>
                              <Select value={selectedDesignId} onValueChange={setSelectedDesignId}>
                                <SelectTrigger><SelectValue placeholder="Choose a design..." /></SelectTrigger>
                                <SelectContent>{myDesigns?.map((design) => (<SelectItem key={design.id} value={design.id}>{design.title}</SelectItem>))}</SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleSubmit} className="w-full" disabled={!selectedDesignId || submitMutation.isPending}>{submitMutation.isPending ? "Submitting..." : "Submit to Challenge"}</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Ends: {formatDate(challenge.end_date)}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />View submissions</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (<div className="text-center py-8"><Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No active challenges at the moment</p></div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Leaderboard</CardTitle></CardHeader>
        <CardContent>
          {submissions && submissions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((submission, index) => (
                <Card key={submission.id} className="relative">
                  {index < 3 && (<div className="absolute top-2 left-2 z-10"><Badge className={index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"}>#{index + 1}</Badge></div>)}
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    {submission.fashion_designs?.image_url ? (
                      <img src={submission.fashion_designs.image_url} alt={submission.fashion_designs.title || "Design"} className="w-full h-full object-cover" />
                    ) : (<div className="w-full h-full bg-muted flex items-center justify-center"><Trophy className="h-12 w-12 text-muted-foreground" /></div>)}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold truncate">{submission.fashion_designs?.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{submission.votes_count} votes</span>
                      <Button variant={(submission as any).hasVoted ? "default" : "outline"} size="sm" onClick={() => voteMutation.mutate(submission.id)} disabled={voteMutation.isPending}>
                        <Heart className={`h-4 w-4 ${(submission as any).hasVoted ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (<div className="text-center py-8"><Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No submissions yet</p></div>)}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
