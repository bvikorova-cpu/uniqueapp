import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Users, Dna, Image as ImageIcon, Crown, Calendar, Check, CreditCard, Upload, History, ImagePlus } from "lucide-react";
import { useAncestorTwin } from "@/hooks/useAncestorTwin";

const AncestorTwin = () => {
  const navigate = useNavigate();
  
  const { 
    subscription, 
    loading, 
    createCheckout,
  } = useAncestorTwin();

  const handlePurchase = async (tier: string, priceId: string) => {
    const url = await createCheckout(tier, priceId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic Match',
      price: '€1.99',
      priceId: 'price_1T0KZIGaXSfGtYFtzLeZROU7',
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
      priceId: 'price_1T0KZLGaXSfGtYFtHo4Rywlh',
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
      priceId: 'price_1T0KZNGaXSfGtYFtrNPfNMlR',
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
      priceId: 'price_1T0KZOGaXSfGtYFtgzk1hp2L',
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
    priceId: 'price_1T0KZkGaXSfGtYFtLCYo8lzm',
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover your celebrity double from history! Find your lookalike among historical figures, celebrities, and famous artworks.
          </p>
          
          {/* Detailed Description */}
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto text-left border border-border/50">
            <h2 className="text-xl font-bold mb-4 text-center">About Ancestor Twin Finder</h2>
            <p className="text-muted-foreground mb-4">
              Ever wondered if you have a historical doppelgänger? Ancestor Twin Finder uses advanced AI facial recognition technology to analyze your facial features and match them with thousands of historical figures, celebrities, and famous artworks from throughout history.
            </p>
            
            <h3 className="font-semibold mb-2">How to Use:</h3>
            <ul className="text-muted-foreground space-y-2 mb-4 list-disc list-inside">
              <li><strong>Upload a Photo:</strong> Take or upload a clear, front-facing photo of yourself with good lighting</li>
              <li><strong>Choose a Package:</strong> Select from Basic (1 match), Extended (10 matches), or DNA Heritage (20+ matches with ancestry analysis)</li>
              <li><strong>Get Your Matches:</strong> Our AI analyzes your facial structure, features, and characteristics to find your historical lookalikes</li>
              <li><strong>View Results:</strong> See your matches with similarity percentages, historical biographies, and downloadable photos</li>
            </ul>
            
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Match with famous historical figures, royalty, artists, and celebrities</li>
              <li>Get detailed similarity scores and facial feature analysis</li>
              <li>Learn about your matches through historical biographies</li>
              <li>Download high-quality comparison images</li>
              <li>Optional: Order a Renaissance-style art print of yourself on canvas</li>
              <li>Premium subscribers get weekly new matches and AI avatars in historical costumes</li>
            </ul>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {subscription?.hasSubscription && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/subscription-management")}
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Manage Subscription
            </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/ancestor-twin/history")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              My Match History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/ancestor-twin/gallery")}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Public Gallery
            </Button>
          </div>
        </div>

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
                    onClick={() => handlePurchase(tier.id, tier.priceId)}
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    Purchase
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
            onClick={() => handlePurchase('subscription', subscriptionPlan.priceId)}
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
