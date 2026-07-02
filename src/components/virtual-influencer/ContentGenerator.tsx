import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ContentGeneratorProps {
  influencerId: string;
  influencer: any;
}

const CONTENT_TYPES = [
  { value: "image", label: "Instagram Post", credits: 5 },
  { value: "story", label: "Story", credits: 3 },
  { value: "reel", label: "Reel", credits: 8 },
  { value: "video", label: "Video", credits: 10 },
];

const ContentGenerator = ({ influencerId, influencer }: ContentGeneratorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contentType, setContentType] = useState("image");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const prompt = customPrompt || 
        `Create a ${contentType} for ${influencer.name}, a ${influencer.niche} influencer with ${influencer.personality} personality. Professional, engaging, Instagram-worthy content.`;

      const { data, error } = await supabase.functions.invoke("ai-image-generation", {
        body: { prompt },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.imageUrl);
      
      // Generate a caption
      const caption = `✨ New ${contentType} from ${influencer.name}! ${influencer.niche} content that inspires. #${influencer.niche.replace(/\s+/g, '')} #influencer #contentcreator`;
      setGeneratedCaption(caption);

      toast({
        title: "Content Generated!",
        description: "Your content is ready to publish",
      });
    },
    onError: (error) => {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!generatedContent) throw new Error("No content to publish");

      // Simulate engagement metrics
      const likes = Math.floor(Math.random() * 5000) + 1000;
      const comments = Math.floor(likes * 0.05);
      const shares = Math.floor(likes * 0.02);
      const earnings = (likes * 0.001 * Number(influencer.engagement_rate)).toFixed(2);
      const platformFee = (Number(earnings) * 0.20).toFixed(2); // 20% platform fee
      const netEarnings = (Number(earnings) - Number(platformFee)).toFixed(2);

      // Save content
      const { error: contentError } = await supabase
        .from("influencer_content")
        .insert([{
          influencer_id: influencerId,
          content_type: contentType,
          content_url: generatedContent,
          caption: generatedCaption,
          likes,
          comments,
          shares,
          earnings: Number(netEarnings),
        }]);

      if (contentError) throw contentError;

      // Update influencer followers and earnings
      const newFollowers = influencer.followers + Math.floor(Math.random() * 100) + 50;
      const { error: updateError } = await supabase
        .from("virtual_influencers")
        .update({
          followers: newFollowers,
          total_earnings: Number(influencer.total_earnings) + Number(netEarnings),
        })
        .eq("id", influencerId);

      if (updateError) throw updateError;

      // Update influencer balance (trigger guarantees row exists)
      const { data: existingBalance } = await supabase
        .from("influencer_balances")
        .select("*")
        .eq("influencer_id", influencerId)
        .maybeSingle();

      if (existingBalance) {
        await supabase
          .from("influencer_balances")
          .update({
            total_earned: Number(existingBalance.total_earned) + Number(netEarnings),
          })
          .eq("influencer_id", influencerId);
      } else {
        // Fallback in case trigger didn't fire (legacy rows)
        await supabase
          .from("influencer_balances")
          .insert({
            influencer_id: influencerId,
            total_earned: Number(netEarnings),
            withdrawn: 0,
            pending_withdrawal: 0,
          });
      }

      // Record earnings
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("influencer_earnings").insert([{
          influencer_id: influencerId,
          user_id: user.id,
          amount: Number(earnings),
          platform_fee: Number(platformFee),
          net_amount: Number(netEarnings),
          source: "content_views",
        }]);
      }

      return { netEarnings, likes };
    },
    onSuccess: (data) => {
      toast({
        title: "Content Published!",
        description: `Earned €${data.netEarnings} with ${data.likes} likes`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["influencer", influencerId] });
      queryClient.invalidateQueries({ queryKey: ["influencer-content", influencerId] });
      queryClient.invalidateQueries({ queryKey: ["influencer-earnings", influencerId] });
      queryClient.invalidateQueries({ queryKey: ["virtual-influencers"] });
      
      setGeneratedContent(null);
      setGeneratedCaption("");
      setCustomPrompt("");
    },
    onError: (error) => {
      console.error("Publish error:", error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish content. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <FloatingHowItWorks title={"Content Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Content Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Content Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate New Content</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} ({type.credits} credits)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
            <Textarea
              id="prompt"
              placeholder={`Leave empty for AI-suggested content, or describe what you want...`}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preview & Publish</h3>
        
        {generatedContent ? (
          <div className="space-y-4">
            <img
              src={generatedContent}
              alt="Generated content"
              className="w-full rounded-lg"
            />
            
            <div>
              <Label>Caption</Label>
              <Textarea
                value={generatedCaption}
                onChange={(e) => setGeneratedCaption(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="flex-1"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish & Earn
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedContent(null);
                  setGeneratedCaption("");
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Generate content to see preview here
            </p>
          </div>
        )}
      </Card>
    </div>
    </>
  );
};

export default ContentGenerator;
