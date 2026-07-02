import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Award, Download, Loader2, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Cert {
  id: string;
  course_id: string;
  student_name: string | null;
  certificate_url: string | null;
  issued_at: string;
  courses?: { title: string } | null;
}

interface Props { onBack: () => void; }

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
const isPdfUrl = (url: string) => /\.pdf(\?|$)/i.test(url);

export function CertificateGalleryView({ onBack }: Props) {
  const [certificates, setCertificates] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState<Cert | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Reset spinner whenever the selected certificate changes or dialog closes,
  // with a safety timeout in case the iframe/image never fires onLoad/onError.
  useEffect(() => {
    if (!previewCert) {
      setPreviewLoading(false);
      setPreviewingId(null);
      return;
    }
    setPreviewLoading(true);
    const timeout = window.setTimeout(() => {
      setPreviewLoading(false);
      toast.message("Preview is loading longer than usual", {
        description: "If it doesn't appear, try downloading the certificate.",
      });
    }, 10000);
    return () => window.clearTimeout(timeout);
  }, [previewCert?.id]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("course_certificates")
        .select("id,course_id,student_name,certificate_url,issued_at,courses(title)")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      if (error) {
        toast.error("Error loading certificates");
        console.error(error);
      }
      setCertificates((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const generateFallback = (cert: Cert) => {
    const content = `===== CERTIFICATE OF COMPLETION =====\n\nAwarded to: ${cert.student_name || "Student"}\nCourse: ${cert.courses?.title || cert.course_id}\nDate: ${new Date(cert.issued_at).toLocaleDateString()}\n\nIssued by: Unique Tutorial Platform\nVerification ID: CERT-${cert.id}\n`;
    return new Blob([content], { type: "text/plain" });
  };

  const handleDownload = async (cert: Cert) => {
    if (downloadingId) return;
    setDownloadingId(cert.id);
    try {
      if (cert.certificate_url) {
        const a = document.createElement("a");
        a.href = cert.certificate_url;
        a.download = `Certificate_${cert.id}`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Download started");
      } else {
        toast.warning("The certificate has not been generated yet — downloading a text preview.");
        const blob = generateFallback(cert);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Certificate_${cert.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 600);
    }
  };

  const handlePreview = (cert: Cert) => {
    if (!cert.certificate_url) {
      toast.warning("Preview is not available — no file has been generated yet for this certificate.");
      return;
    }
    setPreviewingId(cert.id);
    setPreviewLoading(true);
    setPreviewCert(cert);
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Certificate Gallery</h2>
          <p className="text-sm text-muted-foreground">{certificates.length} certificates</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : certificates.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">You don't have any certificates yet. Complete a course and get your first one!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map(cert => {
            const hasUrl = !!cert.certificate_url;
            return (
              <Card key={cert.id} className="overflow-hidden hover:shadow-xl transition-all group">
                <div className="h-36 bg-gradient-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center relative">
                  <Award className="w-16 h-16 text-amber-500/30 group-hover:scale-110 transition-transform" />
                  {!hasUrl && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-[10px] bg-background/80">
                      <AlertTriangle className="w-3 h-3 mr-1" />No file
                    </Badge>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold text-sm mb-1 line-clamp-1">{cert.courses?.title || "Course"}</h3>
                  <p className="text-sm text-muted-foreground">Awarded to: <strong>{cert.student_name || "Student"}</strong></p>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <span className="text-xs text-muted-foreground">{new Date(cert.issued_at).toLocaleDateString()}</span>
                  </div>
                  {!hasUrl && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2">
                      The certificate file is not yet available. You can download a text preview.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handlePreview(cert)}
                      disabled={!hasUrl || previewingId === cert.id || downloadingId === cert.id}
                    >
                      {previewingId === cert.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3 mr-1" />
                      )}
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleDownload(cert)}
                      disabled={downloadingId === cert.id || previewingId === cert.id}
                    >
                      {downloadingId === cert.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3 mr-1" />
                      )}
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!previewCert} onOpenChange={(open) => { if (!open) { setPreviewCert(null); setPreviewingId(null); setPreviewLoading(false); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewCert?.courses?.title || "Certificate"}</DialogTitle>
          </DialogHeader>
          {previewCert?.certificate_url && (
            <div className="w-full h-[70vh] bg-muted rounded-md overflow-hidden relative">
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/70 z-10">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
              {isImageUrl(previewCert.certificate_url) ? (
                <img
                  src={previewCert.certificate_url}
                  alt="Certificate"
                  className="w-full h-full object-contain"
                  onLoad={() => setPreviewLoading(false)}
                  onError={() => { setPreviewLoading(false); toast.error("Failed to load preview"); }}
                />
              ) : isPdfUrl(previewCert.certificate_url) ? (
                <iframe
                  src={previewCert.certificate_url}
                  className="w-full h-full"
                  title="Certificate PDF"
                  onLoad={() => setPreviewLoading(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                  <p className="text-sm text-muted-foreground">This format cannot be displayed directly.</p>
                  <Button onClick={() => { setPreviewLoading(false); window.open(previewCert.certificate_url!, "_blank"); }}>
                    Open in new window
                  </Button>
                </div>
              )}
            </div>
          )}
          {previewCert && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setPreviewCert(null); setPreviewingId(null); setPreviewLoading(false); }}>Close</Button>
              <Button onClick={() => handleDownload(previewCert)} disabled={downloadingId === previewCert.id}>
                {downloadingId === previewCert.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
