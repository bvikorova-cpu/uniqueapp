import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  submissionId: string;
  category: string;
}

export default function MegatalentBoostButton({ submissionId, category }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const boost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-megatalent-boost", {
        body: { submission_id: submissionId, category },
      });
      if (error) throw error;
      if ((data as any)?.url) {
        window.location.href = (data as any).url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={boost}
      disabled={loading}
      size="sm"
      variant="outline"
      className="gap-1.5 h-8 border-amber-500/40 hover:border-amber-500 text-amber-500 hover:bg-amber-500/10"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
      <span className="text-xs font-bold">Boost €4.99</span>
    </Button>
  );
}
