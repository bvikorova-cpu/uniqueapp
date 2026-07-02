import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, ExternalLink, Lock } from 'lucide-react';
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface MedicalDocumentsViewerProps {
  documents?: string[] | null;
  verified?: boolean | null;
  hospital?: string | null;
}

/**
 * Public viewer for medical proof documents (invoices, diagnoses, treatment plans).
 * Files are stored in Supabase Storage and accessed via signed URLs.
 * Sensitive personal data (patient ID, address) MUST be redacted before upload.
 */
export function MedicalDocumentsViewer({
  documents,
  verified,
  hospital,
}: MedicalDocumentsViewerProps) {
  const docs = documents ?? [];

  if (docs.length === 0) {
    return null;
  }

  return (
    <>
      <FloatingHowItWorks title={"Medical Documents Viewer - How it works"} steps={[{ title: 'Open', desc: 'Access the Medical Documents Viewer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Medical Documents Viewer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Medical Proof Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {verified ? 'Verified by our medical team' : 'Uploaded by campaign creator'} ·{' '}
              {docs.length} {docs.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
          {verified && (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
          <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Sensitive personal data (patient ID, address, full date of birth) has been
            redacted in compliance with GDPR.
          </p>
        </div>

        <div className="grid gap-2">
          {docs.map((url, idx) => {
            const name = decodeURIComponent(url.split('/').pop() || `Document ${idx + 1}`);
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate">{name}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </a>
            );
          })}
        </div>

        {hospital && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Treatment provider: <span className="font-medium text-foreground">{hospital}</span>
          </p>
        )}
      </CardContent>
    </Card>
    </>
  );
}
