import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Users, Dna, Image as ImageIcon, Crown, Calendar, Check, Upload, CreditCard } from "lucide-react";
import { useAncestorTwin } from "@/hooks/useAncestorTwin";

const AncestorTwin = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { 
    subscription, 
    loading, 
    findMatches, 
    createCheckout,
    matchResults
  } = useAncestorTwin();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFindMatches = async (tier: 'basic' | 'extended' | 'heritage') => {
    if (!uploadedImage) {
      toast.error("Please upload your photo first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await findMatches(uploadedImage, tier);
      if (result) {
        toast.success(`Found ${result.matches.length} historical matches!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to find matches");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePurchase = async (tier: string, priceInCents: number) => {
    const url = await createCheckout(tier, priceInCents);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic Match',
      price: '€1.99',
      priceInCents: 199,
      icon: Users,
      features: [
        '1 historical double',
        'Celebrity match',
        'Instant results',
        'Downloadable photo'
      ],
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/50'
    },
    {
      id: 'extended',
      name: 'Extended Match',
      price: '€6.99',
      priceInCents: 699,
      icon: Sparkles,
      popular: true,
      features: [
        '10 historical doubles',
        'Celebrity & artwork matches',
        'Historical biographies',
        'Similarity percentage',
        'HD downloads'
      ],
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50'
    },
    {
      id: 'heritage',
      name: 'DNA Heritage Report',
      price: '€14.99',
      priceInCents: 1499,
      icon: Dna,
      features: [
        'Full ancestry integration',
        '20+ historical matches',
        'DNA heritage analysis',
        'Geographic origins',
        'Royal lineage check',
        'Premium report PDF'
      ],
      color: 'from-pink-500/20 to-red-500/20',
      borderColor: 'border-pink-500/50'
    },
    {
      id: 'art_print',
      name: 'Renaissance Art Print',
      price: '€49.99',
      priceInCents: 4999,
      icon: ImageIcon,
      features: [
        'Your face in Renaissance style',
        'Physical canvas print (50x70cm)',
        'AI-generated artwork',
        'Museum-quality framing',
        'International shipping',
        'Certificate of authenticity'
      ],
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/50'
    }
  ];

  const subscriptionPlan = {
    name: 'Premium Subscription',
    price: '€7.99/month',
    priceInCents: 799,
    icon: Crown,
    features: [
      'Weekly new matches',
      'AI avatars in historical costumes',
      'Unlimited basic matches',
      'Priority processing',
      'Exclusive historical periods',
      'Access to member gallery',
      '50% off physical prints'
    ],
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/50'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="h-12 w-12 text-primary animate-pulse" />
              <Sparkles className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Ancestor Twin Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your celebrity double from history! Find your lookalike among historical figures, celebrities, and famous artworks.
          </p>
          {subscription?.hasSubscription && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/subscription-management")}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Spravovať predplatné
              </Button>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <Card className="max-w-2xl mx-auto p-8 mb-12 bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/20">
          <div className="text-center space-y-6">
            <Upload className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Upload Your Photo</h2>
            <p className="text-muted-foreground">
              Upload a clear photo of your face to find your historical twin
            </p>
            
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="max-w-md mx-auto"
            />

            {previewUrl && (
              <div className="mt-6">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-xs mx-auto rounded-lg shadow-lg border-2 border-primary/30"
                />
              </div>
            )}

            {subscription?.hasSubscription && uploadedImage && (
              <Button
                onClick={() => handleFindMatches('extended')}
                disabled={isAnalyzing}
                size="lg"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Find My Historical Twin (Free)
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Results Section */}
        {matchResults && matchResults.matches.length > 0 && (
          <Card className="max-w-4xl mx-auto p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Historical Matches</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchResults.matches.map((match, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg mb-3 flex items-center justify-center">
                    <Users className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{match.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{match.era}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {match.similarity}% Match
                    </span>
                    {match.bio && (
                      <Button variant="ghost" size="sm">Details</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Pricing Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Package</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card
                  key={tier.id}
                  className={`p-6 relative bg-gradient-to-br ${tier.color} border-2 ${tier.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <Icon className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-primary mb-4">{tier.price}</div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => uploadedImage ? handleFindMatches(tier.id as any) : handlePurchase(tier.id, tier.priceInCents)}
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {uploadedImage ? `Analyze (${tier.price})` : `Purchase`}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Subscription Section */}
        <Card className={`max-w-4xl mx-auto p-8 bg-gradient-to-br ${subscriptionPlan.color} border-2 ${subscriptionPlan.borderColor}`}>
          <div className="text-center mb-6">
            <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500 animate-pulse" />
            <h2 className="text-3xl font-bold mb-2">{subscriptionPlan.name}</h2>
            <div className="text-4xl font-bold text-primary mb-4">{subscriptionPlan.price}</div>
            {subscription?.hasSubscription && subscription.subscriptionEnd && (
              <p className="text-sm text-green-600 font-semibold">
                Active until {new Date(subscription.subscriptionEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {subscriptionPlan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => handlePurchase('subscription', subscriptionPlan.priceInCents)}
            size="lg"
            className="w-full gap-2"
            disabled={subscription?.hasSubscription}
          >
            {subscription?.hasSubscription ? (
              <>
                <Check className="h-5 w-5" />
                Active Subscription
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" />
                Subscribe Now
              </>
            )}
          </Button>
        </Card>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Upload Your Photo</h3>
              <p className="text-muted-foreground text-sm">
                Upload a clear photo of your face for the best results
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Our AI scans thousands of historical figures and artworks
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Find Your Twin</h3>
              <p className="text-muted-foreground text-sm">
                Discover your historical lookalikes with similarity scores
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AncestorTwin;
