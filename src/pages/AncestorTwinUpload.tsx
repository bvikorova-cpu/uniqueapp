import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { useAncestorTwin } from "@/hooks/useAncestorTwin";
import { supabase } from "@/integrations/supabase/client";
import { SocialShareButtons } from "@/components/shared/SocialShareButtons";

const AncestorTwinUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const tier = searchParams.get("tier") || "basic";

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  const { findMatches, matchResults } = useAncestorTwin();

  // Verify payment on mount
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error("Invalid payment session");
        navigate("/ancestor-twin");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Please sign in first");
          navigate("/auth");
          return;
        }

        // In a real implementation, you would verify the Stripe session here
        // For now, we'll trust the session_id parameter
        setPaymentVerified(true);
        toast.success("Payment verified! Upload your photo to begin analysis.");
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error("Failed to verify payment");
        navigate("/ancestor-twin");
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

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

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error("Please upload your photo first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await findMatches(uploadedImage, tier as 'basic' | 'extended' | 'heritage');
      if (result) {
        toast.success(`Found ${result.matches.length} historical matches!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to find matches");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Success Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">Payment Successful</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Upload Your Photo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You've purchased the <Badge variant="secondary" className="mx-1">{tier}</Badge> package. Upload your photo to discover your historical twin!
          </p>
        </div>

        {/* Upload Section */}
        {!matchResults && (
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/20">
            <div className="text-center space-y-6">
              <Upload className="h-16 w-16 mx-auto text-primary" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Upload Your Face Photo</h2>
                <p className="text-muted-foreground">
                  Upload a clear photo of your face to find your historical lookalike
                </p>
              </div>
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="max-w-md mx-auto"
                disabled={isAnalyzing}
              />

              {previewUrl && (
                <div className="mt-6 space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-xs mx-auto rounded-lg shadow-lg border-2 border-primary/30"
                  />
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    size="lg"
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Find My Historical Twin
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Results Section */}
        {matchResults && matchResults.matches.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Your Historical Matches</h2>
              <p className="text-muted-foreground">
                We found {matchResults.matches.length} amazing lookalikes from history!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchResults.matches.map((match, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{match.name}</span>
                      <Badge variant="secondary">{match.similarity}% Match</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Era: </span>
                        <span className="text-muted-foreground">{match.era}</span>
                      </div>
                      {match.bio && (
                        <div>
                          <span className="font-semibold">Bio: </span>
                          <span className="text-muted-foreground">{match.bio}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 space-y-6">
              <SocialShareButtons
                title={`I found my historical twin: ${matchResults.matches[0]?.name} (${matchResults.matches[0]?.similarity}% match)!`}
                description={`Discover your historical lookalike with Ancestor Twin Finder! I matched with ${matchResults.matches.length} famous figures from history.`}
                hashtags={["AncestorTwin", "HistoricalDouble", "AI"]}
              />
              <Button
                onClick={() => navigate("/ancestor-twin")}
                variant="outline"
                size="lg"
              >
                Try Another Analysis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AncestorTwinUpload;
