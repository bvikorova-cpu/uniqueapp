import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  openToMatch?: boolean;
  tags?: string[];
  fieldOfStudy?: string | null;
  campaignTitle?: string;
}

export function ScholarshipMatchCard({ openToMatch, tags = [], fieldOfStudy, campaignTitle }: Props) {
  if (!openToMatch) return null;

  return (
    <>
      <FloatingHowItWorks title={"Scholarship Match Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Scholarship Match Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Scholarship Match Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="flex items-start gap-3">
        <Trophy className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-sm">Scholarship Eligible</h4>
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" /> Open to match
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            This student is open to scholarship matching from partner organizations and corporate sponsors.
          </p>
          {(tags.length > 0 || fieldOfStudy) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {fieldOfStudy && <Badge variant="outline" className="text-[10px]">{fieldOfStudy}</Badge>}
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              const subject = encodeURIComponent(`Scholarship match inquiry: ${campaignTitle ?? "student"}`);
              window.location.href = `mailto:scholarships@uniqueapp.fun?subject=${subject}`;
            }}
          >
            <Mail className="w-3 h-3 mr-2" /> Sponsor a Scholarship
          </Button>
        </div>
      </div>
    </Card>
    </>
  );
}
