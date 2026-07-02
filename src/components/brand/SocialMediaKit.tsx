import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Share2, Hash, Clock, Lightbulb, Copy, Check, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SocialMediaKitProps {
  credits: number;
  onBack: () => void;
  onCreditsUsed: () => void;
}

const platformIcons: Record<string, string> = {
  instagram: "📸",
  twitter: "🐦",
  linkedin: "💼",
  tiktok: "🎵",
  facebook: "📘",
};

const SocialMediaKit = ({ credits, onBack, onCreditsUsed }: SocialMediaKitProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [kit, setKit] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!brandName || !industry) {
      toast({ title: "Missing Info", description: "Brand name and industry required.", variant: "destructive" });
      return;
    }
    if (credits < 10) {
      toast({ title: "Insufficient Credits", description: "You need 10 credits.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const res = await supabase.functions.invoke("brand-ai", {
        body: { action: "social-media-kit", brandName, industry, tone, targetAudience },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      setKit(res.data.platforms);
      onCreditsUsed();
      toast({ title: "📱 Social Kit Ready!", description: "Complete social media strategy for 5 platforms." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"Social Media Kit - How it works"} steps={[{ title: 'Open', desc: 'Access the Social Media Kit section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Social Media Kit.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
          <Share2 className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-blue-500">Social Media Kit Generator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Complete Social Media Strategy</h2>
        <p className="text-muted-foreground mt-2">Get bios, hashtags, content plans & schedules for 5 platforms</p>
        <Badge variant="secondary" className="mt-2">Cost: 10 credits | Your Credits: {credits}</Badge>
      </motion.div>

      {!kit && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-blue-500" /> Brand Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand Name *</Label>
                  <Input placeholder="Your brand name" value={brandName} onChange={e => setBrandName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Input placeholder="e.g., Fashion, Tech, Food" value={industry} onChange={e => setIndustry(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="bold">Bold & Edgy</SelectItem>
                      <SelectItem value="luxury">Luxury & Elegant</SelectItem>
                      <SelectItem value="playful">Playful & Fun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input placeholder="e.g., Gen Z, Professionals 25-40" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleGenerate} disabled={loading || !brandName || !industry} className="w-full" size="lg">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Kit...</> : <><Share2 className="mr-2 h-5 w-5" /> Generate Social Kit (10 Credits)</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {kit && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="instagram">
            <TabsList className="grid grid-cols-5 w-full mb-6">
              {Object.keys(kit).map(platform => (
                <TabsTrigger key={platform} value={platform} className="text-xs sm:text-sm">
                  {platformIcons[platform] || "📱"} <span className="hidden sm:inline ml-1 capitalize">{platform}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(kit).map(([platform, data]: [string, any]) => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                {/* Bio */}
                <Card>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">Bio</h4>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText(data.bio)}>
                        {copiedText === data.bio ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{data.bio}</p>
                  </CardContent>
                </Card>

                {/* Handle Suggestions */}
                <Card>
                  <CardContent className="pt-5">
                    <h4 className="font-semibold text-foreground mb-2">Handle Suggestions</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.handle_suggestions?.map((h: string, i: number) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => copyText(h)}>@{h}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Content Pillars & Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-5">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Content Pillars</h4>
                      <ul className="space-y-1">
                        {data.content_pillars?.map((p: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{p}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Posting Schedule</h4>
                      <p className="text-sm text-muted-foreground">{data.posting_schedule}</p>
                      <h4 className="font-semibold text-foreground mt-3 mb-1">Tone</h4>
                      <p className="text-sm text-muted-foreground">{data.tone_guidelines}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Hashtags */}
                <Card>
                  <CardContent className="pt-5">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Hash className="h-4 w-4 text-primary" /> Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.hashtags?.map((h: string, i: number) => (
                        <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => copyText(h)}>#{h}</Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => copyText(data.hashtags?.map((h: string) => `#${h}`).join(" "))}>
                      <Copy className="h-3 w-3 mr-1" /> Copy All Hashtags
                    </Button>
                  </CardContent>
                </Card>

                {/* Content Ideas */}
                <Card>
                  <CardContent className="pt-5">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Content Ideas</h4>
                    <div className="space-y-2">
                      {data.content_ideas?.map((idea: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary font-bold">{i + 1}.</span> {idea}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <Button variant="outline" onClick={() => setKit(null)} className="w-full mt-4">
            Generate Another Kit
          </Button>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default SocialMediaKit;
