import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { useTeenCredits, TeenModuleKey } from "@/hooks/useTeenCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TeenModuleShellProps {
  module: TeenModuleKey;
  title: string;
  emoji: string;
  description: string;
  placeholder: string;
  examples?: string[];
  storageKey?: string;
}

export function TeenModuleShell({
  module,
  title,
  emoji,
  description,
  placeholder,
  examples = [],
  storageKey = "teen_parental_gate_verified",
}: TeenModuleShellProps) {
  const { isVerified, checkVerification } = useParentalGate(storageKey);
  const { balance, canUse, costPerUse, purchase, refresh, isLoading } =
    useTeenCredits(module);

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isVerified) {
    return (
    <>
      <FloatingHowItWorks title={"Teen Module Shell - How it works"} steps={[{ title: 'Open', desc: 'Access the Teen Module Shell section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Teen Module Shell.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-background">
        <Navbar />
        <ParentalGate
          isOpen
          onSuccess={() => checkVerification()}
          featureName={`Teen ${title}`}
          storageKey={storageKey}
        />
      </div>
    </>
  );
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!canUse) {
      toast.error(`Need ${costPerUse} credits. You have ${balance}.`);
      return;
    }
    setBusy(true);
    setReply("");
    try {
      const { data, error } = await supabase.functions.invoke("teen-router", {
        body: { module, prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReply(data?.reply || "");
      refresh();
    } catch (e: any) {
      toast.error(e?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const handleBuy = async () => {
    const url = await purchase(20);
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16 max-w-3xl">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <span className="text-3xl">{emoji}</span> {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="w-3 h-3" /> Age 13+
                </Badge>
                <Badge className="gap-1">
                  <Coins className="w-3 h-3" /> {isLoading ? "…" : balance}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {examples.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {examples.map((ex) => (
                  <Button
                    key={ex}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => setPrompt(ex)}
                  >
                    {ex}
                  </Button>
                ))}
              </div>
            )}
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              rows={5}
              maxLength={4000}
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">
                Cost: <strong>{costPerUse} credits</strong>
              </p>
              {canUse ? (
                <Button onClick={handleGenerate} disabled={busy || !prompt.trim()}>
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  Generate
                </Button>
              ) : (
                <Button onClick={handleBuy} variant="default">
                  <Coins className="w-4 h-4 mr-1" /> Buy 20 credits (€10)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {reply && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {reply}
              </div>
            </CardContent>
          </Card>
        )}

        {module === "mental_wellness" && (
          <p className="mt-4 text-xs text-muted-foreground italic text-center">
            This tool is not a substitute for medical or psychological care.
            If you're in crisis, contact a trusted adult or local helpline.
          </p>
        )}
      </main>
    </div>
  );
}
