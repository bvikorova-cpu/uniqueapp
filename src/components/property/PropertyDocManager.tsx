import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FileText, Upload, Check, Clock, AlertTriangle, FolderOpen, Download, Shield, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Props { onBack: () => void; }

const DOCUMENT_CATEGORIES = [
  {
    title: "Personal Documents", emoji: "👤", required: 3, uploaded: 2,
    docs: [
      { name: "Valid ID / Passport", status: "uploaded", date: "2024-01-15" },
      { name: "Proof of Address", status: "uploaded", date: "2024-01-14" },
      { name: "Tax Returns (2 years)", status: "pending", date: null },
    ],
  },
  {
    title: "Financial Documents", emoji: "💰", required: 4, uploaded: 1,
    docs: [
      { name: "Bank Statements (3 months)", status: "uploaded", date: "2024-01-10" },
      { name: "Salary Slips", status: "pending", date: null },
      { name: "Pre-Approval Letter", status: "pending", date: null },
      { name: "Credit Report", status: "missing", date: null },
    ],
  },
  {
    title: "Property Documents", emoji: "🏠", required: 3, uploaded: 0,
    docs: [
      { name: "Property Valuation Report", status: "pending", date: null },
      { name: "Title Deed Copy", status: "pending", date: null },
      { name: "Floor Plans", status: "pending", date: null },
    ],
  },
  {
    title: "Legal Documents", emoji: "⚖️", required: 2, uploaded: 0,
    docs: [
      { name: "Purchase Agreement Draft", status: "pending", date: null },
      { name: "Lawyer Power of Attorney", status: "pending", date: null },
    ],
  },
];

const statusConfig = {
  uploaded: { icon: Check, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Uploaded" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  missing: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Missing" },
};

export function PropertyDocManager({ onBack }: Props) {
  const totalDocs = DOCUMENT_CATEGORIES.reduce((a, c) => a + c.required, 0);
  const uploadedDocs = DOCUMENT_CATEGORIES.reduce((a, c) => a + c.uploaded, 0);
  const progress = Math.round((uploadedDocs / totalDocs) * 100);

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-muted-foreground mt-1">256-bit AES encryption</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl border-border/30">
          <CardContent className="p-6">
            <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white mb-2" onClick={() => toast.info("Upload Document — coming soon")}>
              <Upload className="h-4 w-4 mr-2" />Upload Document
            </Button>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Download All — coming soon")}>
              <Download className="h-4 w-4 mr-2" />Download All
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {DOCUMENT_CATEGORIES.map((cat, ci) => (
          <motion.div key={ci} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
            <Card className="bg-card/60 backdrop-blur-xl border-border/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-xl">{cat.emoji}</span>{cat.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{cat.uploaded}/{cat.required} uploaded</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cat.docs.map((doc, di) => {
                  const config = statusConfig[doc.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <motion.div key={di} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.1 + di * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/20">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.date && <p className="text-[10px] text-muted-foreground">Uploaded: {doc.date}</p>}
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                      {doc.status === "uploaded" ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("This action — coming soon")}><Eye className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info("This action — coming soon")}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.info("Upload — coming soon")}><Upload className="h-3 w-3 mr-1" />Upload</Button>
                      )}
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
