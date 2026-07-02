import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Lightbulb, TrendingUp, Users, Euro, Zap } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MonetizationIdea {
  name: string;
  description: string;
  revenue_model: string;
  target_audience: string;
  price_point: string;
  engagement_hook: string;
}

export function MonetizationIdeaGenerator() {
  const [theme, setTheme] = useState("");
  const [context, setContext] = useState("");
  const [ideas, setIdeas] = useState<MonetizationIdea[]>([]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-monetization-ideas", {
        body: { theme, context },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setIdeas(data.ideas || []);
      toast.success(`Generated ${data.ideas?.length || 0} monetization ideas!`);
    },
    onError: (error: any) => {
      if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error.message?.includes("402") || error.message?.includes("Payment")) {
        toast.error("AI credits depleted. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate ideas");
      }
    },
  });

  const quickThemes = [
    { label: "Horror 👻", value: "Horror experiences - scary stories, haunted mysteries, psychological thrillers" },
    { label: "Comedy 😂", value: "Comedy content - stand-up shows, funny skits, comedy battles" },
    { label: "Mystery 🔍", value: "Mystery adventures - detective games, escape rooms, puzzle solving" },
    { label: "Thriller 🎭", value: "Thriller experiences - suspense stories, crime investigations, plot twists" },
  ];

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes("subscription")) return <TrendingUp className="h-4 w-4" />;
    if (type.toLowerCase().includes("freemium")) return <Sparkles className="h-4 w-4" />;
    if (type.toLowerCase().includes("pay-per")) return <Euro className="h-4 w-4" />;
    return <Lightbulb className="h-4 w-4" />;
  };

  return (
    <>
      <FloatingHowItWorks title={"Monetization Idea Generator - How it works"} steps={[{ title: 'Open', desc: 'Access the Monetization Idea Generator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Monetization Idea Generator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Monetization Idea Generator
          </CardTitle>
          <CardDescription>
            Get creative revenue ideas powered by AI for your entertainment platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme / Genre</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Horror stories, Comedy shows, Mystery games..."
              className="mt-1"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickThemes.map((qt) => (
                <Badge
                  key={qt.value}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setTheme(qt.value)}
                >
                  {qt.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any specific requirements, target audience, or features you want to include..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!theme || generateMutation.isPending}
            className="w-full"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Monetization Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            {ideas.length} Creative Ideas
          </h2>
          <div className="grid gap-4">
            {ideas.map((idea, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {getIcon(idea.revenue_model)}
                        {idea.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{idea.revenue_model}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <Euro className="h-3 w-3" />
                          {idea.price_point}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-muted-foreground">{idea.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Target Audience</span>
                      </div>
                      <p className="text-sm">{idea.target_audience}</p>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Engagement Hook</span>
                      </div>
                      <p className="text-sm">{idea.engagement_hook}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}