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
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, CalendarIcon, ShieldAlert, Baby } from "lucide-react";
import { Age16Badge } from "@/components/Age16Badge";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import { AuthReferralBanner } from "@/components/referral/AuthReferralBanner";
import { Captcha } from "@/components/Captcha";

const MIN_AGE = 16;

const calculateAge = (birthDate: Date): number => differenceInYears(new Date(), birthDate);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Where to send the user after successful login. Allow only same-origin paths.
  const redirectParam = searchParams.get("redirect");
  const safeRedirect =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/wall";
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [showAgeBlock, setShowAgeBlock] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(safeRedirect, { replace: true });
      }
    };
    checkSession();
  }, [navigate, safeRedirect]);

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

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const companyName = formData.get("companyName") as string;

    const selectedLanguage = i18n.language || 'en';
    const isoBirthDate = format(birthDate, "yyyy-MM-dd");

    const { data: signUpData, error } = await supabase.auth.signUp({
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
        },
      },
    });

    // Persist preferred_language + birth_date directly to the profile (best-effort)
    if (!error && signUpData?.user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            preferred_language: selectedLanguage,
            birth_date: isoBirthDate,
          } as any)
          .eq('id', signUpData.user.id);
      } catch (e) {
        console.warn('Could not persist profile fields at signup:', e);
      }
    }

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: t('auth.error_registration'),
        description: error.message,
      });
    } else {
      toast({
        title: t('auth.registration_success'),
        description: t('auth.check_email'),
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: t('auth.error_login'),
        description: error.message,
      });
    } else {
      toast({
        title: t('auth.login_success'),
      });
      navigate(safeRedirect, { replace: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: t('auth.error'),
        description: error.message,
      });
    } else {
      toast({
        title: t('auth.reset_link_sent'),
        description: t('auth.check_email_reset'),
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AuthReferralBanner />
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <CardTitle>{t('auth.welcome')}</CardTitle>
                <Age16Badge size="xs" withLabel={false} />
              </div>
              <CardDescription>{t('auth.please_login')}</CardDescription>
            </div>
            <LanguageSelector />
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
                {t('auth.back_to_login')}
              </Button>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t('auth.email')}</Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.sending') : t('auth.send_reset_link')}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login_tab')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signup_tab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
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
                    {t('auth.forgot_password')}
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.logging_in') : t('auth.log_in')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.full_name')}</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">{t('auth.phone')} *</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 XXX XXX XXXX"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">{t('auth.company_name')} ({t('auth.optional')})</Label>
                    <Input
                      id="signup-company"
                      name="companyName"
                      type="text"
                      placeholder={t('auth.company_placeholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignupPassword ? "text" : "password"}
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
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                    {loading ? t('auth.registering') : t('auth.sign_up')}
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
