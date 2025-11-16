import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Loader2 } from "lucide-react";

interface AgeVerificationProps {
  onVerified: () => void;
}

export function AgeVerification({ onVerified }: AgeVerificationProps) {
  const [birthDate, setBirthDate] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate age
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age < 18) {
        toast({
          variant: "destructive",
          title: "Age Restriction",
          description: "You must be 18 or older to participate in prize-based tournaments.",
        });
        return;
      }

      const { error } = await supabase
        .from('superhero_age_verification')
        .insert({
          user_id: user.id,
          birth_date: birthDate,
          is_verified: true,
          verified_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Age Verified ✓",
        description: "You can now participate in all features.",
      });

      onVerified();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-yellow-500" />
          <CardTitle>Age Verification Required</CardTitle>
        </div>
        <CardDescription>
          Prize-based tournaments require age verification (18+) for legal compliance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate">Date of Birth *</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
            <p className="font-semibold">Legal Notice:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You must be 18+ to participate in prize tournaments</li>
              <li>Skill-based gaming is legal in most jurisdictions</li>
              <li>Check your local laws regarding prize competitions</li>
              <li>Your data is protected per GDPR/privacy regulations</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I confirm I am 18+ and agree to the Terms of Service
            </Label>
          </div>

          <Button type="submit" disabled={loading || !agreed} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Age"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
