import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnonymousDate } from "@/hooks/useAnonymousDate";
import { AnonymousDateHeader } from "@/components/anonymous-date/AnonymousDateHeader";
import { CreditPackages } from "@/components/anonymous-date/CreditPackages";
import { ProfileSetup } from "@/components/anonymous-date/ProfileSetup";
import { ActiveMatches } from "@/components/anonymous-date/ActiveMatches";
import { AdultWarningModal } from "@/components/anonymous-date/AdultWarningModal";
import { AccessPaymentGate } from "@/components/anonymous-date/AccessPaymentGate";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus } from "lucide-react";

export default function AnonymousDate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [payingAccess, setPayingAccess] = useState(false);

  const {
    credits,
    loading,
    activeMatches,
    fetchCredits,
    fetchActiveMatches,
    purchaseCredits,
    findMatch,
  } = useAnonymousDate();

  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  useEffect(() => {
    const adultWarningAccepted = sessionStorage.getItem("adult_warning_accepted");
    if (!adultWarningAccepted) {
      setShowAdultWarning(true);
    } else {
      checkAccess();
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Payment Successful!",
        description: "Your credits have been added",
      });
      fetchCredits();
      setSearchParams({});
    } else if (searchParams.get("canceled") === "true") {
      toast({
        title: "Payment Canceled",
        description: "You can try again anytime",
        variant: "destructive",
      });
      setSearchParams({});
    } else if (searchParams.get("subscription") === "success") {
      toast({
        title: "Subscription Active!",
        description: "Welcome to Anonymous Date - your monthly subscription is now active",
      });
      checkAccess();
      setSearchParams({});
    } else if (searchParams.get("subscription") === "cancelled") {
      toast({
        title: "Subscription Canceled",
        description: "Subscription payment was canceled",
        variant: "destructive",
      });
      setSearchParams({});
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasAccess) {
      checkProfile();
    }
  }, [hasAccess]);

  const checkAccess = async () => {
    try {
      setCheckingAccess(true);
      const { data, error } = await supabase.functions.invoke("check-anonymous-date-access");
      
      if (error) throw error;
      
      setHasAccess(data.hasAccess);
      setSubscriptionEnd(data.subscriptionEnd);
    } catch (error) {
      console.error("Error checking access:", error);
      toast({
        title: "Error",
        description: "Failed to verify subscription",
        variant: "destructive",
      });
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal-anonymous-date");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Error opening portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    }
  };

  const handlePayAccess = async () => {
    try {
      setPayingAccess(true);
      const { data, error } = await supabase.functions.invoke("pay-anonymous-date-access");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Error paying access:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setPayingAccess(false);
    }
  };

  const handleAcceptAdultWarning = () => {
    sessionStorage.setItem("adult_warning_accepted", "true");
    setShowAdultWarning(false);
    checkAccess();
  };

  const handleDeclineAdultWarning = () => {
    sessionStorage.removeItem("adult_warning_accepted");
    setShowAdultWarning(false);
    navigate("/");
  };

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data } = await supabase
        .from("anonymous_dating_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setHasProfile(!!data);
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenChat = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowChat(true);
  };

  if (showAdultWarning) {
    return (
      <AdultWarningModal
        open={showAdultWarning}
        onAccept={handleAcceptAdultWarning}
        onDecline={handleDeclineAdultWarning}
      />
    );
  }

  if (checkingAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Checking access...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessPaymentGate onPayAccess={handlePayAccess} loading={payingAccess} />;
  }

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AnonymousDateHeader />
        <div className="max-w-4xl mx-auto">
          <ProfileSetup onComplete={() => {
            setHasProfile(true);
            checkProfile();
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <AnonymousDateHeader />

      {subscriptionEnd && (
        <div className="max-w-6xl mx-auto bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold text-green-800">Active Subscription</p>
            <p className="text-sm text-green-700">
              Your subscription renews on {new Date(subscriptionEnd).toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={handleManageSubscription}
            variant="outline"
            size="sm"
          >
            Manage Subscription
          </Button>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <CreditPackages onPurchase={purchaseCredits} currentCredits={credits} />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={findMatch}
            disabled={loading || credits < 5}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white"
          >
            <Search className="h-5 w-5 mr-2" />
            Find New Match (5 credits)
          </Button>
          
          <Button
            onClick={() => {
              setHasProfile(false);
              checkProfile();
            }}
            variant="outline"
            size="lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Edit Profile
          </Button>
        </div>

        <ActiveMatches matches={activeMatches} onOpenChat={handleOpenChat} />

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold">How Anonymous Date Works - Complete Guide</h3>
          <div className="space-y-4 text-sm">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
              <p className="font-semibold text-base mb-2">💳 Monthly Subscription (€1/month)</p>
              <p className="text-muted-foreground">
                Your monthly subscription gives you full platform access. This includes profile creation, 
                match viewing, and access to all features. You can cancel anytime.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white border rounded-lg p-4">
                <p className="font-semibold mb-2">📝 Step 1: Create Your Profile</p>
                <p className="text-muted-foreground text-xs">
                  Set up your anonymous identity with an alias, age range, interests, and personality traits. 
                  Your real name, photo, and contact info remain completely hidden until you choose to reveal them.
                </p>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <p className="font-semibold mb-2">🔍 Step 2: Find a Match (5 credits)</p>
                <p className="text-muted-foreground text-xs">
                  Our algorithm matches you with someone based on shared interests and compatibility. 
                  Each match costs 5 credits to start the anonymous dating experience.
                </p>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <p className="font-semibold mb-2">💬 Step 3: Chat Anonymously (7 Days)</p>
                <p className="text-muted-foreground text-xs">
                  Text messages: 1 credit each • Voice messages: 3 credits each
                  <br />Get to know each other through personality and conversation, not appearance.
                </p>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <p className="font-semibold mb-2">👀 Step 4: Identity Reveal</p>
                <p className="text-muted-foreground text-xs">
                  After 7 days, both can reveal identities for FREE. 
                  Or pay 15 credits for early reveal if there's a strong connection.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="font-semibold mb-2">✨ Premium Features</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong>Hints (5 credits):</strong> Get subtle clues about your match's appearance or personality</li>
                <li>• <strong>Virtual Gifts (10 credits):</strong> Send special gifts to show interest and affection</li>
                <li>• <strong>Voice Messages (3 credits):</strong> Add a personal, emotional touch to your conversations</li>
                <li>• <strong>Early Reveal (15 credits):</strong> Can't wait 7 days? Reveal identities early</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="font-semibold mb-1">💰 Credit Packages Available</p>
              <p className="text-xs text-muted-foreground">
                Credits are separate from your monthly subscription and are used for matching and messaging:
                <br />• Basic: 10 credits for €5 • Standard: 30 credits for €12
                <br />• Premium: 100 credits for €25 • Ultimate: 300 credits for €60
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="font-semibold mb-1">🎯 Why Anonymous Date?</p>
              <p className="text-xs text-muted-foreground">
                Connect based on personality and compatibility, not looks. Build genuine connections 
                through conversation. No pressure from photos or social media profiles. Safe, verified 
                community with monthly subscription ensuring real, committed users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}