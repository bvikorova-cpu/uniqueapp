import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Copy, Check, Coins, LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface CouponToolLayoutProps {
  onBack: () => void;
  title: string;
  subtitle: string;
  credits: number;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  formTitle: string;
  resultTitle: string;
  emptyText: string;
  result: string;
  loading: boolean;
  children: React.ReactNode;
}

export function CouponToolLayout({
  onBack, title, subtitle, credits, icon: Icon, gradientFrom, gradientTo,
  borderColor, formTitle, resultTitle, emptyText, result, loading, children,
}: CouponToolLayoutProps) {
  const [copied, setCopied] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", session.user.id).maybeSingle();
      setCreditBalance(data?.credits_remaining ?? 0);
    };
    fetchCredits();
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />Back to Hub
        </Button>
        {creditBalance !== null && (
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold">{creditBalance}</span> credits
          </Badge>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl p-6 mb-6" style={{
          background: `linear-gradient(135deg, ${gradientFrom}15, ${gradientTo}10, transparent)`,
          borderLeft: `4px solid ${gradientFrom}`,
        }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{
            background: `radial-gradient(circle, ${gradientFrom}, transparent)`,
          }} />
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h2>
              <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
            </div>
            <Badge className="text-white border-0 shadow-lg px-3 py-1.5 hidden sm:flex" style={{
              background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            }}>
              <Sparkles className="w-3 h-3 mr-1" />{credits} Credits
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full" style={{ background: gradientFrom }} />
                {formTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`shadow-lg transition-all duration-500 ${result ? "border-2" : "border-border/50"}`} style={result ? { borderColor: `${gradientFrom}30` } : {}}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-2 h-2 rounded-full" style={{ background: result ? gradientFrom : "hsl(var(--muted-foreground))" }} />
                {result ? resultTitle : "Results"}
              </CardTitle>
              {result && (
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm rounded-xl p-5 border bg-muted/30">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center opacity-20" style={{
                    background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                  }}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm">{emptyText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
