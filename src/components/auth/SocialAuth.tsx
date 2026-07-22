import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";

/**
 * Social & passwordless auth block.
 * - "Continue with Google" via Supabase OAuth
 * - Magic-link email (OTP link) for password-free sign-in
 *
 * The Google provider must be enabled in Supabase → Authentication → Providers
 * with a Google Cloud OAuth Client ID / Secret. Until then Supabase returns
 * `provider is not enabled` and we surface it as a toast.
 */
export function SocialAuth() {
  const { toast } = useToast();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" } } });
    if (error) { setLoadingGoogle(false);
      toast({
        title: "Google sign-in unavailable",
        description:
          error.message ||
          "The Google provider is not enabled yet. Please try email sign-in.",
        variant: "destructive" });
    }
    // On success the browser is redirected — no cleanup needed.
  };

  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = magicEmail.trim().toLowerCase();
    if (!email) return;
    setLoadingMagic(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true } });
    setLoadingMagic(false);
    if (error) { toast({
        title: "Could not send magic link",
        description: error.message,
        variant: "destructive" });
      return;
    }
    setMagicSent(true);
    toast({
      title: "Check your inbox",
      description: `We sent a sign-in link to ${email}.` });
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={loadingGoogle}
      >
        {loadingGoogle ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.72 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.94 0 3.24.83 3.98 1.54l2.72-2.62A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.05 9.6-9.76 0-.66-.07-1.16-.16-1.66H12z"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or magic link</span>
        </div>
      </div>

      {magicSent ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          <p className="font-medium">Sign-in link sent ✉️</p>
          <p className="text-muted-foreground mt-1">
            Open the email from <span className="font-mono">{magicEmail}</span> on this
            device to finish signing in. The link expires in 1 hour.
          </p>
          <Button
            type="button"
            variant="link"
            className="px-0 mt-2"
            onClick={() => setMagicSent(false)}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-2">
          <Label htmlFor="magic-email" className="sr-only">
            Email for magic link
          </Label>
          <div className="flex gap-2">
            <Input
              id="magic-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loadingMagic || !magicEmail}>
              {loadingMagic ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" /> Send
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No password needed. We&apos;ll email you a one-tap sign-in link.
          </p>
        </form>
      )}
    </div>
  );
}

export default SocialAuth;
