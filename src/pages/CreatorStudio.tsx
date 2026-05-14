import { Helmet } from "react-helmet-async";
import { CreatorStudioDashboard } from "@/components/creator-studio/CreatorStudioDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const CreatorStudio = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      <Helmet>
        <title>Creator Studio — Analytics Dashboard | Unique</title>
        <meta name="description" content="Tvoj creator dashboard: views, engagement, top posts, najlepšie hodiny na publikovanie." />
      </Helmet>
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <CreatorStudioDashboard />
      </main>
    </>
  );
};

export default CreatorStudio;
