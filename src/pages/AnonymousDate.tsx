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
    } else if (searchParams.get("access") === "paid") {
      toast({
        title: "Access Granted!",
        description: "Welcome to Anonymous Date",
      });
      checkAccess();
      setSearchParams({});
    } else if (searchParams.get("access") === "cancelled") {
      toast({
        title: "Payment Canceled",
        description: "Access payment was canceled",
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
    } catch (error) {
      console.error("Error checking access:", error);
      toast({
        title: "Error",
        description: "Failed to verify access",
        variant: "destructive",
      });
    } finally {
      setCheckingAccess(false);
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
          <h3 className="text-xl font-bold">How Anonymous Date Works</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Step 1:</strong> Purchase credits to participate in anonymous dating.
            </p>
            <p>
              <strong className="text-foreground">Step 2:</strong> Find a match (5 credits). You'll be paired with someone based on common interests.
            </p>
            <p>
              <strong className="text-foreground">Step 3:</strong> Chat anonymously for 7 days. Text messages cost 1 credit, voice messages cost 3 credits.
            </p>
            <p>
              <strong className="text-foreground">Step 4:</strong> After 7 days, both can reveal their identity. Or use early reveal for 15 credits.
            </p>
            <p>
              <strong className="text-foreground">Premium Features:</strong> Request hints about your match (5 credits), send gifts (10 credits).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}