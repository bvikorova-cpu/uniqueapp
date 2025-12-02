import { useState, useEffect } from "react";
import { HandwritingCreditsDisplay } from "@/components/handwriting/HandwritingCreditsDisplay";
import { HandwritingUpload } from "@/components/handwriting/HandwritingUpload";
import { HandwritingAnalysisResult } from "@/components/handwriting/HandwritingAnalysisResult";
import { HandwritingHistory } from "@/components/handwriting/HandwritingHistory";
import { useHandwritingCredits } from "@/hooks/useHandwritingCredits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Handwriting Analyzer</h1>
          <p className="text-muted-foreground">
            Unlock personality insights through professional handwriting analysis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
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
