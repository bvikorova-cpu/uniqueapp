import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Search, Shield, BookOpen, TrendingUp, Wrench, ExternalLink } from "lucide-react";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AntiqueAppraisal = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisType, setAnalysisType] = useState<string>('basic');
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  
  const { credits, isLoading, identifyAntique, isIdentifying, purchaseCredits } = useAntiqueCredits();

  // Check for payment success/cancel in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
      toast.success("Payment successful! Your credits will be added shortly.");
      // Remove payment param from URL
      window.history.replaceState({}, '', '/antique-appraisal');
    } else if (paymentStatus === 'canceled') {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, '', '/antique-appraisal');
    }
  }, []);

  const analysisOptions = [
    {
      type: 'basic',
      name: 'Basic Identification',
      icon: Search,
      credits: 3,
      description: 'Identify the item, period, and style',
      color: 'text-blue-500'
    },
    {
      type: 'valuation',
      name: 'Market Valuation',
      icon: TrendingUp,
      credits: 10,
      description: 'Estimate current market value',
      color: 'text-green-500'
    },
    {
      type: 'expert',
      name: 'Expert Report',
      icon: Sparkles,
      credits: 15,
      description: 'Complete analysis with history & value',
      color: 'text-purple-500',
      premium: true
    },
    {
      type: 'authenticity',
      name: 'Authenticity Check',
      icon: Shield,
      credits: 20,
      description: 'Verify authenticity & detect fakes',
      color: 'text-red-500',
      premium: true
    },
    {
      type: 'history',
      name: 'Historical Story',
      icon: BookOpen,
      credits: 3,
      description: 'AI-generated historical narrative',
      color: 'text-amber-500'
    },
    {
      type: 'restoration',
      name: 'Restoration Advice',
      icon: Wrench,
      credits: 3,
      description: 'Care and restoration recommendations',
      color: 'text-cyan-500'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('antiques')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('antiques')
        .getPublicUrl(fileName);

      // Call AI analysis
      identifyAntique({ imageUrl: publicUrl, analysisType }, {
        onSuccess: (data) => {
          setAnalysisResult(data.analysisResult);
          toast.success("Analysis complete!");
          
          // Save to database
          supabase.from('antiques').insert({
            user_id: user.id,
            image_url: publicUrl,
            analysis_type: analysisType,
            analysis_result: data.analysisResult,
            credits_used: data.creditsUsed
          });
        }
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error("Error uploading photo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-20 px-4">
      <AlertDialog open={!!stripeUrl} onOpenChange={() => setStripeUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Platba pripravená
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Kliknite na tlačidlo nižšie pre dokončenie platby cez Stripe:</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={() => {
                if (stripeUrl) {
                  window.open(stripeUrl, '_blank');
                }
              }}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Otvoriť Stripe Platbu
            </Button>
            <Button
              variant="outline"
              onClick={() => setStripeUrl(null)}
              className="w-full"
            >
              Zrušiť
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl font-bold mb-4">AI Antique Appraisal</h1>
          <p className="text-muted-foreground text-lg">
            Discover the history and value of your antiques with AI
          </p>
          <div className="mt-4 inline-block px-6 py-2 bg-primary/10 rounded-full">
            <p className="text-sm">
              Available credits: <span className="font-bold text-primary">{credits?.credits_remaining || 0}</span>
            </p>
          </div>
        </div>

        <Tabs defaultValue="analyze" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">New Analysis</TabsTrigger>
            <TabsTrigger value="collection">My Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-8">
            {/* Analysis Type Selection */}
            <div className="grid md:grid-cols-3 gap-4">
              {analysisOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card 
                    key={option.type}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      analysisType === option.type ? 'border-primary ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setAnalysisType(option.type)}
                  >
                    <CardHeader>
                      <Icon className={`w-8 h-8 mb-2 ${option.color}`} />
                      <CardTitle className="flex items-center gap-2">
                        {option.name}
                        {option.premium && (
                          <Badge variant="secondary" className="bg-gold text-gold-foreground">
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-bold text-primary">{option.credits} credits</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upload & Analysis */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Antique Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Antique" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-8">
                        <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Upload antique photo</p>
                        <label htmlFor="antique-upload">
                          <Button variant="outline" asChild>
                            <span>Select Photo</span>
                          </Button>
                        </label>
                        <input
                          id="antique-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </div>
                    )}
                  </div>
                  {selectedFile && (
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleAnalyze}
                      disabled={isIdentifying || !credits || credits.credits_remaining < 3}
                    >
                      {isIdentifying ? "Analyzing..." : `Analyze (${analysisOptions.find(o => o.type === analysisType)?.credits} credits)`}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px]">
                    {analysisResult ? (
                      <div className="space-y-4">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                          {JSON.stringify(analysisResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center p-8 text-muted-foreground">
                        <Sparkles className="w-16 h-16 mx-auto mb-4" />
                        <p>Analysis results will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collection">
            <Card>
              <CardHeader>
                <CardTitle>My Antique Collection</CardTitle>
                <CardDescription>View and manage your analyzed antiques</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Collection feature coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Credit Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Credits?</CardTitle>
            <CardDescription>Choose the right package for you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold mb-2">10 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€5</p>
                <Button variant="outline" className="w-full" onClick={async () => {
                  const url = await purchaseCredits(10);
                  if (url) {
                    setStripeUrl(url);
                  }
                }}>Buy Now</Button>
              </div>
              <div className="border-2 border-primary rounded-lg p-4 text-center">
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full inline-block mb-2">
                  POPULAR
                </div>
                <p className="text-2xl font-bold mb-2">25 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€10</p>
                <Button className="w-full" onClick={async () => {
                  const url = await purchaseCredits(25);
                  if (url) {
                    setStripeUrl(url);
                  }
                }}>Buy Now</Button>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-2xl font-bold mb-2">60 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€20</p>
                <Button variant="outline" className="w-full" onClick={async () => {
                  const url = await purchaseCredits(60);
                  if (url) {
                    setStripeUrl(url);
                  }
                }}>Buy Now</Button>
              </div>
              <div className="border rounded-lg p-4 text-center bg-gold/10">
                <div className="bg-gold text-gold-foreground text-xs px-2 py-1 rounded-full inline-block mb-2">
                  BEST VALUE
                </div>
                <p className="text-2xl font-bold mb-2">150 credits</p>
                <p className="text-3xl font-bold text-primary mb-4">€40</p>
                <Button variant="outline" className="w-full" onClick={async () => {
                  const url = await purchaseCredits(150);
                  if (url) {
                    setStripeUrl(url);
                  }
                }}>Buy Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AntiqueAppraisal;
