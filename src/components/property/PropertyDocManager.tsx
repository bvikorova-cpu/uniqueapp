import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, Upload, Check, Clock, AlertTriangle, FolderOpen, Download, Shield, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const DOCUMENT_CATEGORIES = [
  {
    title: "Personal Documents", emoji: "👤", required: 3,
    docs: ["Valid ID / Passport", "Proof of Address", "Tax Returns (2 years)"],
  },
  {
    title: "Financial Documents", emoji: "💰", required: 4,
    docs: ["Bank Statements (3 months)", "Salary Slips", "Pre-Approval Letter", "Credit Report"],
  },
  {
    title: "Property Documents", emoji: "🏠", required: 3,
    docs: ["Property Valuation Report", "Title Deed Copy", "Floor Plans"],
  },
  {
    title: "Legal Documents", emoji: "⚖️", required: 2,
    docs: ["Purchase Agreement Draft", "Lawyer Power of Attorney"],
  },
];

const statusConfig = {
  uploaded: { icon: Check, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Uploaded" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  missing: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Missing" },
};

interface DocRow {
  id: string;
  category: string;
  doc_name: string;
  file_path: string;
  original_filename: string | null;
  created_at: string;
}

export function PropertyDocManager({ onBack }: Props) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTarget = useRef<{ category: string; doc_name: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("property_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setDocs((data as DocRow[]) || []));
  }, [user]);

  const findDoc = (category: string, doc_name: string) =>
    docs.find((d) => d.category === category && d.doc_name === doc_name);

  const triggerUpload = (category: string, doc_name: string) => {
    if (!user) {
      toast.error("Please sign in to upload documents");
      return;
    }
    pendingTarget.current = { category, doc_name };
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user || !pendingTarget.current) return;
    const { category, doc_name } = pendingTarget.current;
    pendingTarget.current = null;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be smaller than 20MB");
      return;
    }

    const key = `${category}::${doc_name}`;
    setBusyKey(key);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${category}/${Date.now()}-${doc_name.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("property-documents")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: row, error: insErr } = await supabase
        .from("property_documents")
        .insert({
          user_id: user.id,
          category,
          doc_name,
          status: "uploaded",
          file_path: path,
          original_filename: file.name,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      setDocs((prev) => [row as DocRow, ...prev.filter((d) => !(d.category === category && d.doc_name === doc_name))]);
      toast.success(`Uploaded: ${doc_name}`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusyKey(null);
    }
  };

  const handleView = async (doc: DocRow) => {
    const { data, error } = await supabase.storage
      .from("property-documents")
      .createSignedUrl(doc.file_path, 60 * 5);
    if (error || !data?.signedUrl) {
      toast.error("Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (doc: DocRow) => {
    if (!confirm(`Delete ${doc.doc_name}?`)) return;
    setBusyKey(doc.id);
    try {
      await supabase.storage.from("property-documents").remove([doc.file_path]);
      const { error } = await supabase.from("property_documents").delete().eq("id", doc.id);
      if (error) throw error;
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setBusyKey(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!docs.length) {
      toast.info("No documents to download yet");
      return;
    }
    toast.info(`Opening ${docs.length} download${docs.length === 1 ? "" : "s"}...`);
    for (const d of docs) {
      const { data } = await supabase.storage
        .from("property-documents")
        .createSignedUrl(d.file_path, 60 * 10, { download: d.original_filename || undefined });
      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = d.original_filename || "document";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  };

  const handleQuickUpload = () => {
    pendingTarget.current = { category: "Personal Documents", doc_name: "Other Document" };
    fileInputRef.current?.click();
  };

  const totalDocs = DOCUMENT_CATEGORIES.reduce((a, c) => a + c.required, 0);
  const uploadedDocs = DOCUMENT_CATEGORIES.reduce(
    (a, c) => a + c.docs.filter((d) => findDoc(c.title, d)).length,
    0
  );
  const progress = Math.round((uploadedDocs / totalDocs) * 100);

  return (
    <>
      <FloatingHowItWorks title={"Property Doc Manager - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Doc Manager section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Doc Manager.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">📋 Document Manager</h2>
          <p className="text-sm text-muted-foreground">Organize all your property transaction documents in one place</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-black text-sky-500">{progress}%</div>
            <p className="text-sm font-medium mt-1">Documents Complete</p>
            <Progress value={progress} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">{uploadedDocs} of {totalDocs} uploaded</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border-border/30">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold">Encrypted Storage</p>
            <p className="text-xs text-muted-foreground mt-1">Private, RLS-protected</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border-border/30">
          <CardContent className="p-6">
            <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white mb-2" onClick={handleQuickUpload}>
              <Upload className="h-4 w-4 mr-2" />Upload Document
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDownloadAll}>
              <Download className="h-4 w-4 mr-2" />Download All
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {DOCUMENT_CATEGORIES.map((cat, ci) => {
          const uploadedInCat = cat.docs.filter((d) => findDoc(cat.title, d)).length;
          return (
          <motion.div key={ci} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
            <Card className="bg-card/60 backdrop-blur-xl border-border/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xl">{cat.emoji}</span>{cat.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{uploadedInCat}/{cat.required} uploaded</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cat.docs.map((docName, di) => {
                  const existing = findDoc(cat.title, docName);
                  const status = existing ? "uploaded" : "pending";
                  const config = statusConfig[status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  const key = `${cat.title}::${docName}`;
                  const busy = busyKey === key || (existing && busyKey === existing.id);
                  return (
                    <motion.div key={di} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.1 + di * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/20">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{docName}</p>
                        {existing && <p className="text-[10px] text-muted-foreground truncate">{existing.original_filename} • {new Date(existing.created_at).toLocaleDateString()}</p>}
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                      {existing ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(existing)} disabled={!!busy}><Eye className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(existing)} disabled={!!busy}>
                            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => triggerUpload(cat.title, docName)} disabled={!!busy}>
                          {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Upload className="h-3 w-3 mr-1" />}Upload
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
}
