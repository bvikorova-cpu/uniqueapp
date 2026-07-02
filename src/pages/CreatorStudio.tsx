import { Helmet } from "react-helmet-async";
import { CreatorStudioDashboard } from "@/components/creator-studio/CreatorStudioDashboard";
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
        intro="Full creator workspace \u2014 content, analytics, monetization."
        steps={[
          { title: "Create content", desc: "Posts, videos, subscriptions, PPV." },
          { title: "Manage subscribers", desc: "Tiers, benefits, DMs." },
          { title: "Track earnings", desc: "85/15 split with instant analytics." },
          { title: "Schedule drops", desc: "Plan releases in advance." },
          { title: "Withdraw payouts", desc: "Stripe Connect to your bank." }
        ]}
      />
      <Helmet>
        <title>Creator Studio — Analytics Dashboard | Unique</title>
        <meta name="description" content="Your creator dashboard: views, engagement, top posts, best hours to publish." />
      </Helmet>
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <CreatorStudioDashboard />
      </main>
    </>
  );
};

export default CreatorStudio;
