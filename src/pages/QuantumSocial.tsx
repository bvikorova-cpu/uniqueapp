import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Atom, FileText, Eye, Users, Zap, Settings } from "lucide-react";
import QuantumFeed from "@/components/quantum-social/QuantumFeed";
import QuantumProfile from "@/components/quantum-social/QuantumProfile";
import QuantumObserver from "@/components/quantum-social/QuantumObserver";
import QuantumEntanglements from "@/components/quantum-social/QuantumEntanglements";
import QuantumSubscriptions from "@/components/quantum-social/QuantumSubscriptions";

const QuantumSocial = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-950/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Futuristic Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/25 relative">
            <Atom className="h-8 w-8 text-white animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Quantum Social Network
            </h1>
            <p className="text-muted-foreground">Your profile exists in quantum superposition</p>
          </div>
        </div>

        {/* Neon Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 hover:border-cyan-400/50 transition-all group">
            <div className="text-2xl mb-2">⚛️</div>
            <h3 className="font-semibold text-sm text-cyan-400">Quantum Posts</h3>
            <p className="text-xs text-muted-foreground mt-1">3 versions per post</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 hover:border-purple-400/50 transition-all">
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="font-semibold text-sm text-purple-400">Reality Collapse</h3>
            <p className="text-xs text-muted-foreground mt-1">€2.99 per collapse</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 hover:border-blue-400/50 transition-all">
            <div className="text-2xl mb-2">👁️</div>
            <h3 className="font-semibold text-sm text-blue-400">Observer Mode</h3>
            <p className="text-xs text-muted-foreground mt-1">€19.99/month</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 hover:border-pink-400/50 transition-all">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-sm text-pink-400">Entanglement</h3>
            <p className="text-xs text-muted-foreground mt-1">€9.99/month</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 hover:border-amber-400/50 transition-all">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-sm text-amber-400">Quantum Profiles</h3>
            <p className="text-xs text-muted-foreground mt-1">€12.99/month</p>
          </div>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-card/50 backdrop-blur-sm border border-border/50 p-1">
            <TabsTrigger value="feed" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <FileText className="h-4 w-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="observer" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Eye className="h-4 w-4 mr-2" />
              Observer
            </TabsTrigger>
            <TabsTrigger value="entanglements" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Users className="h-4 w-4 mr-2" />
              Entangle
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Zap className="h-4 w-4 mr-2" />
              Subscribe
            </TabsTrigger>
          </TabsList>

        <TabsContent value="feed">
          <QuantumFeed />
        </TabsContent>

        <TabsContent value="profile">
          <QuantumProfile />
        </TabsContent>

        <TabsContent value="observer">
          <QuantumObserver />
        </TabsContent>

        <TabsContent value="entanglements">
          <QuantumEntanglements />
        </TabsContent>

        <TabsContent value="subscriptions">
          <QuantumSubscriptions />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuantumSocial;
