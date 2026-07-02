import { useState, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, AlertCircle, CheckCircle, RefreshCw, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 60s cooldown after too many failed attempts


interface ParentalGateProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
  onClose?: () => void; // Deprecated - use onCancel
  featureName?: string;
  /** Override to avoid collisions between multiple parental-gated features */
  storageKey?: string;
}

function generateMathQuestion(): { question: string; answer: number } {
  // Harder problems — beyond typical pre-teen mental math range.
  // Mix of 2-digit × 1-digit multiplication and 3-digit addition/subtraction.
  const variant = Math.floor(Math.random() * 3);
  if (variant === 0) {
    const a = Math.floor(Math.random() * 90) + 11; // 11-100
    const b = Math.floor(Math.random() * 8) + 4;   // 4-11
    return { question: `What is ${a} × ${b}?`, answer: a * b };
  }
  if (variant === 1) {
    const a = Math.floor(Math.random() * 400) + 200; // 200-599
    const b = Math.floor(Math.random() * 300) + 150; // 150-449
    return { question: `What is ${a} + ${b}?`, answer: a + b };
  }
  const a = Math.floor(Math.random() * 400) + 500; // 500-899
  const b = Math.floor(Math.random() * 300) + 100; // 100-399
  return { question: `What is ${a} − ${b}?`, answer: a - b };
}

export function ParentalGate({
  isOpen,
  onSuccess,
  onCancel,
  featureName = "this feature",
  storageKey = "parental_gate_verified",
}: ParentalGateProps) {
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLocked = lockedUntil !== null && now < lockedUntil;
  const remainingLockSec = isLocked ? Math.ceil((lockedUntil! - now) / 1000) : 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);

  const refreshQuestion = () => {
    setMathQuestion(generateMathQuestion());
    setUserAnswer("");
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (isOpen) {
      setMathQuestion(generateMathQuestion());
      setUserAnswer("");
      setError(null);
      setSuccess(false);
      setAttempts(0);
      setLockedUntil(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Tick for lockout countdown
  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return (
    <>
      <FloatingHowItWorks title={"Parental Gate - How it works"} steps={[{ title: 'Open', desc: 'Access the Parental Gate section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Parental Gate.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(id);
  }, [isLocked]);

  // Auto-clear lock when expired
  useEffect(() => {
    if (lockedUntil && now >= lockedUntil) {
      setLockedUntil(null);
      setAttempts(0);
      refreshQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, lockedUntil]);

  // Block ESC key completely when dialog is open
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (submitting || success || isLocked) return;
    if (!userAnswer.trim()) {
      setError("Please enter an answer first.");
      return;
    }
    const numAnswer = parseInt(userAnswer, 10);
    if (Number.isNaN(numAnswer)) {
      setError("Please enter a valid number.");
      return;
    }

    setSubmitting(true);

    if (numAnswer === mathQuestion.answer) {
      setSuccess(true);
      setError(null);
      const expiresAt = Date.now() + 30 * 60 * 1000;
      sessionStorage.setItem(storageKey, JSON.stringify({ expiresAt }));

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("kids_parental_gate_log").insert({
            user_id: user.id,
            feature_name: featureName,
          });
        }
      } catch (e) {
        console.warn("Could not log parental gate verification:", e);
      }

      setTimeout(() => onSuccess(), 800);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setNow(Date.now());
        setError(`Too many incorrect answers. Please wait before trying again.`);
      } else {
        const left = MAX_ATTEMPTS - newAttempts;
        setError(
          `That's not right. ${left} ${left === 1 ? "attempt" : "attempts"} left. Try a new question or check the math.`
        );
      }
      setUserAnswer("");
      setSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleCancel = () => {
    onCancel?.();
    window.location.assign("/");
  };

  return (
    <DialogPrimitive.Root open={isOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[1000] bg-black/80"
          onPointerDown={(e) => e.preventDefault()}
        />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-[1001] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg sm:rounded-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-purple-700">
              <Shield className="w-6 h-6 text-purple-500" />
              Parent Check 👨‍👩‍👧
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              To access {featureName}, please ask your parent or guardian to solve this math problem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-white/80 rounded-xl p-6 text-center shadow-inner border-2 border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-purple-600 font-medium">Ask your parent: 🧮</p>
                <button
                  type="button"
                  onClick={refreshQuestion}
                  disabled={success || isLocked}
                  className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:opacity-40"
                  aria-label="Get a new question"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> New question
                </button>
              </div>
              <p className="text-3xl font-bold text-purple-800 mb-4" aria-live="polite">
                {mathQuestion.question}
              </p>

              <Input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  if (error) setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter the answer"
                className="text-center text-xl font-semibold h-14 border-2 border-purple-200 focus:border-purple-400"
                disabled={success || isLocked}
                autoFocus
                aria-invalid={!!error}
                aria-describedby="parental-gate-status"
              />

              {!error && !success && attempts > 0 && (
                <p className="text-xs text-purple-500 mt-2">
                  Attempts left: <strong>{attemptsLeft}</strong>
                </p>
              )}
            </div>

            <div id="parental-gate-status" aria-live="assertive" className="min-h-[3rem]">
              {error && !isLocked && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {isLocked && (
                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Temporarily locked</p>
                    <p>Try again in <strong>{remainingLockSec}s</strong>.</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Correct! Opening {featureName}…</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-2 border-purple-200 hover:bg-purple-50"
                disabled={success}
              >
                Cancel & go home
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={!userAnswer || success || isLocked || submitting}
              >
                {success ? "Opening…" : submitting ? "Checking…" : "Verify answer ✓"}
              </Button>
            </div>

            <div className="bg-purple-100/50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-center text-purple-700 font-medium">
                🔒 This safety check ensures adult supervision for AI-interactive features.
              </p>
              <p className="text-xs text-center text-purple-600 mt-1">
                Use <strong>New question</strong> if the math feels too tricky.
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Hook to check if parental gate has been verified recently
export function useParentalGate(storageKey: string = 'parental_gate_verified') {
  const [isVerified, setIsVerified] = useState(false);

  const checkVerification = () => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const { expiresAt } = JSON.parse(stored);
        if (Date.now() < expiresAt) {
          setIsVerified(true);
          return true;
        } else {
          sessionStorage.removeItem(storageKey);
        }
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }
    setIsVerified(false);
    return false;
  };

  useEffect(() => {
    checkVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const resetVerification = () => {
    sessionStorage.removeItem(storageKey);
    setIsVerified(false);
  };

  return { isVerified, checkVerification, resetVerification };
}
