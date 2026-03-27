import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { EmployerVerificationForm } from "@/components/jobs/EmployerVerificationForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function EmployerVerification() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      setUser(user);
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-primary/10 to-accent/5 border border-emerald-500/20 p-6 sm:p-8"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/employer-dashboard")} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <motion.div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/30" whileHover={{ rotate: -5, scale: 1.05 }}>
              <ShieldCheck className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Employer Verification
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Verify your company to access employer features</p>
            </div>
          </div>
        </motion.div>

        {user && <EmployerVerificationForm userId={user.id} />}
      </div>
    </div>
  );
}
