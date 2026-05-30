import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to check and deduct tutorial platform AI credits.
 * Uses the tutoring_credits table as the shared credit pool.
 */
export const useTutorialAICredits = () => {
  const { credits, isLoading, spendCredit, isUsingCredit } = useTutoringCredits();
  const { toast } = useToast();

  const checkAndDeduct = async (amount: number): Promise<boolean> => {
    if (credits < amount) {
      toast({
        title: "Insufficient Credits",
        description: `This action requires ${amount} credits. You have ${credits}. Purchase more to continue.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      for (let i = 0; i < amount; i++) {
        await spendCredit();
      }
      return true;
    } catch (err) {
      toast({
        title: "Credit Error",
        description: "Failed to deduct credits. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    credits,
    isLoading,
    isDeducting: isUsingCredit,
    checkAndDeduct,
  };
};
