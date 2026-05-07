import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Trash2, Upload, FileText, User, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Release {
  id: string;
  release_type: "model" | "property";
  signer_name: string;
  signer_email: string | null;
  signed_date: string | null;
  document_url: string | null;
  notes: string | null;
  verified: boolean;
}

interface ReleaseManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentItemId: string;
  contentTitle: string;
}

export function ReleaseManagerDialog({ open, onOpenChange, contentItemId, contentTitle }: ReleaseManagerDialogProps) {
  const { toast } = useToast();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<"model" | "property">("model");
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signedDate, setSignedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) loadReleases();
  }, [open, contentItemId]);

  const loadReleases = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("stock_content_releases")
      .select("*")
      .eq("content_item_id", contentItemId)
      .order("created_at", { ascending: false });
    setReleases((data as any) || []);
    setLoading(false);
  };

  const refreshItemFlags = async () => {
    const hasAny = releases.length > 0;
    const allVerified = releases.length > 0 && releases.every((r) => r.verified);
    await supabase
      .from("stock_content_items")
      .update({ requires_release: hasAny, releases_verified: allVerified })
      .eq("id", contentItemId);
  };

  const handleSubmit = async () => {
    if (!signerName.trim()) {
      toast({ title: "Missing signer name", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");

      let documentUrl: string | null = null;
      if (file) {
        const path = `${userId}/${contentItemId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("stock-releases").upload(path, file);
        if (upErr) throw upErr;
        documentUrl = path;
      }

      const { error } = await supabase.from("stock_content_releases").insert({
        content_item_id: contentItemId,
        creator_id: userId,
        release_type: type,
        signer_name: signerName.trim(),
        signer_email: signerEmail.trim() || null,
        signed_date: signedDate || null,
        document_url: documentUrl,
        notes: notes.trim() || null,
      });
      if (error) throw error;

      await supabase
        .from("stock_content_items")
        .update({ requires_release: true })
        .eq("id", contentItemId);

      toast({ title: "Release added", description: "Awaiting admin verification." });
      setSignerName(""); setSignerEmail(""); setSignedDate(""); setNotes(""); setFile(null);
      await loadReleases();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("stock_content_releases").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await loadReleases();
    await refreshItemFlags();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Releases — {contentTitle}</DialogTitle>
          <DialogDescription>
            Add legal model or property releases. Required for any recognizable people or private property.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Existing releases ({releases.length})</h4>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : releases.length === 0 ? (
              <p className="text-xs text-muted-foreground">No releases yet.</p>
            ) : (
              releases.map((r) => (
                <Card key={r.id} className="p-3 flex items-start gap-3">
                  {r.release_type === "model" ? (
                    <User className="w-5 h-5 text-primary mt-0.5" />
                  ) : (
                    <Building2 className="w-5 h-5 text-primary mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.signer_name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{r.release_type}</Badge>
                      {r.verified ? (
                        <Badge className="bg-green-600 text-white text-[10px]">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {r.signer_email && <span>{r.signer_email} · </span>}
                      {r.signed_date && <span>Signed {r.signed_date}</span>}
                    </div>
                    {r.document_url && (
                      <div className="flex items-center gap-1 text-[11px] text-primary mt-1">
                        <FileText className="w-3 h-3" /> Document attached
                      </div>
                    )}
                    {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </Card>
              ))
            )}
          </div>

          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-sm">Add new release</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model">Model release (person)</SelectItem>
                    <SelectItem value="property">Property release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Signed date</Label>
                <Input type="date" value={signedDate} onChange={(e) => setSignedDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Signer name *</Label>
                <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Full legal name" />
              </div>
              <div>
                <Label className="text-xs">Signer email</Label>
                <Input type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
            <div>
              <Label className="text-xs">Document (PDF/JPG/PNG)</Label>
              <Input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={handleSubmit} disabled={saving} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Add release"}
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
