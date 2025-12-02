import { useState, useEffect } from "react";
import { HandwritingCreditsDisplay } from "@/components/handwriting/HandwritingCreditsDisplay";
import { HandwritingUpload } from "@/components/handwriting/HandwritingUpload";
import { HandwritingAnalysisResult } from "@/components/handwriting/HandwritingAnalysisResult";
import { HandwritingHistory } from "@/components/handwriting/HandwritingHistory";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Brain, Zap } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const Handwriting = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const { analyzeHandwriting, isAnalyzing } = useHandwritingCredits();

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Payment successful! Your credits have been added.");
      setSearchParams({});
    } else if (payment === "cancelled") {
      toast.error("Payment cancelled");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleAnalysisComplete = (result: any) => {
    setCurrentAnalysis(result.analysis);
    toast.success("Analysis complete!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Handwriting Analyzer</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Unlock personality insights through professional handwriting analysis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Informative Section */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">What is Handwriting Analysis?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Handwriting analysis, also known as graphology, is the scientific study of handwriting to reveal personality traits, emotional states, and behavioral patterns. Our AI-powered analyzer examines various aspects of your handwriting including pressure, slant, spacing, letter formations, and flow to provide deep insights into your unique personality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  What You Can Discover
                </h3>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Personality traits and character strengths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Communication style and social patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Emotional intelligence and stress levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Decision-making approach and work style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Leadership qualities and creativity level</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>Relationship patterns and compatibility insights</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-500" />
                  How to Use
                </h3>
                <ol className="space-y-3 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-indigo-500 min-w-[24px]">1.</span>
                    <span>Purchase analysis credits using the packages below</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-indigo-500 min-w-[24px]">2.</span>
                    <span>Upload a clear handwriting sample (image URL or file)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-indigo-500 min-w-[24px]">3.</span>
                    <span>Choose your analysis type based on your needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-indigo-500 min-w-[24px]">4.</span>
                    <span>Receive detailed AI-powered insights instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-indigo-500 min-w-[24px]">5.</span>
                    <span>Review your analysis history anytime</span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4 sm:p-6 border">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Available Analysis Types</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="font-semibold text-sm sm:text-base">Personal Analysis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground pl-4">5 credits • Focus on personal growth and self-awareness</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-sm sm:text-base">Professional Analysis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground pl-4">10 credits • Career strengths and work style assessment</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <span className="font-semibold text-sm sm:text-base">Relationship Analysis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground pl-4">15 credits • Communication and compatibility patterns</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-sm sm:text-base">Business Analysis</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground pl-4">20 credits • Decision-making and strategic thinking</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <HandwritingCreditsDisplay />

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">New Analysis</TabsTrigger>
            <TabsTrigger value="history">My Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <HandwritingUpload
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
            />

            {currentAnalysis && (
              <HandwritingAnalysisResult analysis={currentAnalysis} />
            )}
          </TabsContent>

          <TabsContent value="history">
            <HandwritingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Handwriting;
