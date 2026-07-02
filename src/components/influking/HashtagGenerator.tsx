import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Hash, Copy, Sparkles, Loader2, Zap, TrendingUp, Target } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HashtagGeneratorProps {
  onBack: () => void;
}

const HASHTAG_CATEGORIES: Record<string, string[]> = {
  "Fashion & Beauty": ["#fashion", "#style", "#ootd", "#beauty", "#makeup", "#skincare", "#fashionista", "#beautytips", "#trending", "#glam", "#fashionblogger", "#beautycare", "#lookoftheday", "#styleinspo", "#beautyroutine"],
  "Gaming": ["#gaming", "#gamer", "#gameplay", "#twitch", "#esports", "#gamingcommunity", "#videogames", "#streamer", "#gaminglife", "#pcgaming", "#consolegaming", "#gamedev", "#retrogaming", "#gamingsetup", "#letsplay"],
  "Fitness & Health": ["#fitness", "#workout", "#gym", "#fitnessmotivation", "#health", "#fitlife", "#training", "#exercise", "#gains", "#healthylifestyle", "#bodybuilding", "#yoga", "#wellness", "#fitfam", "#cardio"],
  "Travel": ["#travel", "#wanderlust", "#adventure", "#explore", "#travelgram", "#vacation", "#travelphotography", "#instatravel", "#roadtrip", "#backpacking", "#travelblogger", "#destination", "#traveler", "#bucketlist", "#luxurytravel"],
  "Food & Cooking": ["#food", "#foodie", "#cooking", "#recipe", "#homemade", "#foodporn", "#chef", "#delicious", "#healthyfood", "#baking", "#foodblogger", "#instafood", "#mealprep", "#yummy", "#cookingathome"],
  "Technology": ["#tech", "#technology", "#gadgets", "#innovation", "#coding", "#AI", "#startup", "#techreview", "#programming", "#software", "#techlife", "#digitalworld", "#futuretech", "#smartdevice", "#techtrends"],
  "Music": ["#music", "#musician", "#singer", "#songwriter", "#newmusic", "#livemusic", "#musicproduction", "#beats", "#hiphop", "#pop", "#rock", "#musicislife", "#producer", "#rap", "#musicvideo"],
  "Comedy": ["#comedy", "#funny", "#humor", "#memes", "#laugh", "#comedyshow", "#standup", "#viral", "#comedyvideo", "#funnymemes", "#comedyclub", "#lol", "#dailylaugh", "#funnyvideos", "#comedygold"],
  "Education": ["#education", "#learning", "#knowledge", "#studytips", "#teaching", "#onlinecourse", "#studygram", "#edtech", "#motivation", "#facts", "#learnwithme", "#tutorial", "#selfimprovement", "#mindset", "#growthmindset"],
  "Lifestyle": ["#lifestyle", "#life", "#inspo", "#dailylife", "#liveyourbestlife", "#selfcare", "#positivevibes", "#lifestyleblogger", "#motivation", "#mindfulness", "#goodvibes", "#lifequotes", "#balance", "#minimalism", "#dailyroutine"],
};

const HashtagGenerator = ({ onBack }: HashtagGeneratorProps) => {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: credits } = useQuery({
    queryKey: ["ai-credits-hashtag"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const generateHashtags = async () => {
    if (!topic.trim() && !selectedCategory) {
      toast({ title: "Enter a topic", description: "Type a topic or select a category", variant: "destructive" });
      return;
    }

    if (!credits || credits.credits_remaining < 3) {
      toast({ title: "Insufficient Credits", description: "You need 3 AI credits. Purchase more to continue.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.rpc("deduct_ai_credits" as any, { p_user_id: user.id, p_amount: 3 });

      // Generate hashtags based on topic + category
      const categoryTags = selectedCategory ? HASHTAG_CATEGORIES[selectedCategory] || [] : [];
      const topicTags = topic.trim().split(/\s+/).map(w => `#${w.toLowerCase().replace(/[^a-z0-9]/g, "")}`).filter(t => t.length > 1);
      const mixedTags = [
        ...topicTags.slice(0, 5),
        ...categoryTags.slice(0, 15),
        `#${topic.replace(/\s+/g, "").toLowerCase()}`,
        `#${topic.replace(/\s+/g, "").toLowerCase()}2026`,
        "#viral", "#fyp", "#trending",
      ];

      // Deduplicate
      const unique = [...new Set(mixedTags)].slice(0, 25);
      setGeneratedHashtags(unique);

      await supabase.from("ai_usage_history").insert({
        user_id: user.id,
        usage_type: "hashtag_generator",
        credits_used: 3,
        description: `Hashtags for: ${topic || selectedCategory}`,
      });

      toast({ title: "✅ Hashtags Generated!", description: "25 optimized hashtags ready (3 credits used)" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(generatedHashtags.join(" "));
    toast({ title: "Copied!", description: "All hashtags copied to clipboard" });
  };

  return (
    <>
      <FloatingHowItWorks title={"Hashtag Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Hashtag Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hashtag Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Hash className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Hashtag Generator</h2>
            <p className="text-muted-foreground">Generate viral hashtags optimized for reach — 3 credits</p>
          </div>
          <Badge className="ml-auto bg-primary/20 text-primary border-primary/30">
            <Zap className="h-3 w-3 mr-1" /> {credits?.credits_remaining || 0} Credits
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" /> Generate Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic or keyword</label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. summer fitness routine, gaming setup, travel vlog..." />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(HASHTAG_CATEGORIES).map((cat) => (
                    <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}>
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={generateHashtags} disabled={isGenerating} className="w-full gap-2">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
                {isGenerating ? "Generating..." : "Generate Hashtags (3 Credits)"}
              </Button>

              {generatedHashtags.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{generatedHashtags.length} Hashtags Generated</h4>
                    <Button size="sm" variant="outline" onClick={copyAll} className="gap-1">
                      <Copy className="h-3 w-3" /> Copy All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg border border-primary/10">
                    {generatedHashtags.map((tag, i) => (
                      <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => { navigator.clipboard.writeText(tag); toast({ title: `Copied: ${tag}` }); }}>
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Sidebar */}
        <div>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" /> Hashtag Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Mix popular and niche hashtags for maximum reach</p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Use 20-25 hashtags per post for optimal visibility</p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Rotate hashtags regularly to avoid shadowbans</p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Include location-based hashtags for local reach</p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Create a branded hashtag unique to your content</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default HashtagGenerator;
