import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dna, Users, Heart, Baby, Sparkles, Shield, Award, Check } from "lucide-react";
import { DNAUploadSection } from "@/components/dna/DNAUploadSection";
import { AncestralMemoryViewer } from "@/components/dna/AncestralMemoryViewer";
import { GeneticDatingSection } from "@/components/dna/GeneticDatingSection";
import { DigitalOffspringChat } from "@/components/dna/DigitalOffspringChat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  priceType: string;
  icon: any;
  features: string[];
  highlighted?: boolean;
}

const DNAMemoryNetwork = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const services: Service[] = [
    {
      id: "dna_analysis",
      title: "DNA Analysis",
      description: "Complete DNA analysis with AI-powered ancestral memory reconstruction",
      price: "€99",
      priceType: "one-time",
      icon: Dna,
      features: [
        "Complete genetic sequencing",
        "AI-reconstructed ancestral memories",
        "Heritage insights and reports",
        "Genetic health markers",
        "Interactive family tree",
      ],
    },
    {
      id: "ancestral_memories",
      title: "Ancestral Memories",
      description: "Access AI-generated memories and stories of your ancestors",
      price: "€12",
      priceType: "per month",
      icon: Sparkles,
      features: [
        "Monthly ancestral story updates",
        "AI-generated memory reconstructions",
        "Historical context integration",
        "Photo restoration & colorization",
        "Voice synthesis of ancestors",
      ],
      highlighted: true,
    },
    {
      id: "genetic_dating",
      title: "Genetic Dating",
      description: "Find your perfect DNA-compatible partner",
      price: "€15",
      priceType: "per month",
      icon: Heart,
      features: [
        "AI genetic compatibility matching",
        "Health trait compatibility",
        "Personality DNA alignment",
        "Offspring trait predictions",
        "Private & secure matching",
      ],
      highlighted: true,
    },
    {
      id: "digital_offspring",
      title: "Digital Offspring",
      description: "Create an AI clone with your genetic traits",
      price: "€149",
      priceType: "one-time",
      icon: Baby,
      features: [
        "Fully interactive AI personality",
        "Genetic trait inheritance model",
        "Voice and appearance generation",
        "Memory & learning capabilities",
        "Lifetime access & updates",
      ],
    },
  ];

  const handlePurchase = async (serviceType: string) => {
    try {
      setLoading(serviceType);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase this service",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-dna-memory-checkout', {
        body: { serviceType }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-gradient" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Powered by Advanced AI & Genetics</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              DNA Social Memory Network
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Unlock the secrets encoded in your DNA. Connect with your ancestral past, 
              find genetically compatible partners, and create your digital legacy.
            </p>
            <div className="flex flex-wrap gap-6 justify-center text-sm mb-10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>10K+ Users</span>
              </div>
            </div>
            
            {/* Detailed Description Card */}
            <Card className="max-w-4xl mx-auto text-left bg-card/80 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4 text-primary">What is DNA Social Memory Network?</h2>
                <p className="text-muted-foreground mb-6">
                  DNA Social Memory Network is a revolutionary AI-powered platform that combines cutting-edge genetic analysis with artificial intelligence to help you discover your ancestral heritage, find genetically compatible partners, and create a lasting digital legacy. Our advanced algorithms reconstruct ancestral memories and provide deep insights into your genetic makeup.
                </p>
                
                <h3 className="text-xl font-semibold mb-3">How to Use This Service:</h3>
                <ul className="space-y-3 text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span><strong>DNA Analysis (€99):</strong> Upload your genetic data or order a test kit. Receive complete sequencing, ancestral memory reconstruction, and an interactive family tree.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span><strong>Ancestral Memories (€12/month):</strong> Access AI-generated stories and memories of your ancestors, including photo restoration and voice synthesis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span><strong>Genetic Dating (€15/month):</strong> Find your perfect DNA-compatible partner through AI matching, health trait compatibility, and offspring predictions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span><strong>Digital Offspring (€149):</strong> Create a fully interactive AI personality that inherits your genetic traits with voice and appearance generation.</span>
                  </li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-3">Key Features:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Complete genetic sequencing analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>AI-reconstructed ancestral memories</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Photo restoration & colorization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Voice synthesis of ancestors</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Genetic compatibility matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Bank-level data security</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-6 italic">
                  Disclaimer: DNA Social Memory Network provides entertainment and educational insights based on genetic data analysis. Results are AI-generated interpretations and should not be used for medical decisions. This service does not replace professional genetic counseling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Your DNA Journey</h2>
            <p className="text-muted-foreground text-lg">Interactive tools to explore your genetic heritage</p>
          </div>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Dna className="h-4 w-4" />
                <span className="hidden sm:inline">DNA Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="memories" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Memories</span>
              </TabsTrigger>
              <TabsTrigger value="dating" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Dating</span>
              </TabsTrigger>
              <TabsTrigger value="offspring" className="flex items-center gap-2">
                <Baby className="h-4 w-4" />
                <span className="hidden sm:inline">Offspring</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analysis" className="mt-6">
              <DNAUploadSection />
            </TabsContent>
            <TabsContent value="memories" className="mt-6">
              <AncestralMemoryViewer />
            </TabsContent>
            <TabsContent value="dating" className="mt-6">
              <GeneticDatingSection />
            </TabsContent>
            <TabsContent value="offspring" className="mt-6">
              <DigitalOffspringChat />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your DNA Service</h2>
            <p className="text-muted-foreground text-lg">Unlock the power of your genetic code</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    service.highlighted 
                      ? 'border-primary/50 shadow-lg shadow-primary/20' 
                      : ''
                  }`}
                >
                  {service.highlighted && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-bold text-primary">
                          {service.price}
                        </span>
                        <span className="text-muted-foreground">
                          {service.priceType}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="mt-0.5 p-1 rounded-full bg-primary/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={() => handlePurchase(service.id)}
                      disabled={loading === service.id}
                      className="w-full"
                      variant={service.highlighted ? "default" : "outline"}
                    >
                      {loading === service.id ? "Processing..." : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose DNA Memory Network?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-muted-foreground">
                Your genetic data is encrypted and protected with military-grade security
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Advanced machine learning algorithms analyze your genetic code
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Community</h3>
              <p className="text-muted-foreground">
                Join thousands discovering their heritage and finding connections
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DNAMemoryNetwork;
