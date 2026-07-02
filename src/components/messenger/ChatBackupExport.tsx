import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, FileJson, Calendar, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ChatBackupExportProps {
  onBack: () => void;
  userId: string;
}

export const ChatBackupExport = ({ onBack, userId }: ChatBackupExportProps) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ id: string; name: string; messageCount: number }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();

  const loadConversations = async () => {
    if (loaded) return;
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (!parts) return;

    const convs = await Promise.all(
      parts.map(async (p) => {
        const { data: otherParts } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", p.conversation_id)
          .neq("user_id", userId)
          .limit(1);

        let name = "Unknown";
        if (otherParts?.[0]) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherParts[0].user_id)
            .single();
          name = profile?.full_name || "Unknown";
        }

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", p.conversation_id);

        return { id: p.conversation_id, name, messageCount: count || 0 };
      })
    );

    setConversations(convs.filter(c => c.messageCount > 0));
    setLoaded(true);
  };

  useState(() => { loadConversations(); });

  const fetchAllMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("content, sender_id, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!data) return [];

    return Promise.all(
      data.map(async (msg) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", msg.sender_id)
          .single();
        return {
          sender: profile?.full_name || "Unknown",
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleString(),
        };
      })
    );
  };

  const exportAsText = async (convId: string, convName: string) => {
    setExporting(`txt-${convId}`);
    const messages = await fetchAllMessages(convId);
    const text = `Chat Export: ${convName}\nExported: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n` +
      messages.map(m => `[${m.timestamp}] ${m.sender}: ${m.content}`).join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${convName.replace(/\s+/g, "-")}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
    toast({ title: "Exported!", description: `Chat with ${convName} exported as TXT.` });
  };

  const exportAsJSON = async (convId: string, convName: string) => {
    setExporting(`json-${convId}`);
    const messages = await fetchAllMessages(convId);
    const json = JSON.stringify({ chatWith: convName, exportedAt: new Date().toISOString(), messages }, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${convName.replace(/\s+/g, "-")}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(null);
    toast({ title: "Exported!", description: `Chat with ${convName} exported as JSON.` });
  };

  const exportAsPDF = async (convId: string, convName: string) => {
    setExporting(`pdf-${convId}`);
    const messages = await fetchAllMessages(convId);
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Chat Export: ${convName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 28);
    doc.line(14, 32, 196, 32);

    let y = 40;
    doc.setFontSize(9);
    for (const msg of messages) {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${msg.sender}  •  ${msg.timestamp}`, 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(msg.content, 170);
      doc.text(lines, 14, y);
      y += lines.length * 4 + 4;
    }

    doc.save(`chat-${convName.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
    setExporting(null);
    toast({ title: "Exported!", description: `Chat with ${convName} exported as PDF.` });
  };

  const exportAll = async (format: "txt" | "json") => {
    setExporting(`all-${format}`);
    for (const conv of conversations) {
      if (format === "txt") await exportAsText(conv.id, conv.name);
      else await exportAsJSON(conv.id, conv.name);
    }
    setExporting(null);
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Chat Backup Export"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Chat Backup & Export</h2>
          <p className="text-sm text-muted-foreground">Download your conversations in any format</p>
        </div>
      </div>

      {/* Quick Export All */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-accent/10">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-black text-lg">Export All Chats</h3>
              <p className="text-sm text-muted-foreground">Backup all {conversations.length} conversations at once</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportAll("txt")} disabled={!!exporting} className="gap-2">
                <FileText className="h-4 w-4" /> TXT
              </Button>
              <Button variant="outline" onClick={() => exportAll("json")} disabled={!!exporting} className="gap-2">
                <FileJson className="h-4 w-4" /> JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Conversations */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <MessageCircle className="h-5 w-5 text-primary" /> Conversations ({conversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations to export yet.</p>
          ) : (
            conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-bold text-sm">{conv.name}</p>
                  <p className="text-xs text-muted-foreground">{conv.messageCount} messages</p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportAsText(conv.id, conv.name)}
                    disabled={!!exporting}
                    className="h-8 px-2 text-xs"
                  >
                    {exporting === `txt-${conv.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportAsJSON(conv.id, conv.name)}
                    disabled={!!exporting}
                    className="h-8 px-2 text-xs"
                  >
                    {exporting === `json-${conv.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileJson className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportAsPDF(conv.id, conv.name)}
                    disabled={!!exporting}
                    className="h-8 px-2 text-xs"
                  >
                    {exporting === `pdf-${conv.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : "PDF"}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
