import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Settings, Shield, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const CONSENT_KEY = "gdpr_cookie_consent";
const PREFERENCES_KEY = "gdpr_cookie_preferences";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  const safeGet = (key: string) => {
    try {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeSet = (key: string, value: string) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
    } catch {
      // ignore storage errors (e.g., blocked third-party storage)
    }
  };

  useEffect(() => {
    const consent = safeGet(CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      const saved = safeGet(PREFERENCES_KEY);
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch {
          // ignore malformed JSON
        }
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    safeSet(CONSENT_KEY, new Date().toISOString());
    safeSet(PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  };

  const savePreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg sm:bg-transparent sm:border-t-0 sm:shadow-none">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-3 sm:p-6 shadow-xl">
          <div className="flex items-start gap-2 sm:gap-4">
            <div className="hidden sm:block p-3 rounded-full bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Protecting your privacy
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                We use cookies to improve your experience, personalize content, and analyze traffic.
              </p>
              <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
                <Button onClick={acceptAll} size="sm" className="gap-2 flex-1 sm:flex-none min-w-0">
                  Accept all
                </Button>
                <Button variant="outline" size="sm" onClick={rejectAll} className="flex-1 sm:flex-none min-w-0">
                  Only necessary
                </Button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cookie settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Necessary cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Required for basic website functionality
                          </p>
                        </div>
                        <Switch checked disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Analytics cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Help us understand how you use the site
                          </p>
                        </div>
                        <Switch
                          checked={preferences.analytics}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, analytics: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Marketing cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Used for targeted advertising
                          </p>
                        </div>
                        <Switch
                          checked={preferences.marketing}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, marketing: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Personalization cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Customize content to your preferences
                          </p>
                        </div>
                        <Switch
                          checked={preferences.personalization}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, personalization: checked })
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={savePreferences} className="w-full">
                      Save settings
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={rejectAll}
              className="shrink-0 h-7 w-7 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
