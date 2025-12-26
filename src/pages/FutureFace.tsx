import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFutureFaceSubscription } from "@/hooks/useFutureFaceSubscription";
import { 
  Upload, 
  Loader2, 
  Clock, 
  Heart, 
  AlertTriangle, 
  Check, 
  Sparkles,
  Users,
  Building2,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

const FutureFace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const subscription = useFutureFaceSubscription();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [yearsForward, setYearsForward] = useState(20);
  const [loading, setLoading] = useState(false);
  const [healthyImage, setHealthyImage] = useState<string | null>(null);
  const [unhealthyImage, setUnhealthyImage] = useState<string | null>(null);
  const [antiAgingTips, setAntiAgingTips] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 10MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setHealthyImage(null);
      setUnhealthyImage(null);
      setAntiAgingTips("");
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error("No image selected");

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('beauty-photos')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('beauty-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleGenerateBasic = async () => {
    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload a selfie first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImage();

      const { data, error } = await supabase.functions.invoke('generate-future-face', {
        body: {
          imageUrl,
          yearsForward,
          includeComparison: false
        }
      });

      if (error) throw error;

      setHealthyImage(data.progression.healthyImageUrl);
      
      toast({
        title: "Success!",
        description: "Your future face has been generated",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePremium = async () => {
    if (!imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload a selfie first",
        variant: "destructive",
      });
      return;
    }

    if (!subscription.hasPremium && !subscription.hasFamily && !subscription.hasCorporate) {
      toast({
        title: "Premium required",
        description: "Please purchase premium to access lifestyle comparison",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImage();

      const { data, error } = await supabase.functions.invoke('generate-future-face', {
        body: {
          imageUrl,
          yearsForward,
          includeComparison: true
        }
      });

      if (error) throw error;

      setHealthyImage(data.progression.healthyImageUrl);
      setUnhealthyImage(data.progression.unhealthyImageUrl);
      setAntiAgingTips(data.progression.antiAgingTips);
      
      toast({
        title: "Success!",
        description: "Your premium future face comparison has been generated",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '€2.99',
      priceId: 'price_1SQMOiGaXSfGtYFtG9pyLN4y',
      description: 'One-time purchase',
      features: [
        '1 photo analysis',
        'Basic age progression',
        'See your future self',
        'Instant results'
      ],
      icon: Clock,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'premium',
      name: 'Premium HD',
      price: '€9.99',
      priceId: 'price_1SQMP40QTWhd4oRpNUwVVsDe',
      description: 'One-time purchase',
      features: [
        'HD quality results',
        'Lifestyle comparison',
        'Healthy vs Unhealthy',
        'Anti-aging tips',
        'Detailed analysis'
      ],
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: '€19.99/mo',
      priceId: 'price_1SQMBTGaXSfGtYFt64xGyUBq',
      description: 'Monthly subscription',
      features: [
        'Up to 5 family members',
        'Unlimited generations',
        'Monthly progress tracking',
        'Family health insights',
        'Premium features included'
      ],
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'corporate',
      name: 'Corporate Wellness',
      price: '€499/mo',
      priceId: 'price_1SQMCJGaXSfGtYFtIXBEUX31',
      description: 'Monthly subscription',
      features: [
        'Unlimited employees',
        'Wellness dashboard',
        'Health motivation tool',
        'Analytics & reporting',
        'Priority support',
        'Custom branding'
      ],
      icon: Building2,
      color: 'from-orange-500 to-red-500'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="space-y-6">
            <Badge className="bg-gradient-primary text-white">Authentication Required</Badge>
            <h1 className="text-4xl md:text-6xl font-bold">
              Please <span className="bg-gradient-primary bg-clip-text text-transparent">Sign In</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You need to be logged in to access Future Face
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-16 sm:pt-24 pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-16 space-y-4 sm:space-y-6">
          <Badge className="bg-gradient-primary text-white mb-2 sm:mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Age Prediction
          </Badge>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6">
            Future <span className="bg-gradient-primary bg-clip-text text-transparent">Face</span>
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Discover how you'll look in <span className="text-primary font-semibold">10, 20, or 50 years</span> with AI-powered age progression. 
            See the dramatic difference between healthy and unhealthy lifestyle choices.
          </p>
        </div>

        {/* How It Works */}
        <Card className="mb-8 sm:mb-16 border-2 border-primary/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-3xl flex items-center gap-2">
              <Zap className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
              How It Works
            </CardTitle>
            <CardDescription className="text-sm sm:text-lg">Simple 3-step process to see your future</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-8">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-xs sm:text-xl">Upload Selfie</h3>
                <p className="text-muted-foreground text-xs sm:text-base hidden sm:block">Upload a clear photo of your face</p>
              </div>
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-xs sm:text-xl">Choose Years</h3>
                <p className="text-muted-foreground text-xs sm:text-base hidden sm:block">Select how many years into the future</p>
              </div>
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center text-white text-lg sm:text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-xs sm:text-xl">See Results</h3>
                <p className="text-muted-foreground text-xs sm:text-base hidden sm:block">View your future with healthy vs unhealthy lifestyle</p>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="mt-8 pt-6 border-t border-primary/10">
              <h4 className="font-semibold text-lg mb-4 text-primary">About Future Face Technology</h4>
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                <p>
                  <strong className="text-foreground">What is Future Face?</strong> Future Face is an advanced AI-powered age progression tool that uses cutting-edge machine learning algorithms to predict how your face will age over the next 10 to 50 years. Our technology analyzes facial features, skin texture, bone structure, and aging patterns to create photorealistic representations of your future self.
                </p>
                <p>
                  <strong className="text-foreground">How does it work?</strong> Simply upload a clear selfie photo of your face. Our AI processes the image, identifying key facial landmarks and features. It then applies scientifically-backed aging models that account for natural changes in skin elasticity, wrinkle formation, fat redistribution, and bone density changes that occur over time.
                </p>
                <p>
                  <strong className="text-foreground">Healthy vs Unhealthy Comparison (Premium):</strong> The premium feature shows you two possible futures - one where you maintain a healthy lifestyle (proper nutrition, exercise, skincare, adequate sleep, no smoking) and another showing the effects of unhealthy habits (poor diet, lack of exercise, sun damage, smoking, stress). This powerful visual comparison serves as motivation for making better lifestyle choices today.
                </p>
                <p>
                  <strong className="text-foreground">Who can use it?</strong> Future Face is designed for individuals curious about their aging process, health-conscious people seeking motivation, wellness coaches, dermatologists, and corporate wellness programs. It's also popular for entertainment purposes at events and parties.
                </p>
                <p>
                  <strong className="text-foreground">Privacy & Security:</strong> Your photos are processed securely and are never stored permanently. We use end-to-end encryption and comply with GDPR regulations. Your images are deleted from our servers within 24 hours of processing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-16">
          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="p-3 sm:p-6">
              <Heart className="h-6 w-6 sm:h-10 sm:w-10 text-red-500 mb-1 sm:mb-2" />
              <CardTitle className="text-sm sm:text-base">Health Motivation</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-muted-foreground text-xs sm:text-sm">
                See the visual impact of lifestyle choices on your aging process
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="p-3 sm:p-6">
              <TrendingUp className="h-6 w-6 sm:h-10 sm:w-10 text-green-500 mb-1 sm:mb-2" />
              <CardTitle className="text-sm sm:text-base">Track Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Monthly updates to see how your healthy choices are paying off
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="p-3 sm:p-6">
              <Shield className="h-6 w-6 sm:h-10 sm:w-10 text-blue-500 mb-1 sm:mb-2" />
              <CardTitle className="text-sm sm:text-base">Science-Backed</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-muted-foreground text-xs sm:text-sm">
                AI trained on real aging patterns and lifestyle impact data
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader className="p-3 sm:p-6">
              <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 text-purple-500 mb-1 sm:mb-2" />
              <CardTitle className="text-sm sm:text-base">Photorealistic</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-muted-foreground text-xs sm:text-sm">
                High-quality, realistic results powered by advanced AI
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Generator Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Generate Your Future Face</CardTitle>
            <CardDescription>Upload a selfie and see how you'll age</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/60 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-12 w-12 text-primary" />
                    <div className="text-center">
                      <p className="text-lg font-medium">Click to upload selfie</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </label>

              {imagePreview && (
                <div className="flex justify-center">
                  <img src={imagePreview} alt="Preview" className="max-w-xs rounded-lg shadow-lg" />
                </div>
              )}
            </div>

            {/* Years Selector */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Years Forward: {yearsForward}</span>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="10"
                  value={yearsForward}
                  onChange={(e) => setYearsForward(Number(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10 years</span>
                  <span>20 years</span>
                  <span>30 years</span>
                  <span>40 years</span>
                  <span>50 years</span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={handleGenerateBasic}
                disabled={loading || !imageFile}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    Generate Basic
                  </>
                )}
              </Button>

              <Button
                size="lg"
                onClick={handleGeneratePremium}
                disabled={loading || !imageFile}
                variant="premium"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Premium Comparison
                  </>
                )}
              </Button>
            </div>

            {/* Results Display */}
            {(healthyImage || unhealthyImage) && (
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-2xl font-bold text-center">Your Future Face</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {healthyImage && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Heart className="h-5 w-5" />
                        <span className="font-semibold">Healthy Lifestyle</span>
                      </div>
                      <img src={healthyImage} alt="Healthy aging" className="w-full rounded-lg shadow-xl" />
                      <p className="text-sm text-center text-muted-foreground">
                        Result of good nutrition, exercise & self-care
                      </p>
                    </div>
                  )}

                  {unhealthyImage && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-semibold">Unhealthy Lifestyle</span>
                      </div>
                      <img src={unhealthyImage} alt="Unhealthy aging" className="w-full rounded-lg shadow-xl" />
                      <p className="text-sm text-center text-muted-foreground">
                        Result of poor diet, lack of exercise & stress
                      </p>
                    </div>
                  )}
                </div>

                {antiAgingTips && (
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Your Personalized Anti-Aging Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-sm leading-relaxed">{antiAgingTips}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground">Unlock the full potential of Future Face</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-primary/20'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "premium" : "default"}
                    onClick={() => subscription.createCheckout(plan.priceId, plan.id as any)}
                    disabled={subscription.loading}
                  >
                    {subscription.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FutureFace;
