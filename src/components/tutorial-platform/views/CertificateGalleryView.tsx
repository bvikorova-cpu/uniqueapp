import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Award, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Cert {
  id: string;
  course_id: string;
  student_name: string | null;
  certificate_url: string | null;
  issued_at: string;
  courses?: { title: string } | null;
}

interface Props { onBack: () => void; }

export function CertificateGalleryView({ onBack }: Props) {
  const [certificates, setCertificates] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("course_certificates")
        .select("id,course_id,student_name,certificate_url,issued_at,courses(title)")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      setCertificates((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const handleDownload = (cert: Cert) => {
    if (cert.certificate_url) {
      window.open(cert.certificate_url, "_blank");
      return;
    }
    const content = `===== CERTIFICATE OF COMPLETION =====\n\nAwarded to: ${cert.student_name || "Student"}\nCourse: ${cert.courses?.title || cert.course_id}\nDate: ${new Date(cert.issued_at).toLocaleDateString()}\n\nIssued by Unique Tutorial Platform\nVerification ID: CERT-${cert.id}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificate_${cert.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Certifikát stiahnutý");
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
          <p className="text-sm text-muted-foreground">{certificates.length} certifikátov</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : certificates.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Zatiaľ nemáš žiadne certifikáty. Dokonči kurz a získaj prvý!</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map(cert => (
            <Card key={cert.id} className="overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-36 bg-gradient-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center">
                <Award className="w-16 h-16 text-amber-500/30 group-hover:scale-110 transition-transform" />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{cert.courses?.title || "Course"}</h3>
                <p className="text-sm text-muted-foreground">Awarded to: <strong>{cert.student_name || "Student"}</strong></p>
                <div className="flex items-center gap-2 mt-2 mb-3">
                  <span className="text-xs text-muted-foreground">{new Date(cert.issued_at).toLocaleDateString()}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => handleDownload(cert)}>
                  <Download className="w-3 h-3 mr-1" />Stiahnuť certifikát
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
