import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Sparkles } from "lucide-react";

interface Props {
  nominatorName?: string | null;
  consentStatus?: string | null;
  nominationStory?: string | null;
}

export function HeroNominationCard({ nominatorName, consentStatus, nominationStory }: Props) {
  if (!nominatorName && !nominationStory) return null;
  const consentLabel: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    granted: { label: "Hero consented", variant: "default" },
    pending: { label: "Awaiting hero consent", variant: "secondary" },
    not_required: { label: "Public-figure nomination", variant: "outline" },
    declined: { label: "Hero declined", variant: "outline" },
  };
  const consent = consentStatus ? consentLabel[consentStatus] : null;

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Nominated by the Community</h3>
      </div>
      {nominatorName && (
        <div className="flex items-center gap-2 mb-2 text-sm">
          <UserCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Nominated by</span>
          <span className="font-medium">{nominatorName}</span>
          {consent && <Badge variant={consent.variant} className="ml-auto">{consent.label}</Badge>}
        </div>
      )}
      {nominationStory && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-3 border-l-2 border-primary/30 pl-3 italic">
          "{nominationStory}"
        </p>
      )}
    </Card>
  );
}
