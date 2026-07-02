import { useEffect, useState } from "react";

import { Heart, Loader2, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const PRESETS = [200, 500, 1000, 2500]; // cents

interface Props {
  creatorId: string;
  creatorName?: string;
  categorySlug?: string;
}

export default function MegatalentTipJar({ creatorId, creatorName, categorySlug }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ count: number; total: number } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("get_megatalent_tip_stats" as any, {
        _creator_id: creatorId,
      });
      if (!active) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        setStats({
          count: Number(row.total_tips ?? 0),
          total: Number(row.total_amount_cents ?? 0),
        });
      }
    })();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Tip Jar - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Tip Jar section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Tip Jar.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      active = false;
    };
  }, [creatorId]);

  // Verify tip on Stripe redirect
  useEffect(() => {
    const status = searchParams.get("tip");
    const sid = searchParams.get("session_id");
    if (status === "success" && sid) {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-megatalent-tip", {
            body: { sessionId: sid },
          });
          if (error) throw error;
          if ((data as any)?.verified) {
            toast({
              title: "Thanks for your support!",
              description: "Your tip has been delivered to the creator.",
            });
          }
        } catch (e: any) {
          console.error("verify-megatalent-tip", e);
        } finally {
          const next = new URLSearchParams(searchParams);
          next.delete("tip");
          next.delete("session_id");
          setSearchParams(next, { replace: true });
        }
      })();
    } else if (status === "cancel") {
      const next = new URLSearchParams(searchParams);
      next.delete("tip");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleTip = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to send a tip.",
        variant: "destructive",
      });
      return;
    }
    const finalAmount = custom ? Math.round(parseFloat(custom) * 100) : amount;
    if (!Number.isFinite(finalAmount) || finalAmount < 100 || finalAmount > 50000) {
      toast({
        title: "Invalid amount",
        description: "Tips must be €1 – €500.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-megatalent-tip", {
        body: {
          creatorId,
          amountCents: finalAmount,
          message: message || null,
          categorySlug: categorySlug ?? null,
        },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
    } catch (e: any) {
      toast({
        title: "Tip failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          {"Send a Tip"}
          {creatorName ? <span className="text-muted-foreground">→ {creatorName}</span> : null}
        </CardTitle>
        {stats && stats.count > 0 ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {`${stats.count} fans tipped €${(stats.total / 100).toFixed(2)} total`}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p}
              type="button"
              variant={!custom && amount === p ? "default" : "outline"}
              onClick={() => {
                setAmount(p);
                setCustom("");
              }}
              size="sm"
            >
              €{(p / 100).toFixed(0)}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          min={1}
          max={500}
          step={0.5}
          placeholder={"Custom amount (€)"}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <Textarea
          placeholder={"Optional message (max 280 chars)"}
          maxLength={280}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        />
        <Button
          onClick={handleTip}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Heart className="h-4 w-4 mr-2" />
          )}
          {"Send Tip"}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          {"Creator receives 80% • Platform fee 20%"}
        </p>
      </CardContent>
    </Card>
  );
}
