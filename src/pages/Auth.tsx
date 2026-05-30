import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

import { Eye, EyeOff, CalendarIcon, ShieldAlert, Baby } from "lucide-react";
import { Age16Badge } from "@/components/Age16Badge";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import { AuthReferralBanner } from "@/components/referral/AuthReferralBanner";
import { Captcha } from "@/components/Captcha";

const MIN_AGE = 16;
const MIN_PASSWORD_LENGTH = 10;
// Bump these when the legal text changes — the new value is captured in gdpr_consent_audit.
const PRIVACY_POLICY_VERSION = "2026-01-15";
const TERMS_OF_USE_VERSION = "2026-01-15";

const calculateAge = (birthDate: Date): number => differenceInYears(new Date(), birthDate);

const passwordStrengthError = (pwd: string): string | null => {
  if (pwd.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  let classes = 0;
  if (/[a-z]/.test(pwd)) classes++;
  if (/[A-Z]/.test(pwd)) classes++;
  if (/\d/.test(pwd)) classes++;
  if (/[^A-Za-z0-9]/.test(pwd)) classes++;
  if (classes < 3) return "Password must contain at least 3 of: lowercase, uppercase, digit, symbol.";
  return null;
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  // Where to send the user after successful login. Allow only same-origin paths
  // and blacklist auth-flow routes to prevent infinite redirect loops.
  const REDIRECT_BLACKLIST = ["/auth", "/reset-password", "/logout"];
  const redirectParam = searchParams.get("redirect");
  const isSafePath =
    !!redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//") &&
    !REDIRECT_BLACKLIST.some((p) => redirectParam === p || redirectParam.startsWith(`${p}/`) || redirectParam.startsWith(`${p}?`));
  const safeRedirect = isSafePath ? (redirectParam as string) : "/wall";
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [showAgeBlock, setShowAgeBlock] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check existing session AND listen for cross-tab logins.
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) navigate(safeRedirect, { replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        navigate(safeRedirect, { replace: true });
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate, safeRedirect]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail || resendCooldown > 0) return;
    setResendCooldown(60);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: unconfirmedEmail,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast({ variant: "destructive", title: "Resend failed", description: error.message });
    } else {
      toast({ title: "Confirmation email sent", description: `Check ${unconfirmedEmail}.` });
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!privacyConsent || !termsConsent) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description: "Please agree to the Privacy Policy and Terms of Use to continue.",
      });
      return;
    }

    if (!captchaVerified) {
      toast({
        variant: "destructive",
        title: "Captcha required",
        description: "Please complete the captcha to prove you're not a robot.",
      });
      return;
    }

    if (!birthDate) {
      toast({
        variant: "destructive",
        title: "Date of birth required",
        description: "Please select your date of birth to continue.",
      });
      return;
    }

    const age = calculateAge(birthDate);
    if (age < MIN_AGE) {
      // Block under-16 with a friendly Kids Channel redirect
      setShowAgeBlock(true);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    const password = (formData.get("password") as string) || "";
    const fullName = ((formData.get("fullName") as string) || "").trim();
    const phone = ((formData.get("phone") as string) || "").trim();
    const companyName = ((formData.get("companyName") as string) || "").trim();

    const strengthError = passwordStrengthError(password);
    if (strengthError) {
      toast({ variant: "destructive", title: "Weak password", description: strengthError });
      return;
    }

    setLoading(true);

    const selectedLanguage = 'en';
    const isoBirthDate = format(birthDate, "yyyy-MM-dd");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          phone: phone,
          company_name: companyName || null,
          preferred_language: selectedLanguage,
          birth_date: isoBirthDate,
          // GDPR consent audit — server trigger reads these and writes an append-only row.
          privacy_consent_version: PRIVACY_POLICY_VERSION,
          terms_consent_version: TERMS_OF_USE_VERSION,
          signup_user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
        },
      },
    });

    // Profile fields (birth_date, preferred_language) are persisted server-side by
    // the public.handle_new_user trigger from raw_user_meta_data. Do NOT update from
    // the client: when email confirmation is required there is no session yet and
    // RLS would reject the UPDATE.

    setLoading(false);

    if (error) {
      const msg = (error.message || "").toLowerCase();
      const isAgeBlock = msg.includes("at least 16") || msg.includes("check_violation");
      if (isAgeBlock) {
        setShowAgeBlock(true);
        return;
      }
      toast({
        variant: "destructive",
        title: "Registration error",
        description: error.message,
      });
    } else {
      setUnconfirmedEmail(email);
      toast({
        title: "Registration successful!",
        description: "Check your email for confirmation.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    const password = (formData.get("password") as string) || "";

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // Detect transient backend outages (Supabase auth/DB timeouts, 5xx, network).
      const msg = (error.message || "").toLowerCase();
      const status = (error as any).status as number | undefined;
      const isUnavailable =
        status === 0 ||
        status === 408 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        msg.includes("timeout") ||
        msg.includes("failed to fetch") ||
        msg.includes("network") ||
        msg.includes("unavailable") ||
        msg.includes("upstream");

      const isUnconfirmed = msg.includes("not confirmed") || msg.includes("email not confirmed");
      if (isUnconfirmed) setUnconfirmedEmail(email);

      toast({
        variant: "destructive",
        title: isUnavailable ? "Service temporarily unavailable" : "Login error",
        description: isUnavailable
          ? "Please try again in a moment."
          : error.message,
      });
    } else {
      toast({
        title: "Login successful!",
      });
      navigate(safeRedirect, { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Password reset link sent!",
        description: "Check your email for the reset link.",
      });
      setShowForgotPassword(false);
    }
  };

  // Under-16 block screen — friendly redirect to the Kids Channel
  if (showAgeBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center border-primary/30">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">You must be 16 or older</CardTitle>
            <CardDescription className="text-base">
              The main Unique platform is intended for users aged 16 and over (GDPR).
              But don't worry — we built a magical place just for you!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick explanation of what's inside Kids Channel */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-left">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Baby className="w-4 h-4 text-primary" />
                Kids Channel (ages 6–12) includes:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-1">
                <li>✨ Safe, ad-free stories, games & bedtime tales</li>
                <li>🎨 AI story creator and character chat</li>
                <li>🛡️ Parental gate for sensitive features</li>
                <li>📊 Parent dashboard with screen-time controls</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
              onClick={() => navigate("/kids-channel")}
            >
              <Baby className="w-4 h-4 mr-2" />
              Go to Kids Channel →
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAgeBlock(false);
                setBirthDate(undefined);
              }}
            >
              Back to registration
            </Button>
            <p className="text-xs text-muted-foreground pt-1">
              A parent or guardian should set up and supervise the Kids Channel account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-48 sm:pb-4">
      <div className="w-full max-w-md">
        <AuthReferralBanner />
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <CardTitle>{"Welcome!"}</CardTitle>
                <Age16Badge size="xs" withLabel={false} />
              </div>
              <CardDescription>{"Please log in to continue"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <div>
              <Button
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="mb-4"
              >
                {"← Back to login"}
              </Button>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{"Email"}</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{"Login"}</TabsTrigger>
                <TabsTrigger value="signup">{"Sign Up"}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{"Email"}</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{"Password"}</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    {"Forgot password?"}
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{"Full name"}</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">{"Phone"} *</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 XXX XXX XXXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">{"Company Name"} ({"optional"})</Label>
                    <Input
                      id="signup-company"
                      name="companyName"
                      type="text"
                      placeholder={"Your Company Name"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{"Email"}</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{"Password"}</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignupPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={MIN_PASSWORD_LENGTH}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-dob" className="flex items-center gap-2">
                      Date of birth <span className="text-destructive">*</span>
                      <Age16Badge size="xs" withLabel={false} variant="subtle" />
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="signup-dob"
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthDate ? format(birthDate, "PPP") : <span>Select your date of birth</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={birthDate}
                          onSelect={setBirthDate}
                          disabled={(date) => {
                            const maxBirth = new Date();
                            maxBirth.setFullYear(maxBirth.getFullYear() - MIN_AGE);
                            return date > maxBirth || date < new Date("1900-01-01");
                          }}
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          defaultMonth={birthDate ?? new Date(2005, 0)}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      You must be at least 16 to use the main platform.
                      Younger users can visit the{" "}
                      <Link to="/kids-channel" className="text-primary hover:underline">
                        Kids Channel
                      </Link>.
                    </p>
                  </div>

                  <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="privacy-consent" 
                        checked={privacyConsent}
                        onCheckedChange={(checked) => setPrivacyConsent(checked as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="privacy-consent" className="text-sm leading-tight cursor-pointer">
                        I agree to the processing of my personal data in accordance with the{" "}
                        <a 
                          href="/legal/privacy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </a>
                        {" "}(GDPR compliant)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="terms-consent" 
                        checked={termsConsent}
                        onCheckedChange={(checked) => setTermsConsent(checked as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms-consent" className="text-sm leading-tight cursor-pointer">
                        I agree to the{" "}
                        <a 
                          href="/terms" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms of Service
                        </a>
                        {" "}and understand the platform rules
                      </Label>
                    </div>
                  </div>

                  <Captcha onVerify={setCaptchaVerified} />

                  <Button type="submit" className="w-full" disabled={loading || !privacyConsent || !termsConsent || !birthDate || !captchaVerified}>
                    {loading ? "Registering..." : "Sign up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
