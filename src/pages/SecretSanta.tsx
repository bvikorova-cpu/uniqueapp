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

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              Social Gifts Hub
            </h1>
            <p className="text-gray-600 text-sm mt-2">Send gifts, emotions & awards to anyone</p>
          </div>

          {/* Credits display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-amber-500 text-lg">💎</span>
            <span className="text-amber-700 font-bold">{credits}</span>
          </div>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl p-1 mb-6 overflow-x-auto shadow-lg">
            <TabsTrigger
              value="send"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Gift className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Inbox className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Inbox</span>
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
            >
              <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Top</span>
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 rounded-xl transition-all text-xs sm:text-sm font-medium"
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
