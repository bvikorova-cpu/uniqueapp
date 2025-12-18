import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Inbox, Sparkles, Trophy, CreditCard, ArrowLeft, Award, Box, Star, MessageCircle } from "lucide-react";
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

const SecretSanta = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("send");
  const { credits } = useSecretSanta();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Light luxurious background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50" />
        
        {/* Soft decorative elements */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/50 to-pink-200/50 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-amber-200/40 to-yellow-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full blur-3xl" />
        </div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 pt-16 sm:pt-12 pb-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex-1 pt-4">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
              Secret Santa 365
            </h1>
            <p className="text-gray-600 text-sm mt-2">Year-Round Digital Gift Giving Platform</p>
          </div>

          {/* Credits display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-amber-500 text-lg">💎</span>
            <span className="text-amber-700 font-bold">{credits}</span>
          </div>
        </div>

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
          <TabsList className="w-full flex bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-1 mb-6 overflow-x-auto shadow-lg">
            <TabsTrigger
              value="send"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Gift className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Inbox className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger
              value="mystery"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Box className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Mystery</span>
            </TabsTrigger>
            <TabsTrigger
              value="limited"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Star className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Limited</span>
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Award className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Trophy className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Top</span>
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="flex-1 min-w-fit data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Shop</span>
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

      {/* Custom styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
          50% { transform: translateY(-40px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-20px) translateX(-10px); opacity: 0.4; }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SecretSanta;