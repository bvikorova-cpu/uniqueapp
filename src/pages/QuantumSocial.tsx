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
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="feed" className="gap-2">
            <FileText className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="h-4 w-4" />
            My Profile
          </TabsTrigger>
          <TabsTrigger value="observer" className="gap-2">
            <Eye className="h-4 w-4" />
            Observer Mode
          </TabsTrigger>
          <TabsTrigger value="entanglements" className="gap-2">
            <Users className="h-4 w-4" />
            Entanglements
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <Zap className="h-4 w-4" />
            Subscriptions
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
  );
};

export default QuantumSocial;
