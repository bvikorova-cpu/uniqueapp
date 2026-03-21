import { useState, useEffect } from "react";
import { PastLifeCreditsDisplay } from "@/components/past-life/PastLifeCreditsDisplay";
import { PastLifeForm } from "@/components/past-life/PastLifeForm";
import { PastLifeResult } from "@/components/past-life/PastLifeResult";
import { PastLifeHistory } from "@/components/past-life/PastLifeHistory";
import { usePastLifeCredits } from "@/hooks/usePastLifeCredits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Clock, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const PastLife = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentReading, setCurrentReading] = useState<any>(null);
  const { analyzePastLife, isAnalyzing } = usePastLifeCredits();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const credits = searchParams.get("credits");
    
    if (payment === "success" && credits) {
      toast.success(`Payment successful! ${credits} credits added to your account.`);
      setSearchParams({});
    } else if (payment === "cancelled") {
      toast.error("Payment cancelled");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleAnalysisComplete = (result: any) => {
    setCurrentReading(result.reading);
    toast.success("Your past lives have been revealed!");
  };

  const handleSubmit = (data: any) => {
    analyzePastLife(data, {
      onSuccess: handleAnalysisComplete,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">Past Life Explorer</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover who you were in previous lifetimes through AI-powered mystical analysis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Informative Section */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">Journey Through Time</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Past life regression reveals the eternal journey of your soul across different lifetimes. Our AI combines mystical wisdom with your personal information to uncover your previous incarnations, helping you understand your current life's purpose, relationships, and challenges through the lens of karma and soul evolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Basic Reading
                </h3>
                <p className="text-sm text-muted-foreground mb-2">5 Credits</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>1 detailed past life story</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Historical period and location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Your profession and life events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Karmic lesson for current life</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Full Reading
                </h3>
                <p className="text-sm text-muted-foreground mb-2">15 Credits</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>3 complete past life stories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>AI-generated mystical illustrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Overall karmic theme analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Deep dive into soul evolution</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Soul Mate Connection
                </h3>
                <p className="text-sm text-muted-foreground mb-2">20 Credits</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>Your 3 past lives with illustrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>Partner's past life analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>Shared past life connections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>Relationship karmic patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <PastLifeCreditsDisplay />

        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="explore">Explore Past Lives</TabsTrigger>
            <TabsTrigger value="history">My Readings</TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            <PastLifeForm onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />

            {currentReading && <PastLifeResult reading={currentReading} />}
          </TabsContent>

          <TabsContent value="history">
            <PastLifeHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PastLife;