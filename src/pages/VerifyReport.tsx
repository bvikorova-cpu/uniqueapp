import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, Eye } from "lucide-react";
import { motion } from "framer-motion";

const VerifyReport = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "valid" | "invalid">("loading");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      const { data: d, error } = await supabase.functions.invoke("lie-detector-ai", {
        body: { action: "verify-report", report_id: token },
      });
      if (error || !d?.valid) { setState("invalid"); return; }
      setData({
        ...d,
        token: d.report_id,
        summary: d.watermark,
        generated_at: d.issued_at,
        view_count: 0,
      });
      setState("valid");
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/70 backdrop-blur-md border-red-500/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                {state === "valid" ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : state === "invalid" ? <AlertCircle className="w-6 h-6 text-red-400" /> : <Eye className="w-6 h-6 text-amber-400 animate-pulse" />}
                Report Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {state === "loading" && <p className="text-center text-muted-foreground">Verifying token...</p>}
              {state === "invalid" && (
                <div className="text-center p-6 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-300 font-bold">⚠ Invalid or expired token</p>
                  <p className="text-xs text-muted-foreground mt-1">This report could not be verified in our database.</p>
                </div>
              )}
              {state === "valid" && data && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40">VERIFIED</Badge>
                    <Badge variant="outline">Token: {data.token}</Badge>
                    <Badge variant="outline" className="ml-auto">{data.view_count + 1} views</Badge>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase text-muted-foreground">Title</p>
                    <p className="text-lg font-bold">{data.title}</p>
                  </div>
                  {data.truthfulness_score != null && (
                    <div>
                      <p className="text-xs font-mono uppercase text-muted-foreground">Truthfulness Score</p>
                      <p className="text-3xl font-black text-amber-300">{data.truthfulness_score}/100</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Summary</p>
                    <p className="text-sm whitespace-pre-wrap">{data.summary}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right">
                    Generated {new Date(data.generated_at).toLocaleString()}
                  </p>
                </div>
              )}
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/lie-detector">← Back to Lie Detector</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
export default VerifyReport;
