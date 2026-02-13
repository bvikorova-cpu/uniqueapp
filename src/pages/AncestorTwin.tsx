import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Users, Dna, Image as ImageIcon, Crown, Calendar, Check, CreditCard, Upload, History, ImagePlus, Loader2, ScanFace, X } from "lucide-react";
import { useAncestorTwin } from "@/hooks/useAncestorTwin";

const AncestorTwin = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'extended' | 'heritage'>('basic');
  
  const { 
    subscription, 
    loading, 
    matchResults,
    findMatches,
    createCheckout,
  } = useAncestorTwin();

  const handlePurchase = async (tier: string, priceId: string) => {
    const url = await createCheckout(tier, priceId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFindMatches = async () => {
    if (!selectedFile) {
      toast.error("Please upload a photo first");
      return;
    }
    setIsAnalyzing(true);
    try {
      await findMatches(selectedFile, selectedTier);
      toast.success("Matches found! Check your results below.");
    } catch (error) {
      toast.error("Failed to find matches. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pricingTiers = [
    {
      id: 'basic' as const,
      name: 'Basic Match',
      price: '€1.99',
      priceId: 'price_1T0KZIGaXSfGtYFtzLeZROU7',
      icon: Users,
      features: ['1 historical double', 'Celebrity match', 'Instant results', 'Downloadable photo'],
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/50'
    },
    {
      id: 'extended' as const,
      name: 'Extended Match',
      price: '€6.99',
      priceId: 'price_1T0KZLGaXSfGtYFtHo4Rywlh',
      icon: Sparkles,
      popular: true,
      features: ['10 historical doubles', 'Celebrity & artwork matches', 'Historical biographies', 'Similarity percentage', 'HD downloads'],
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/50'
    },
    {
      id: 'heritage' as const,
      name: 'DNA Heritage Report',
      price: '€14.99',
      priceId: 'price_1T0KZNGaXSfGtYFtrNPfNMlR',
      icon: Dna,
      features: ['Full ancestry integration', '20+ historical matches', 'DNA heritage analysis', 'Geographic origins', 'Royal lineage check', 'Premium report PDF'],
      color: 'from-pink-500/20 to-red-500/20',
      borderColor: 'border-pink-500/50'
    },
    {
      id: 'art_print' as const,
      name: 'Renaissance Art Print',
      price: '€49.99',
      priceId: 'price_1T0KZOGaXSfGtYFtgzk1hp2L',
      icon: ImageIcon,
      features: ['Your face in Renaissance style', 'Physical canvas print (50x70cm)', 'AI-generated artwork', 'Museum-quality framing', 'International shipping', 'Certificate of authenticity'],
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/50'
    }
  ];

  const subscriptionPlan = {
    name: 'Premium Subscription',
    price: '€7.99/month',
    priceId: 'price_1T0KZkGaXSfGtYFtLCYo8lzm',
    icon: Crown,
    features: ['Weekly new matches', 'AI avatars in historical costumes', 'Unlimited basic matches', 'Priority processing', 'Exclusive historical periods', 'Access to member gallery', '50% off physical prints'],
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/50'
  };

  const hasAccess = subscription?.hasSubscription;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-12 w-12 text-primary animate-pulse" />
            <Sparkles className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Ancestor Twin Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your celebrity double from history! Find your lookalike among historical figures, celebrities, and famous artworks.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {hasAccess && (
              <Button variant="outline" size="sm" onClick={() => navigate("/subscription-management")} className="gap-2">
                <CreditCard className="h-4 w-4" /> Manage Subscription
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/ancestor-twin/history")} className="gap-2">
              <History className="h-4 w-4" /> My Match History
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/ancestor-twin/gallery")} className="gap-2">
              <ImagePlus className="h-4 w-4" /> Public Gallery
            </Button>
          </div>
        </div>

        {/* Upload & Find Section — always visible */}
        <Card className="max-w-3xl mx-auto mb-12 p-8 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <ScanFace className="h-7 w-7 text-primary" />
            Find Your Historical Twin
          </h2>

          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Your photo" className="w-48 h-48 object-cover rounded-xl border-2 border-primary/50 shadow-lg" />
                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full" onClick={clearPhoto}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-48 h-48 border-2 border-dashed border-primary/50 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <Upload className="h-10 w-10 text-primary/60" />
                <span className="text-sm text-muted-foreground font-medium">Upload Photo</span>
              </button>
            )}

            {previewUrl && (
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Change Photo
              </Button>
            )}
          </div>

          {/* Tier selector */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground text-center mb-3">Select match type:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(['basic', 'extended', 'heritage'] as const).map((tier) => (
                <Button
                  key={tier}
                  variant={selectedTier === tier ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTier(tier)}
                  className="capitalize"
                >
                  {tier === 'basic' && '1 Match'}
                  {tier === 'extended' && '10 Matches'}
                  {tier === 'heritage' && '20+ Matches'}
                </Button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <Button
            onClick={handleFindMatches}
            disabled={!selectedFile || isAnalyzing}
            size="lg"
            className="w-full gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing your face...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Find My Historical Twin
              </>
            )}
          </Button>

          {!hasAccess && (
            <p className="text-xs text-center text-muted-foreground mt-3">
              Credits required — purchase a package below or subscribe for unlimited basic matches.
            </p>
          )}
        </Card>

        {/* Match Results */}
        {matchResults && matchResults.matches.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-6">Your Historical Matches</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchResults.matches.map((match, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {match.imageUrl && (
                    <img src={match.imageUrl} alt={match.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{match.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{match.era}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${match.similarity}%` }} />
                      </div>
                      <span className="text-sm font-bold text-primary">{match.similarity}%</span>
                    </div>
                    {match.bio && <p className="text-xs text-muted-foreground line-clamp-3">{match.bio}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Package</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card key={tier.id} className={`p-6 relative bg-gradient-to-br ${tier.color} border-2 ${tier.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">MOST POPULAR</Badge>
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
                  <Button onClick={() => handlePurchase(tier.id, tier.priceId)} className="w-full" variant={tier.popular ? "default" : "outline"}>
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
            {hasAccess && subscription.subscriptionEnd && (
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
          <Button onClick={() => handlePurchase('subscription', subscriptionPlan.priceId)} size="lg" className="w-full gap-2" disabled={hasAccess}>
            {hasAccess ? (
              <><Check className="h-5 w-5" /> Active Subscription</>
            ) : (
              <><Crown className="h-5 w-5" /> Subscribe Now</>
            )}
          </Button>
        </Card>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Upload, title: '1. Upload Your Photo', desc: 'Upload a clear photo of your face for the best results' },
              { icon: Sparkles, title: '2. AI Analysis', desc: 'Our AI scans thousands of historical figures and artworks' },
              { icon: Users, title: '3. Find Your Twin', desc: 'Discover your historical lookalikes with similarity scores' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AncestorTwin;
