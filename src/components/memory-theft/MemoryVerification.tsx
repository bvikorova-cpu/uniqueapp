import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";

interface Memory {
  id: string;
  title: string;
  description: string;
  is_verified: boolean;
}

interface Verification {
  id: string;
  memory_id: string;
  verification_cost: number;
  status: string;
  created_at: string;
}

const MemoryVerification = () => {
  const [myMemories, setMyMemories] = useState<Memory[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyMemories();
    fetchVerifications();
  }, []);

  const fetchMyMemories = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("memories")
      .select("id, title, description, is_verified")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your memories",
        variant: "destructive",
      });
    } else {
      setMyMemories(data || []);
    }
    setLoading(false);
  };

  const fetchVerifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("memory_verifications")
      .select("*")
      .eq("requested_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch verifications", error);
    } else {
      setVerifications(data || []);
    }
  };

  const requestVerification = async (memoryId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request verification",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("memory_verifications").insert([
      {
        memory_id: memoryId,
        requested_by: user.id,
        verification_cost: 0.99,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to request verification",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Verification requested for 0.99€",
      });
      fetchVerifications();
    }
  };

  const getVerificationStatus = (memoryId: string) => {
    return verifications.find((v) => v.memory_id === memoryId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "verified":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Memory Verification</h2>
        <p className="text-muted-foreground">
          Verify your memories as authentic for 0.99€ to increase trust and sales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading your memories...</p>
        ) : myMemories.length === 0 ? (
          <p className="text-muted-foreground">No memories to verify</p>
        ) : (
          myMemories.map((memory) => {
            const verification = getVerificationStatus(memory.id);
            const isVerified = memory.is_verified;
            const hasPendingVerification = verification && verification.status === "pending";

            return (
              <Card key={memory.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{memory.title}</CardTitle>
                      <CardDescription className="mt-1">{memory.description}</CardDescription>
                    </div>
                    {isVerified && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isVerified ? (
                    <div className="text-sm text-muted-foreground">
                      This memory has been verified as authentic
                    </div>
                  ) : hasPendingVerification ? (
                    <div className="space-y-2">
                      {getStatusBadge(verification.status)}
                      <p className="text-sm text-muted-foreground">
                        Your verification request is being processed
                      </p>
                    </div>
                  ) : verification && verification.status === "rejected" ? (
                    <div className="space-y-2">
                      {getStatusBadge(verification.status)}
                      <p className="text-sm text-muted-foreground">
                        Verification was rejected. Please review your content.
                      </p>
                      <Button
                        onClick={() => requestVerification(memory.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Request Again (0.99€)
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => requestVerification(memory.id)}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Request Verification (0.99€)
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MemoryVerification;
