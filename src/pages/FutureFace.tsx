import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Gem, Camera, Medal, CalendarDays } from "lucide-react";
import FutureFaceHero from "@/components/future-face/FutureFaceHero";
import FutureFacePhotoStudio from "@/components/future-face/FutureFacePhotoStudio";
import FutureFaceMultiAgeTimeline from "@/components/future-face/FutureFaceMultiAgeTimeline";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
        <FloatingHowItWorks
          title="Future Face"
          intro="See how you'll look in 5, 10 or 50 years."
          steps={[
            { title: "Upload a selfie", desc: "Front-facing, clear lighting." },
          { title: "Pick a time span", desc: "+5, +10, +30, +50 years or +baby." },
          { title: "Generate", desc: "Uses 3\u20135 credits per aging." },
          { title: "Save or share", desc: "Download or share with friends." },
          { title: "Compare", desc: "Side-by-side with your original photo." }
          ]}
        />
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

        <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
          <Button size="sm" variant="outline" onClick={() => navigate('/ai-credits-store')}>
            <Gem className="h-3.5 w-3.5 mr-1.5" /> Buy AI Credits
          </Button>
        </div>

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
        <Tabs defaultValue="photo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
            <TabsTrigger value="photo" className="text-xs"><Camera className="h-3 w-3 mr-1" />Photo Studio</TabsTrigger>
            <TabsTrigger value="multiage" className="text-xs"><CalendarDays className="h-3 w-3 mr-1" />Multi-Age</TabsTrigger>
          </TabsList>

          <TabsContent value="photo"><FutureFacePhotoStudio /></TabsContent>
          <TabsContent value="multiage"><FutureFaceMultiAgeTimeline /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FutureFace;
