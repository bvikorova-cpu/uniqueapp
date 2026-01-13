import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, MessageSquare, Users, Brain, History, AlertTriangle } from "lucide-react";
import { LieDetectorHeader } from "@/components/lie-detector/LieDetectorHeader";
import { LieDetectorCredits } from "@/components/lie-detector/LieDetectorCredits";
import { SingleMessageAnalysis } from "@/components/lie-detector/SingleMessageAnalysis";
import { ThreadAnalysis } from "@/components/lie-detector/ThreadAnalysis";
import { PsychologicalProfile } from "@/components/lie-detector/PsychologicalProfile";
import { AnalysisHistory } from "@/components/lie-detector/AnalysisHistory";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LieDetector = () => {
  const [activeTab, setActiveTab] = useState("single");

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <LieDetectorHeader />

        <div className="mb-6 sm:mb-8">
          <LieDetectorCredits />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto scrollbar-hide mb-6 sm:mb-8">
            <TabsList className="inline-flex w-max min-w-full sm:w-full glassmorphism">
              <TabsTrigger value="single" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                Single Message
              </TabsTrigger>
              <TabsTrigger value="thread" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                Conversation Thread
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                Psychological Profile
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="single">
            <SingleMessageAnalysis />
          </TabsContent>

          <TabsContent value="thread">
            <ThreadAnalysis />
          </TabsContent>

          <TabsContent value="profile">
            <PsychologicalProfile />
          </TabsContent>

          <TabsContent value="history">
            <AnalysisHistory />
          </TabsContent>
        </Tabs>

        {/* Mandatory Disclaimer */}
        <Alert className="mt-8 border-2 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <AlertTitle className="text-yellow-600 dark:text-yellow-400 font-bold">
            ⚠️ Important Disclaimer
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
            <strong>For entertainment and informational purposes only.</strong> Results are AI-generated estimates 
            based on linguistic patterns and should NOT be used as definitive proof of truthfulness or deception. 
            This tool does not replace professional psychological assessment or legal investigation.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default LieDetector;