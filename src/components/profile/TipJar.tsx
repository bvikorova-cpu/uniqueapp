import { motion } from "framer-motion";
import { Coffee, Heart, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TipJarProps {
  recipientId: string;
  recipientName: string;
  currentUserId: string | null;
}

const PRESETS = [1, 3, 5, 10, 25, 50];
const MIN = 1;
const MAX = 100;
const FEE_PCT = 10;

type Step = "select" | "confirm";

export const TipJar = ({ recipientId, recipientName, currentUserId }: TipJarProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [amount, setAmount] = useState<number>(3);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUserId === recipientId) return null;

  const reset = () => {
    setStep("select");
    setAmount(3);
    setMessage("");
  };

  const fee = Math.round(amount * 100 * (FEE_PCT / 100)) / 100;
  const net = amount - fee;
  const valid = Number.isFinite(amount) && amount >= MIN && amount <= MAX;

  const startCheckout = async () => {
    if (!currentUserId) {
      toast({ title: "Prihláste sa", description: "Pre poslanie tipu sa najprv prihláste.", variant: "destructive" });
      return;
    }
    if (!valid) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-profile-tip", {
        body: { recipientId, amountCents: Math.round(amount * 100), message: message.trim() || null },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error("Failed to get the payment link.");
      }
    } catch (e: any) {
      toast({ title: "Tip zlyhal", description: e.message ?? String(e), variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30"
        >
          <Coffee className="h-4 w-4" />
          Tip
        </motion.button>
      </DialogTrigger>

      <DialogContent className="bg-card/95 backdrop-blur-xl border-violet-400/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-violet-400" />
            {step === "select" ? `Pošli tip pre ${recipientName}` : "Potvrdiť platbu"}
          </DialogTitle>
        </DialogHeader>

        {step === "select" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant={amount === v ? "default" : "outline"}
                  onClick={() => setAmount(v)}
                  className={
                    amount === v
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold border-0"
                      : ""
                  }
                >
                  €{v}
                </Button>
              ))}
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Vlastná suma (€{MIN}–€{MAX})</label>
              <Input
                type="number"
                min={MIN}
                max={MAX}
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              {!valid && (
                <p className="text-xs text-destructive mt-1">Suma musí byť €{MIN}–€{MAX}.</p>
              )}
            </div>

            <Textarea
              placeholder="Voliteľná správa (max 280 znakov)…"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              rows={3}
            />

            <Button
              onClick={() => setStep("confirm")}
              disabled={!valid}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black"
            >
              Continue
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Bezpečná platba cez Stripe. Platformový poplatok {FEE_PCT}%.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-violet-400/30 bg-violet-500/5 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Príjemca</span>
                <span className="font-semibold">{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Suma tipu</span>
                <span className="font-semibold">€{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Platformový poplatok ({FEE_PCT}%)</span>
                <span>-€{fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-violet-400/20 pt-1.5 text-base">
                <span className="text-muted-foreground">Pre tvorcu</span>
                <span className="font-black text-violet-300">€{net.toFixed(2)}</span>
              </div>
              {message && (
                <div className="border-t border-violet-400/20 pt-1.5">
                  <p className="text-xs text-muted-foreground">Tvoja správa:</p>
                  <p className="italic text-sm">"{message}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                disabled={loading}
                className="flex-1"
              >
                Späť
              </Button>
              <Button
                onClick={startCheckout}
                disabled={loading || !valid}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Presmerovávam…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Zaplatiť €{amount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Budeš presmerovaný na zabezpečenú stránku Stripe Checkout.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
