import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const UsernameRedirect = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!username) { navigate("/"); return; }
      const { data } = await (supabase as any)
        .from("profiles_public").select("id")
        .ilike("username", username).maybeSingle();
      if (data?.id) {
        // record a view (anonymous-friendly)
        const { data: { user } } = await supabase.auth.getUser();
        const referrer = document.referrer || "direct";
        const source = referrer.includes("uniqueapp") ? "internal" : (referrer.split("/")[2] || "direct");
        supabase.from("profile_views").insert({
          profile_id: data.id,
          viewer_id: user?.id || null,
          referrer,
          source,
          viewer_user_agent: navigator.userAgent.slice(0, 200),
        });
        navigate(`/profile/${data.id}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    })();
  }, [username, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default UsernameRedirect;
