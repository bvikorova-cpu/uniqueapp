import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Atom, FileText, Eye, Users, Zap, Settings } from "lucide-react";
import QuantumFeed from "@/components/quantum-social/QuantumFeed";
import QuantumProfile from "@/components/quantum-social/QuantumProfile";
import QuantumObserver from "@/components/quantum-social/QuantumObserver";
import QuantumEntanglements from "@/components/quantum-social/QuantumEntanglements";
import QuantumSubscriptions from "@/components/quantum-social/QuantumSubscriptions";

const QuantumSocial = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Atom className="h-8 w-8 text-primary animate-spin-slow" />
          <h1 className="text-4xl font-bold">Quantum Social Network</h1>
        </div>
        <p className="text-muted-foreground text-lg mb-6">
          Your profile exists in quantum superposition - followers see different versions of you
        </p>
        
        <div className="max-w-4xl mx-auto bg-card border rounded-lg p-6 text-left space-y-4">
          <h2 className="text-xl font-semibold">How It Works</h2>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Quantum Posts:</strong> When you create a post, AI generates multiple versions with different personality tones (professional, casual, humorous). Each follower sees a different version randomly assigned to them, creating a unique experience.
            </p>
            
            <p>
              <strong className="text-foreground">Reality Collapse:</strong> For €2.99, you can "collapse" a post's quantum state, making everyone see the same version. Perfect for important announcements or when you want consistent messaging.
            </p>
            
            <p>
              <strong className="text-foreground">Observer Mode (€19.99/month):</strong> Subscribe to see all quantum versions of any post. Discover how content appears differently to various audiences and understand quantum dynamics.
            </p>
            
            <p>
              <strong className="text-foreground">Quantum Entanglement (€9.99/month):</strong> Connect with someone special - you'll both always see the same versions of posts, creating a shared reality experience.
            </p>
            
            <p>
              <strong className="text-foreground">Quantum Profiles (€12.99/month):</strong> Enable multiple reality versions of your profile. Different followers see different aspects of your personality, optimized for their preferences.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full h-auto gap-2 p-2 mb-8">
          <TabsTrigger value="feed" className="flex items-center justify-center gap-2 px-3 py-3 text-sm">
            <FileText className="h-4 w-4" />
            <span>Feed</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center justify-center gap-2 px-3 py-3 text-sm">
            <Settings className="h-4 w-4" />
            <span>My Profile</span>
          </TabsTrigger>
          <TabsTrigger value="observer" className="flex items-center justify-center gap-2 px-3 py-3 text-sm">
            <Eye className="h-4 w-4" />
            <span>Observer</span>
          </TabsTrigger>
          <TabsTrigger value="entanglements" className="flex items-center justify-center gap-2 px-3 py-3 text-sm">
            <Users className="h-4 w-4" />
            <span>Entangle</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center justify-center gap-2 px-3 py-3 text-sm col-span-2 sm:col-span-1">
            <Zap className="h-4 w-4" />
            <span>Subscribe</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Descriptions */}
        <div className="mb-8 bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Tab Guide</h3>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground">Feed:</strong> Browse and create quantum posts. Each post you create will be split into multiple personality versions (professional, casual, humorous) that different followers see randomly.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Settings className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground">My Profile:</strong> Manage your quantum profile settings. Enable multiple reality versions of your profile so different followers see different aspects of your personality.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground">Observer Mode:</strong> Subscribe to see ALL quantum versions of any post. Discover how content appears differently to various audiences and understand quantum dynamics.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground">Entanglements:</strong> Create quantum connections with special people. When entangled, you both always see the exact same versions of posts, creating a shared reality experience.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground">Subscriptions:</strong> Manage your premium subscriptions. Upgrade to access Observer Mode, Quantum Entanglements, Quantum Profiles, and the ability to collapse post quantum states.
              </div>
            </div>
          </div>
        </div>

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
  );
};

export default QuantumSocial;
