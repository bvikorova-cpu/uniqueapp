import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Video, Download, Sparkles, Star, Zap, Crown, Lock, Lightbulb, Target, Film, CheckCircle2, CreditCard, FileText } from "lucide-react";
import { useVideoAdCredits } from "@/hooks/useVideoAdCredits";

interface VideoAdResult {
  title: string;
  script: string;
  scenes: Array<{
    duration: string;
    description: string;
    voiceover: string;
    visuals: string;
  }>;
  callToAction: string;
  musicSuggestion: string;
  targetEmotions: string[];
  competitiveAnalysis?: string;
  abTestVariants?: Array<{ title: string; tagline: string }>;
  voiceActors?: Array<{ name: string; style: string }>;
  budgetBreakdown?: { production: number; distribution: number; total: number };
  translations?: Record<string, any>;
  performancePrediction?: { reach: string; engagement: string; conversion: string };
}

const VideoAdGenerator = () => {
  const { credits, isLoading: creditsLoading, generateVideoAd, isGenerating, getTierLimits, calculateCreditCost } = useVideoAdCredits();
  const [formData, setFormData] = useState({
    product: "",
    targetAudience: "",
    keyMessage: "",
    tone: "professional",
    duration: "30",
    platform: "youtube"
  });
  
  const [premiumFeatures, setPremiumFeatures] = useState({
    competitiveAnalysis: false,
    abTesting: false,
    voiceActorSuggestions: false,
    budgetOptimizer: false,
    multiLanguage: [] as string[],
    storyboardExport: false,
    brandVoiceMatching: false,
    performancePredictions: false,
  });
  
  const [result, setResult] = useState<VideoAdResult | null>(null);

  const tier = credits?.tier || 'free';
  const tierLimits = getTierLimits(tier);
  const estimatedCost = calculateCreditCost({ 
    productService: formData.product,
    targetAudience: formData.targetAudience,
    keyMessage: formData.keyMessage,
    tone: formData.tone,
    duration: parseInt(formData.duration),
    platform: formData.platform,
    premiumFeatures 
  });

  const handleGenerate = async () => {
    if (!formData.product || !formData.targetAudience || !formData.keyMessage) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!credits || credits.credits_remaining < estimatedCost) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    if (parseInt(formData.duration) > tierLimits.maxDuration) {
      toast.error(`Maximum duration for ${tier} tier is ${tierLimits.maxDuration} seconds`);
      return;
    }

    try {
      const data = await generateVideoAd({
        productService: formData.product,
        targetAudience: formData.targetAudience,
        keyMessage: formData.keyMessage,
        tone: formData.tone,
        duration: parseInt(formData.duration),
        platform: formData.platform,
        premiumFeatures
      });
      setResult(data as VideoAdResult);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadScript = () => {
    if (!result) return;
    
    let content = `
${result.title}
${'='.repeat(result.title.length)}

SCRIPT:
${result.script}

SCENES:
${result.scenes.map((scene, i) => `
Scene ${i + 1} (${scene.duration})
Description: ${scene.description}
Voiceover: ${scene.voiceover}
Visuals: ${scene.visuals}
`).join('\n')}

CALL TO ACTION:
${result.callToAction}

MUSIC: ${result.musicSuggestion}
EMOTIONS: ${result.targetEmotions.join(', ')}
    `;

    if (result.competitiveAnalysis) {
      content += `\n\nCOMPETITIVE ANALYSIS:\n${result.competitiveAnalysis}`;
    }

    if (result.budgetBreakdown) {
      content += `\n\nBUDGET:\nProduction: ${result.budgetBreakdown.production} credits\nDistribution: ${result.budgetBreakdown.distribution} credits\nTotal: ${result.budgetBreakdown.total} credits`;
    }

    const blob = new Blob([content.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-ad-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPremiumFeature = (feature: keyof typeof premiumFeatures) => {
    if (tier === 'agency') return false;
    if (tier === 'pro' && ['competitiveAnalysis', 'abTesting', 'voiceActorSuggestions', 'budgetOptimizer'].includes(feature)) {
      return false;
    }
    return true;
  };

  const togglePremiumFeature = (feature: keyof typeof premiumFeatures) => {
    if (isPremiumFeature(feature)) {
      toast.error("This feature is only available in PRO/Agency plan");
      return;
    }
    setPremiumFeatures(prev => ({
      ...prev,
      [feature]: typeof prev[feature] === 'boolean' ? !prev[feature] : prev[feature]
    }));
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Video Ad Generator
            </h1>
            <div className="flex flex-col items-center md:items-end gap-1">
              {tier === 'free' && <Badge variant="outline">Free Plan</Badge>}
              {tier === 'pro' && <Badge className="bg-primary"><Star className="w-3 h-3 mr-1" />Pro Plan</Badge>}
              {tier === 'agency' && <Badge className="bg-gradient-to-r from-primary to-accent"><Crown className="w-3 h-3 mr-1" />Agency</Badge>}
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{credits?.credits_remaining || 0}</span> credits
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Create professional video scripts with AI • Cost: {estimatedCost} {estimatedCost === 1 ? 'credit' : 'credits'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Product/Service *</Label>
                <Input
                  id="product"
                  placeholder="e.g. Fitness app"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g. Young adults 18-30 years old"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="keyMessage">Key Message *</Label>
                <Textarea
                  id="keyMessage"
                  placeholder="What do you want to tell your customers?"
                  value={formData.keyMessage}
                  onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tone">Ad Tone</Label>
                <Select value={formData.tone} onValueChange={(val) => setFormData({ ...formData, tone: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="emotional">Emotional</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Select value={formData.duration} onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60" disabled={tier === 'free'}>60s {tier === 'free' && '🔒'}</SelectItem>
                      <SelectItem value="90" disabled={tier !== 'agency'}>90s {tier !== 'agency' && '🔒'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(val) => setFormData({ ...formData, platform: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tv">TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Premium Features */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Premium Features
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="competitive" 
                      checked={premiumFeatures.competitiveAnalysis}
                      onCheckedChange={() => togglePremiumFeature('competitiveAnalysis')}
                      disabled={isPremiumFeature('competitiveAnalysis')}
                    />
                    <Label htmlFor="competitive" className="text-sm flex items-center gap-1">
                      Competitive Analysis
                      {isPremiumFeature('competitiveAnalysis') && <Lock className="w-3 h-3" />}
                      <Badge variant="outline" className="ml-1">+2</Badge>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="abtesting" 
                      checked={premiumFeatures.abTesting}
                      onCheckedChange={() => togglePremiumFeature('abTesting')}
                      disabled={isPremiumFeature('abTesting')}
                    />
                    <Label htmlFor="abtesting" className="text-sm flex items-center gap-1">
                      A/B Testing Variants
                      {isPremiumFeature('abTesting') && <Lock className="w-3 h-3" />}
                      <Badge variant="outline" className="ml-1">+2</Badge>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="voice" 
                      checked={premiumFeatures.voiceActorSuggestions}
                      onCheckedChange={() => togglePremiumFeature('voiceActorSuggestions')}
                      disabled={isPremiumFeature('voiceActorSuggestions')}
                    />
                    <Label htmlFor="voice" className="text-sm flex items-center gap-1">
                      Voice Actor Suggestions
                      {isPremiumFeature('voiceActorSuggestions') && <Lock className="w-3 h-3" />}
                      <Badge variant="outline" className="ml-1">+2</Badge>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="budget" 
                      checked={premiumFeatures.budgetOptimizer}
                      onCheckedChange={() => togglePremiumFeature('budgetOptimizer')}
                      disabled={isPremiumFeature('budgetOptimizer')}
                    />
                    <Label htmlFor="budget" className="text-sm flex items-center gap-1">
                      Budget Optimizer
                      {isPremiumFeature('budgetOptimizer') && <Lock className="w-3 h-3" />}
                      <Badge variant="outline" className="ml-1">+2</Badge>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="performance" 
                      checked={premiumFeatures.performancePredictions}
                      onCheckedChange={() => togglePremiumFeature('performancePredictions')}
                      disabled={isPremiumFeature('performancePredictions')}
                    />
                    <Label htmlFor="performance" className="text-sm flex items-center gap-1">
                      Performance Predictions
                      {isPremiumFeature('performancePredictions') && <Lock className="w-3 h-3" />}
                      <Badge variant="outline" className="ml-1">+3</Badge>
                    </Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || creditsLoading}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate ({estimatedCost} {estimatedCost === 1 ? 'credit' : 'credits'})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Result
                </span>
                {result && (
                  <Button variant="outline" size="sm" onClick={downloadScript}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Fill out the form and generate your video ad</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                  <div>
                    <h3 className="font-bold text-lg mb-2">{result.title}</h3>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">📝 Complete Script:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.script}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">🎬 Scenes:</h4>
                    {result.scenes.map((scene, idx) => (
                      <Card key={idx} className="mb-3 bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="font-medium mb-2">
                            Scene {idx + 1} ({scene.duration})
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Description:</span> {scene.description}
                            </div>
                            <div>
                              <span className="font-medium">Voiceover:</span> "{scene.voiceover}"
                            </div>
                            <div>
                              <span className="font-medium">Visuals:</span> {scene.visuals}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {result.competitiveAnalysis && (
                    <div>
                      <h4 className="font-semibold mb-2">🔍 Competitive Analysis:</h4>
                      <p className="text-sm text-muted-foreground">{result.competitiveAnalysis}</p>
                    </div>
                  )}

                  {result.budgetBreakdown && (
                    <div>
                      <h4 className="font-semibold mb-2">💰 Budget:</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <div className="text-muted-foreground">Production</div>
                          <div className="font-bold">€{result.budgetBreakdown.production}</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="text-muted-foreground">Distribution</div>
                          <div className="font-bold">€{result.budgetBreakdown.distribution}</div>
                        </div>
                        <div className="p-2 bg-primary/10 rounded">
                          <div className="text-muted-foreground">Total</div>
                          <div className="font-bold">€{result.budgetBreakdown.total}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.performancePrediction && (
                    <div>
                      <h4 className="font-semibold mb-2">📊 Performance Predictions:</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Reach:</span> {result.performancePrediction.reach}</div>
                        <div><span className="font-medium">Engagement:</span> {result.performancePrediction.engagement}</div>
                        <div><span className="font-medium">Conversion:</span> {result.performancePrediction.conversion}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">📢 Call to Action:</h4>
                    <p className="text-sm">{result.callToAction}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">🎵 Music:</h4>
                      <p className="text-sm text-muted-foreground">{result.musicSuggestion}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">💭 Emotions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.targetEmotions.map((emotion, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                How does it work?
              </CardTitle>
              <CardDescription>
                A complete guide to creating professional video ad scripts with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Step by Step Guide */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Define Your Product</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your product or service name and describe your target audience.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Set Parameters</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose ad tone, duration, platform, and enable premium features if needed.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Generate Script</h3>
                  <p className="text-sm text-muted-foreground">
                    AI creates a complete video script with scenes, voiceovers, and visuals.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Download & Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your script and use it for video production or presentation.
                  </p>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-6 pt-6 border-t">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    What is Video Ad Generator?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The Video Ad Generator is a powerful AI-driven tool designed to help marketers, content creators, 
                    and businesses create professional video advertisement scripts in seconds. Using advanced natural 
                    language processing, it generates complete scripts including scene breakdowns, voiceover text, 
                    visual directions, music suggestions, and emotional targeting - everything you need to produce 
                    compelling video ads for any platform.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Key Features Explained
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-background">
                      <h4 className="font-semibold mb-2">Basic Settings</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Product/Service:</strong> The name of what you are advertising</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Target Audience:</strong> Demographics and interests of your ideal customers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Key Message:</strong> The main value proposition or benefit you want to communicate</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                      <h4 className="font-semibold mb-2">Advanced Options</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Ad Tone:</strong> Professional, casual, energetic, emotional, or humorous</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Duration:</strong> 15s, 30s, 60s, or 90s depending on your plan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Platform:</strong> Optimized for YouTube, Instagram, TikTok, Facebook, or TV</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Premium Features (Pro & Agency Plans)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Competitive Analysis</h4>
                        <p className="text-sm text-muted-foreground">Get insights on how your ad compares to industry competitors</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">A/B Testing Variants</h4>
                        <p className="text-sm text-muted-foreground">Receive multiple script variations to test performance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Voice Actor Suggestions</h4>
                        <p className="text-sm text-muted-foreground">AI recommends voice styles that match your brand</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Budget Optimizer</h4>
                        <p className="text-sm text-muted-foreground">Get production and distribution cost estimates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Performance Predictions</h4>
                        <p className="text-sm text-muted-foreground">AI-powered forecasts for reach, engagement, and conversions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <Star className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Multi-Language Support</h4>
                        <p className="text-sm text-muted-foreground">Generate scripts in multiple languages for global campaigns</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    What You Get in the Output
                  </h3>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span><strong className="text-foreground">Complete Script:</strong> Ready-to-use narration text for your video</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span><strong className="text-foreground">Scene Breakdown:</strong> Detailed descriptions of each scene with timing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span><strong className="text-foreground">Voiceover Text:</strong> Word-for-word script for voice recording</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span><strong className="text-foreground">Visual Directions:</strong> Guidance for videographers and editors</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span><strong className="text-foreground">Music Suggestions:</strong> Recommended background music style and mood</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span><strong className="text-foreground">Call-to-Action:</strong> Compelling CTA text to drive conversions</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Credit System & Plans
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border text-center">
                      <Badge variant="outline" className="mb-2">Free Plan</Badge>
                      <h4 className="font-semibold">1 credit per script</h4>
                      <p className="text-sm text-muted-foreground mt-2">Basic scripts up to 30 seconds for standard platforms</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-primary/5 text-center">
                      <Badge className="bg-primary mb-2">Pro Plan</Badge>
                      <h4 className="font-semibold">1+ credits per script</h4>
                      <p className="text-sm text-muted-foreground mt-2">Up to 60s duration with premium features available</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/10 to-accent/10 text-center">
                      <Badge className="bg-gradient-to-r from-primary to-accent mb-2">Agency</Badge>
                      <h4 className="font-semibold">All features unlocked</h4>
                      <p className="text-sm text-muted-foreground mt-2">90s videos, all premium features, priority processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoAdGenerator;
