import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Inbox, Sparkles, Trophy, CreditCard, ArrowLeft, Award, Box, Star, MessageCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SecretSantaSendGift } from "@/components/secret-santa/SecretSantaSendGift";
import { SecretSantaInbox } from "@/components/secret-santa/SecretSantaInbox";
import { SecretSantaStories } from "@/components/secret-santa/SecretSantaStories";
import { SecretSantaLeaderboard } from "@/components/secret-santa/SecretSantaLeaderboard";
import { SecretSantaCredits } from "@/components/secret-santa/SecretSantaCredits";
import { LevelProgress } from "@/components/secret-santa/LevelProgress";
import { BadgesDisplay } from "@/components/secret-santa/BadgesDisplay";
import { MysteryBox } from "@/components/secret-santa/MysteryBox";
import { LimitedEditionGifts } from "@/components/secret-santa/LimitedEditionGifts";
import { GiftChat } from "@/components/secret-santa/GiftChat";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { ParticleEffect } from "@/components/secret-santa/GiftConfetti";
import heroVideo from "@/assets/secret-santa-hero.mp4.asset.json";

const SecretSanta = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("send");
  const { credits } = useSecretSanta();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Video Hero */}
      <div className="relative w-full h-[50vh] min-h-[300px] overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] saturate-[1.3]"
          autoPlay
          muted
          loop
          playsInline
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-rose-50" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg mb-2" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Secret Santa 365
          </h1>
          <p className="text-white/90 text-sm sm:text-base drop-shadow-md">Year-Round Digital Gift Giving Platform</p>
          
          {/* Credits display */}
          <div className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
            <span className="text-lg">💎</span>
            <span className="text-white font-bold text-lg">{credits}</span>
          </div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white h-8 w-8"
            onClick={() => {
              if (videoRef.current) {
                isPlaying ? videoRef.current.pause() : videoRef.current.play();
                setIsPlaying(!isPlaying);
              }
            }}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white h-8 w-8"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Light luxurious background for content */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50" />
      </div>

      <div className="container mx-auto px-4 pb-8 max-w-4xl relative z-10 -mt-6">
        {/* Description Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            What is Secret Santa 365?
          </h2>
          <p className="text-gray-700 text-sm sm:text-base mb-4">
            Secret Santa 365 is a <span className="font-semibold text-amber-600">year-round digital gift-giving platform</span> that brings 
            the joy of Secret Santa to every day of the year! Unlike traditional Secret Santa events limited to holidays, 
            our platform allows you to send beautiful animated digital gifts, heartfelt messages, and virtual awards to 
            friends, family, or anyone in our community — <span className="font-semibold">anytime, anywhere</span>.
          </p>
          
          <h3 className="text-md font-semibold text-gray-800 mb-2">How to Use:</h3>
          <ul className="text-gray-600 text-sm space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">1.</span>
              <span><strong>Send Gifts:</strong> Choose from a variety of animated digital gifts and send them to any user with a personalized message.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">2.</span>
              <span><strong>Check Inbox:</strong> View gifts you've received and read heartfelt messages from your admirers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">3.</span>
              <span><strong>Open Mystery Boxes:</strong> Try your luck with mystery boxes containing random surprise gifts of varying rarities.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">4.</span>
              <span><strong>Collect Limited Editions:</strong> Grab seasonal and holiday-themed gifts available for a limited time only.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">5.</span>
              <span><strong>Earn XP & Level Up:</strong> Gain experience points for every gift sent/received and unlock exclusive badges.</span>
            </li>
          </ul>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <span className="font-semibold">💡 Tip:</span> Purchase credits to unlock premium gifts and features. The more you give, the higher you climb on the leaderboard!
          </div>
        </div>

        {/* Level Progress & Stats */}
        <div className="mb-6">
          <LevelProgress />
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 sm:grid-cols-9 gap-1 bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-2 mb-6 shadow-lg h-auto">
            <TabsTrigger
              value="send"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Gift className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Inbox className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <MessageCircle className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="mystery"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Box className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="limited"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Star className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Award className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Sparkles className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <Trophy className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs font-medium py-2"
            >
              <CreditCard className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="mt-0">
            <SecretSantaSendGift />
          </TabsContent>

          <TabsContent value="inbox" className="mt-0">
            <SecretSantaInbox />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <GiftChat />
          </TabsContent>

          <TabsContent value="mystery" className="mt-0">
            <MysteryBox />
          </TabsContent>

          <TabsContent value="limited" className="mt-0">
            <LimitedEditionGifts />
          </TabsContent>

          <TabsContent value="badges" className="mt-0">
            <BadgesDisplay />
          </TabsContent>

          <TabsContent value="stories" className="mt-0">
            <SecretSantaStories />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <SecretSantaLeaderboard />
          </TabsContent>

          <TabsContent value="credits" className="mt-0">
            <SecretSantaCredits />
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default SecretSanta;