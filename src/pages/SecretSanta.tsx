import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, Inbox, Sparkles, Trophy, CreditCard, ArrowLeft, Award, Box, Star, 
  MessageCircle, Play, Pause, Volume2, VolumeX, Shuffle, Wand2, BarChart3,
  Target, Heart, Flame
} from "lucide-react";
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
import { GiftRoulette } from "@/components/secret-santa/GiftRoulette";
import { AIGiftDesigner } from "@/components/secret-santa/AIGiftDesigner";
import { GiftAnalytics } from "@/components/secret-santa/GiftAnalytics";
import { GiftChallenges } from "@/components/secret-santa/GiftChallenges";
import { GiftWishlist } from "@/components/secret-santa/GiftWishlist";
import { AIThankYou } from "@/components/secret-santa/AIThankYou";
import { GiftStreakRewards } from "@/components/secret-santa/GiftStreakRewards";
import { useSecretSanta } from "@/hooks/useSecretSanta";
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

  const TABS = [
    { id: "send", icon: Gift, label: "Send", color: "from-amber-400 to-orange-400" },
    { id: "inbox", icon: Inbox, label: "Inbox", color: "from-amber-400 to-orange-400" },
    { id: "chat", icon: MessageCircle, label: "Chat", color: "from-blue-500 to-cyan-500" },
    { id: "challenges", icon: Target, label: "Quests", color: "from-orange-500 to-red-500" },
    { id: "roulette", icon: Shuffle, label: "Roulette", color: "from-green-500 to-emerald-500" },
    { id: "mystery", icon: Box, label: "Mystery", color: "from-purple-500 to-pink-500" },
    { id: "limited", icon: Star, label: "Seasonal", color: "from-red-500 to-rose-500" },
    { id: "wishlist", icon: Heart, label: "Wishlist", color: "from-pink-500 to-rose-500" },
    { id: "designer", icon: Wand2, label: "AI Design", color: "from-violet-500 to-purple-500" },
    { id: "thankyou", icon: Heart, label: "AI Thanks", color: "from-rose-500 to-pink-500" },
    { id: "streaks", icon: Flame, label: "Streaks", color: "from-orange-500 to-red-500" },
    { id: "analytics", icon: BarChart3, label: "Stats", color: "from-emerald-500 to-teal-500" },
    { id: "badges", icon: Award, label: "Badges", color: "from-amber-400 to-orange-400" },
    { id: "stories", icon: Sparkles, label: "Stories", color: "from-amber-400 to-orange-400" },
    { id: "leaderboard", icon: Trophy, label: "Ranks", color: "from-amber-400 to-orange-400" },
    { id: "credits", icon: CreditCard, label: "Credits", color: "from-amber-400 to-orange-400" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Video Hero */}
      <div className="relative w-full h-[50vh] min-h-[300px] overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] saturate-[1.3]"
          autoPlay muted loop playsInline
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rose-50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-rose-50" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white hover:bg-white/20">
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
          <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white h-8 w-8"
            onClick={() => { if (videoRef.current) { if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); } }}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white h-8 w-8"
            onClick={() => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } }}>
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Background */}
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
            the joy of Secret Santa to every day of the year! Send animated digital gifts, use AI to craft messages, 
            spin the Gift Roulette for anonymous giving, complete daily challenges, maintain gifting streaks, 
            create wishlists, and design custom gifts with AI.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { emoji: "🎁", label: "200+ Gifts", desc: "Across 13 categories" },
              { emoji: "🤖", label: "AI Powered", desc: "Messages, design & thanks" },
              { emoji: "🎯", label: "Daily Quests", desc: "Earn bonus credits" },
              { emoji: "🔥", label: "Streak Rewards", desc: "Up to 5,000 credits" },
            ].map(f => (
              <div key={f.label} className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center">
                <span className="text-xl block">{f.emoji}</span>
                <p className="text-xs font-bold text-gray-800 mt-1">{f.label}</p>
                <p className="text-[10px] text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <span className="font-semibold">💡 Tip:</span> AI features (Message Generator, Gift Designer & Thank You) cost 3 credits each. Complete daily challenges and maintain streaks to earn free credits!
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <LevelProgress />
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-8 sm:grid-cols-16 gap-1 bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-2 mb-6 shadow-lg h-auto">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.color} data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-[10px] font-medium py-2 flex flex-col items-center gap-0.5`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="send" className="mt-0"><SecretSantaSendGift /></TabsContent>
          <TabsContent value="inbox" className="mt-0"><SecretSantaInbox /></TabsContent>
          <TabsContent value="chat" className="mt-0"><GiftChat /></TabsContent>
          <TabsContent value="challenges" className="mt-0"><GiftChallenges /></TabsContent>
          <TabsContent value="roulette" className="mt-0"><GiftRoulette /></TabsContent>
          <TabsContent value="mystery" className="mt-0"><MysteryBox /></TabsContent>
          <TabsContent value="limited" className="mt-0"><LimitedEditionGifts /></TabsContent>
          <TabsContent value="wishlist" className="mt-0"><GiftWishlist /></TabsContent>
          <TabsContent value="designer" className="mt-0"><AIGiftDesigner /></TabsContent>
          <TabsContent value="thankyou" className="mt-0"><AIThankYou /></TabsContent>
          <TabsContent value="streaks" className="mt-0"><GiftStreakRewards /></TabsContent>
          <TabsContent value="analytics" className="mt-0"><GiftAnalytics /></TabsContent>
          <TabsContent value="badges" className="mt-0"><BadgesDisplay /></TabsContent>
          <TabsContent value="stories" className="mt-0"><SecretSantaStories /></TabsContent>
          <TabsContent value="leaderboard" className="mt-0"><SecretSantaLeaderboard /></TabsContent>
          <TabsContent value="credits" className="mt-0"><SecretSantaCredits /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecretSanta;
