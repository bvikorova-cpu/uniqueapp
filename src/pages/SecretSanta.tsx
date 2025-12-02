import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Inbox, Sparkles, Trophy, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SecretSantaSendGift } from "@/components/secret-santa/SecretSantaSendGift";
import { SecretSantaInbox } from "@/components/secret-santa/SecretSantaInbox";
import { SecretSantaStories } from "@/components/secret-santa/SecretSantaStories";
import { SecretSantaLeaderboard } from "@/components/secret-santa/SecretSantaLeaderboard";
import { SecretSantaCredits } from "@/components/secret-santa/SecretSantaCredits";
import { useSecretSanta } from "@/hooks/useSecretSanta";

const SecretSanta = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("send");
  const { credits } = useSecretSanta();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Luxurious animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a1a2e]" />
        
        {/* Animated aurora effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Golden shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              Secret Santa 365
            </h1>
            <p className="text-white/60 text-sm mt-1">Send magical gifts anonymously</p>
          </div>

          {/* Credits display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full px-3 py-1.5">
            <span className="text-amber-300 text-lg">💎</span>
            <span className="text-amber-200 font-bold">{credits}</span>
          </div>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 mb-6 overflow-x-auto">
            <TabsTrigger
              value="send"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-yellow-500/30 data-[state=active]:text-amber-200 text-white/60 rounded-xl transition-all text-xs sm:text-sm"
            >
              <Gift className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-yellow-500/30 data-[state=active]:text-amber-200 text-white/60 rounded-xl transition-all text-xs sm:text-sm"
            >
              <Inbox className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-yellow-500/30 data-[state=active]:text-amber-200 text-white/60 rounded-xl transition-all text-xs sm:text-sm"
            >
              <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-yellow-500/30 data-[state=active]:text-amber-200 text-white/60 rounded-xl transition-all text-xs sm:text-sm"
            >
              <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Top</span>
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/30 data-[state=active]:to-yellow-500/30 data-[state=active]:text-amber-200 text-white/60 rounded-xl transition-all text-xs sm:text-sm"
            >
              <CreditCard className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Shop</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="mt-0">
            <SecretSantaSendGift />
          </TabsContent>

          <TabsContent value="inbox" className="mt-0">
            <SecretSantaInbox />
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
