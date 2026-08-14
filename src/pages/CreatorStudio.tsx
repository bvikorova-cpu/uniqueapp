import { Helmet } from "react-helmet-async";
import { CreatorStudioDashboard } from "@/components/creator-studio/CreatorStudioDashboard";
import { MonetizationSettings } from "@/components/creator-studio/MonetizationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CreatorStudio = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      <FloatingHowItWorks
        title="Creator Studio"
        intro="Full creator workspace — content, analytics, monetization."
        steps={[
          { title: "Create content", desc: "Posts, videos, subscriptions, PPV." },
          { title: "Set your prices", desc: "Fan club tiers, paid DMs and shoutouts in Monetization." },
          { title: "Track earnings", desc: "85/15 split with instant analytics." },
          { title: "Schedule drops", desc: "Plan releases in advance." },
          { title: "Withdraw payouts", desc: "Stripe Connect to your bank." }
        ]}
      />
      <Helmet>
        <title>Creator Studio — Analytics & Pricing | Unique</title>
        <meta name="description" content="Your creator dashboard: engagement analytics plus fan club, paid DM and shoutout pricing." />
      </Helmet>
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
            <TabsTrigger value="monetization" className="flex-1 sm:flex-none">Monetization</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <CreatorStudioDashboard />
          </TabsContent>
          <TabsContent value="monetization">
            <MonetizationSettings />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default CreatorStudio;
