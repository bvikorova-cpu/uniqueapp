import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Gem, Wrench, Camera, Swords, Trophy, Medal, ScanFace, CalendarDays, ShieldCheck, Dna, Share2, Sun } from "lucide-react";
import FutureFaceHero from "@/components/future-face/FutureFaceHero";
import FutureFaceToolsGrid from "@/components/future-face/FutureFaceToolsGrid";
import FutureFaceSelfieStreaks from "@/components/future-face/FutureFaceSelfieStreaks";
import FutureFaceLeaderboard from "@/components/future-face/FutureFaceLeaderboard";
import FutureFaceAchievements from "@/components/future-face/FutureFaceAchievements";
import FutureFaceDuels from "@/components/future-face/FutureFaceDuels";
import FutureFaceARPreview from "@/components/future-face/FutureFaceARPreview";
import FutureFaceTimeline from "@/components/future-face/FutureFaceTimeline";
import FutureFaceDermatologist from "@/components/future-face/FutureFaceDermatologist";
import FutureFaceDNAAging from "@/components/future-face/FutureFaceDNAAging";
import FutureFaceSocialShare from "@/components/future-face/FutureFaceSocialShare";
import FutureFaceSeasonalReport from "@/components/future-face/FutureFaceSeasonalReport";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const FutureFace = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">Authentication Required</Badge>
          <h1 className="text-4xl md:text-6xl font-bold">
            Please <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Sign In</span>
          </h1>
          <p className="text-lg text-muted-foreground">You need to be logged in to access Future Face</p>
          <Button size="lg" onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <FutureFaceHero />

        <HeroRewardedAd sectionKey="page_futureface" />

        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-card/60 backdrop-blur-md border border-cyan-500/20 rounded-xl p-3 sm:p-4 text-center">
            <Camera className="h-5 w-5 mx-auto mb-1 text-cyan-400" />
            <p className="text-xs font-bold">Selfie Streak</p>
            <p className="text-lg font-black">0 Days</p>
          </div>
          <div className="bg-card/60 backdrop-blur-md border border-purple-500/20 rounded-xl p-3 sm:p-4 text-center">
            <Gem className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <p className="text-xs font-bold">Tools Used</p>
            <p className="text-lg font-black">0/14</p>
          </div>
          <div className="bg-card/60 backdrop-blur-md border border-pink-500/20 rounded-xl p-3 sm:p-4 text-center">
            <Medal className="h-5 w-5 mx-auto mb-1 text-pink-400" />
            <p className="text-xs font-bold">Achievements</p>
            <p className="text-lg font-black">0/12</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-11 mb-6 h-auto">
            <TabsTrigger value="tools" className="text-[10px] sm:text-xs"><Wrench className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Tools</span></TabsTrigger>
            <TabsTrigger value="ar" className="text-[10px] sm:text-xs"><ScanFace className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">AR</span></TabsTrigger>
            <TabsTrigger value="timeline" className="text-[10px] sm:text-xs"><CalendarDays className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Timeline</span></TabsTrigger>
            <TabsTrigger value="derm" className="text-[10px] sm:text-xs"><ShieldCheck className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Derm</span></TabsTrigger>
            <TabsTrigger value="dna" className="text-[10px] sm:text-xs"><Dna className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">DNA</span></TabsTrigger>
            <TabsTrigger value="social" className="text-[10px] sm:text-xs"><Share2 className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Social</span></TabsTrigger>
            <TabsTrigger value="seasonal" className="text-[10px] sm:text-xs"><Sun className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Season</span></TabsTrigger>
            <TabsTrigger value="streaks" className="text-[10px] sm:text-xs"><Camera className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Streaks</span></TabsTrigger>
            <TabsTrigger value="duels" className="text-[10px] sm:text-xs"><Swords className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Duels</span></TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-[10px] sm:text-xs"><Trophy className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Ranks</span></TabsTrigger>
            <TabsTrigger value="achievements" className="text-[10px] sm:text-xs"><Medal className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Badges</span></TabsTrigger>
          </TabsList>

          <TabsContent value="tools"><FutureFaceToolsGrid /></TabsContent>
          <TabsContent value="ar"><FutureFaceARPreview /></TabsContent>
          <TabsContent value="timeline"><FutureFaceTimeline /></TabsContent>
          <TabsContent value="derm"><FutureFaceDermatologist /></TabsContent>
          <TabsContent value="dna"><FutureFaceDNAAging /></TabsContent>
          <TabsContent value="social"><FutureFaceSocialShare /></TabsContent>
          <TabsContent value="seasonal"><FutureFaceSeasonalReport /></TabsContent>
          <TabsContent value="streaks"><FutureFaceSelfieStreaks currentStreak={0} /></TabsContent>
          <TabsContent value="duels"><FutureFaceDuels /></TabsContent>
          <TabsContent value="leaderboard"><FutureFaceLeaderboard /></TabsContent>
          <TabsContent value="achievements"><FutureFaceAchievements /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FutureFace;
