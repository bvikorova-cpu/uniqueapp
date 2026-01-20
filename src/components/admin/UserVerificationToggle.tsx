import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, Shield } from "lucide-react";

interface UserVerificationToggleProps {
  userId: string;
  userName: string;
  isVerified?: boolean;
  onUpdate?: () => void;
}

export const UserVerificationToggle = ({ 
  userId, 
  userName, 
  isVerified = false,
  onUpdate 
}: UserVerificationToggleProps) => {
  const [verified, setVerified] = useState(isVerified);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: checked })
        .eq('id', userId);

      if (error) throw error;

      setVerified(checked);
      toast({
        title: checked ? "User Verified" : "Verification Removed",
        description: `${userName}'s verification status has been updated.`,
      });
      
      onUpdate?.();
    } catch (error) {
      console.error('Verification toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={verified}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      {verified ? (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
          <BadgeCheck className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          <Shield className="h-3 w-3 mr-1" />
          Unverified
        </Badge>
      )}
    </div>
  );
};
