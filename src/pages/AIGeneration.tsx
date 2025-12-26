import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Wand2, Download, Loader2, CreditCard, Lightbulb, ImageIcon, Zap, Shield, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";

const AIGeneration = () => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customGeneratedImage, setCustomGeneratedImage] = useState<string | null>(null);
  
  const { credits, useCredit, refresh } = useAICredits();
  const navigate = useNavigate();

  const handleGenerateCustomImage = async () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter an image description!");
      return;
    }

    if (credits.credits_remaining <= 0) {
      toast.error("You don't have enough AI credits!", {
        action: {
          label: "Buy credits",
          onClick: () => navigate('/ai-credits-store')
        }
      });
      return;
    }

    setIsGeneratingCustom(true);
    setCustomGeneratedImage(null);

    try {
      const creditUsed = await useCredit('custom_generation', `Generated custom image: ${customPrompt.substring(0, 50)}`);
      
      if (!creditUsed) {
        toast.error("Failed to use AI credit");
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-custom-image', {
        body: { prompt: customPrompt }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCustomGeneratedImage(data.imageUrl);
      toast.success("Image successfully generated!");
      await refresh();

    } catch (error) {
      console.error('Error generating custom image:', error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Image Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning, unique images from text descriptions using advanced AI technology
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="font-semibold">{credits.credits_remaining} credits available</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/ai-credits-store')}
            >
              Buy more credits
            </Button>
          </div>
        </div>

        {/* Custom Image Generation Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Custom AI Generation
              </CardTitle>
              <CardDescription>
                Create a completely new image using AI based on your description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="custom-prompt" className="text-sm font-medium">
                  Describe the image you want to create
                </label>
                <textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="For example: Beautiful sunset over mountains, realistic style, high quality..."
                  className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isGeneratingCustom}
                />
              </div>
              
              <Button
                onClick={handleGenerateCustomImage}
                disabled={isGeneratingCustom || !customPrompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGeneratingCustom ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating image...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Image (1 credit)
                  </>
                )}
              </Button>

              {customGeneratedImage && (
                <div className="mt-6 border rounded-lg p-4 bg-background">
                  <div className="relative group">
                    <img
                      src={customGeneratedImage}
                      alt="Generated image"
                      className="w-full rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = customGeneratedImage;
                        link.download = `ai-generated-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Image is downloading!");
                      }}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                How does it work?
              </CardTitle>
              <CardDescription>
                A complete guide to generating AI images with our platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Step by Step Guide */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Write Your Prompt</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe the image you want to create in the text area above. Be as detailed as possible for best results.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Generate Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Generate Image" button and wait a few seconds while our AI creates your unique artwork.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Download & Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Once generated, hover over the image and click download to save it to your device.
                  </p>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-6 pt-6 border-t">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    What is AI Image Generation?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI Image Generation is a cutting-edge technology that uses artificial intelligence to create unique, 
                    high-quality images based on text descriptions (prompts). Our platform leverages state-of-the-art 
                    OpenAI's GPT-Image model to transform your ideas into stunning visual artwork. Whether you need 
                    illustrations, concept art, realistic photos, or creative designs, our AI can generate them in seconds.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Tips for Better Results
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Be specific:</strong> Instead of "a cat", try "a fluffy orange tabby cat sitting on a windowsill at sunset, photorealistic style"
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Include art style:</strong> Mention styles like "watercolor", "oil painting", "digital art", "photorealistic", "anime", or "3D render"
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Add lighting details:</strong> Describe lighting like "golden hour", "studio lighting", "neon lights", or "dramatic shadows"
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Specify quality:</strong> Add terms like "high quality", "detailed", "4K", "ultra realistic" for better output
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Describe composition:</strong> Include camera angles like "close-up", "wide shot", "bird's eye view", or "portrait orientation"
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Credit System & Pricing
                  </h3>
                  <div className="bg-secondary/30 rounded-lg p-4">
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Each image generation costs <strong className="text-foreground">1 credit</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Credits never expire and can be used across all AI features
                      </li>
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Purchase additional credits from the <button onClick={() => navigate('/ai-credits-store')} className="text-primary hover:underline font-medium">AI Credits Store</button>
                      </li>
                      <li className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Generated images are 1024x1024 pixels in WebP format
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Example Prompts</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "A majestic lion with a galaxy mane, cosmic background, digital art, vibrant colors",
                      "Cozy coffee shop interior, rainy day outside, warm lighting, watercolor painting style",
                      "Futuristic city skyline at night, neon lights, cyberpunk aesthetic, 4K detailed",
                      "Enchanted forest with glowing mushrooms, fairy tale atmosphere, magical lighting",
                      "Vintage sports car driving through mountain road, sunset, photorealistic",
                      "Abstract geometric patterns with gold and marble textures, luxury design"
                    ].map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setCustomPrompt(prompt)}
                        className="text-left p-3 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-sm text-muted-foreground"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Click any example to use it as your prompt
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIGeneration;
