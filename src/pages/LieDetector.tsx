import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, MessageSquare, Users, Brain, History } from "lucide-react";
import { LieDetectorHeader } from "@/components/lie-detector/LieDetectorHeader";
import { LieDetectorCredits } from "@/components/lie-detector/LieDetectorCredits";
import { SingleMessageAnalysis } from "@/components/lie-detector/SingleMessageAnalysis";
import { ThreadAnalysis } from "@/components/lie-detector/ThreadAnalysis";
import { PsychologicalProfile } from "@/components/lie-detector/PsychologicalProfile";
import { AnalysisHistory } from "@/components/lie-detector/AnalysisHistory";

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
      </div>
    </div>
  );
};

export default LieDetector;