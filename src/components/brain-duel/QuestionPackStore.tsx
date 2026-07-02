import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Package, Check, Star, Gift, Brain,
  Globe, BookOpen, FlaskConical, Dumbbell, Music, Palette, Cpu
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBrainDuelCredits } from '@/hooks/useBrainDuelCredits';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const categoryIcons: Record<string, typeof Globe> = {
  'Entertainment': Star,
  'History': BookOpen,
  'Science': FlaskConical,
  'Geography': Globe,
  'Sports': Dumbbell,
  'Music': Music,
  'Technology': Cpu,
  'Art': Palette,
};

export const QuestionPackStore = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { credits, spendCredits } = useBrainDuelCredits();

  const { data: packs, isLoading } = useQuery({
    queryKey: ['brain-duel-question-packs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('brain_duel_question_packs')
        .select('*')
        .order('price_credits', { ascending: true });
      return data || [];
    },
  });

  const { data: userPacks } = useQuery({
    queryKey: ['brain-duel-user-packs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('brain_duel_user_packs')
        .select('pack_id')
        .eq('user_id', user.id);
      return data?.map(p => p.pack_id) || [];
    },
  });

  const purchasePack = useMutation({
    mutationFn: async (pack: { id: string; price_credits: number; name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (credits < pack.price_credits) throw new Error('Insufficient credits');
      spendCredits(pack.price_credits);
      const { error } = await supabase.from('brain_duel_user_packs').insert({ user_id: user.id, pack_id: pack.id });
      if (error) throw error;
      return pack;
    },
    onSuccess: (pack) => {
      queryClient.invalidateQueries({ queryKey: ['brain-duel-user-packs'] });
      queryClient.invalidateQueries({ queryKey: ['brain-duel-credits'] });
      toast({ title: 'Pack purchased! 📚', description: `${pack.name} has been added to your collection` });
    },
    onError: (error: Error) => {
      toast({ title: 'Purchase failed', description: error.message, variant: 'destructive' });
    },
  });

  const isOwned = (packId: string) => userPacks?.includes(packId);

  return (
    <>
      <FloatingHowItWorks title={"Question Pack Store - How it works"} steps={[{ title: 'Open', desc: 'Access the Question Pack Store section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Question Pack Store.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 backdrop-blur-xl bg-card/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Question Packs Store
          </CardTitle>
          <CardDescription>Expand your question library with themed packs</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex items-center justify-between p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/5">
            <span className="text-sm text-muted-foreground">Your Credits:</span>
            <Badge variant="outline" className="text-lg font-bold border-primary/20">
              <Brain className="h-4 w-4 mr-2" />
              {credits}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Packs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse backdrop-blur-xl bg-card/80">
              <CardContent className="p-6 h-48" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs?.map((pack, i) => {
            const Icon = categoryIcons[pack.category] || Package;
            const owned = isOwned(pack.id);
            const canAfford = credits >= pack.price_credits;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card 
                  className={`relative backdrop-blur-xl bg-card/80 transition-all hover:shadow-lg ${
                    owned ? 'border-green-500/30 bg-green-500/5' : 'border-primary/10'
                  } ${pack.is_premium ? 'border-primary/30' : ''}`}
                >
                  {pack.is_premium && !owned && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-purple-600 text-white shadow-md">
                      PREMIUM
                    </Badge>
                  )}
                  {owned && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white shadow-md gap-1">
                      <Check className="h-3 w-3" /> OWNED
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl backdrop-blur-sm">
                        {pack.icon || <Icon className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <div className="text-lg">{pack.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">{pack.category}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{pack.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{pack.question_count} questions</Badge>
                      <span className="text-xl font-black text-primary">{pack.price_credits} credits</span>
                    </div>
                    
                    <Button
                      className="w-full"
                      variant={owned ? "outline" : "default"}
                      disabled={owned || !canAfford || purchasePack.isPending}
                      onClick={() => purchasePack.mutate(pack)}
                    >
                      {owned ? (
                        <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Owned</span>
                      ) : purchasePack.isPending ? (
                        'Purchasing...'
                      ) : !canAfford ? (
                        'Insufficient Credits'
                      ) : (
                        <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Purchase</span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Create Custom Pack Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-dashed border-2 border-primary/20 backdrop-blur-xl bg-card/80 hover:border-primary/40 transition-all cursor-pointer"
              onClick={() => toast({ title: "Custom Pack Builder", description: "Select a category and we'll generate personalized questions for you using AI!" })}
            >
              <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
                <Gift className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Create Custom Pack</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build your own question pack with personalized questions
                </p>
                <Button variant="outline" size="sm" className="gap-2" onClick={async (e) => {
                  e.stopPropagation();
                  const category = window.prompt("Enter a category (Geography, History, Science, Sports, Music, Technology, Art, Entertainment):");
                  if (!category) return;
                  if (credits < 50) { toast({ title: "Not enough credits", description: "Custom AI pack costs 50 credits", variant: "destructive" }); return; }
                  try { await spendCredits(50); } catch { return; }
                  try {
                    const { data, error } = await supabase.functions.invoke("generate-gift-message", {
                      body: { type: "brain_duel_pack", prompt: `Generate 10 trivia questions about ${category}. Format: JSON array of {question, options:[4], correct_index}.` }
                    });
                    if (error) throw error;
                    toast({ title: "AI Pack Ready!", description: `Generated ${category} questions. Check your library.` });
                    queryClient.invalidateQueries({ queryKey: ['brain-duel-user-packs'] });
                  } catch (err: any) {
                    toast({ title: "Generation failed", description: err.message, variant: "destructive" });
                  }
                }}>
                  <Brain className="h-4 w-4" /> Generate with AI (50 credits)
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Categories Info */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Available Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { name: 'Geography', icon: Globe, color: 'text-green-500' },
              { name: 'History', icon: BookOpen, color: 'text-amber-600' },
              { name: 'Science', icon: FlaskConical, color: 'text-blue-500' },
              { name: 'Sports', icon: Dumbbell, color: 'text-orange-500' },
              { name: 'Music', icon: Music, color: 'text-purple-500' },
              { name: 'Technology', icon: Cpu, color: 'text-cyan-500' },
              { name: 'Art', icon: Palette, color: 'text-violet-500' },
              { name: 'Entertainment', icon: Star, color: 'text-yellow-500' },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-primary/5 hover:bg-muted/50 transition-colors"
              >
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
                <span className="text-sm font-medium">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};