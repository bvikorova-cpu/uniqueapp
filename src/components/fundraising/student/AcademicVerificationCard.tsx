import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ShieldCheck, FileCheck, Calendar, Award, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Props {
  institutionVerified?: boolean;
  enrollmentVerified?: boolean;
  enrollmentDocUrl?: string | null;
  verifierName?: string | null;
  verifiedAt?: string | null;
  currentGpa?: number | null;
  expectedGraduation?: string | null;
  schoolName?: string | null;
}

export function AcademicVerificationCard({
  institutionVerified,
  enrollmentVerified,
  enrollmentDocUrl,
  verifierName,
  verifiedAt,
  currentGpa,
  expectedGraduation,
  schoolName,
}: Props) {
  const fullyVerified = institutionVerified && enrollmentVerified;

  return (
    <Card className={`p-4 border-2 ${fullyVerified ? "border-green-500/40 bg-green-500/5" : "border-border"}`}>
      <div className="flex items-start gap-3 mb-3">
        <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-sm">Academic Verification</h4>
            {fullyVerified && (
              <Badge className="text-xs gap-1 bg-green-600 hover:bg-green-700">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
          {schoolName && <p className="text-sm font-medium truncate">{schoolName}</p>}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${institutionVerified ? "bg-green-500" : "bg-muted-foreground/30"}`} />
          <span className={institutionVerified ? "" : "text-muted-foreground"}>
            Institution accredited
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${enrollmentVerified ? "bg-green-500" : "bg-muted-foreground/30"}`} />
          <span className={enrollmentVerified ? "" : "text-muted-foreground"}>
            Enrollment confirmed
          </span>
          {enrollmentDocUrl && (
            <a href={enrollmentDocUrl} target="_blank" rel="noreferrer" className="ml-auto text-primary hover:underline inline-flex items-center gap-1">
              <FileCheck className="w-3 h-3" /> Doc
            </a>
          )}
        </div>
        {currentGpa != null && (
          <div className="flex items-center gap-2">
            <Award className="w-3 h-3 text-accent" />
            <span>Current GPA: <strong>{currentGpa.toFixed(2)}</strong></span>
          </div>
        )}
        {expectedGraduation && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>Expected graduation: {format(new Date(expectedGraduation), "MMM yyyy")}</span>
          </div>
        )}
      </div>

      {fullyVerified && verifiedAt && (
        <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t">
          Verified{verifierName ? ` by ${verifierName}` : ""} · {format(new Date(verifiedAt), "MMM d, yyyy")}
        </p>
      )}
      {!fullyVerified && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t italic">
          Some credentials are still under review.
        </p>
      )}
    </Card>
  );
}
