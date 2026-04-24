import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, User, Send, Sparkles, Paperclip, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { ContactHero } from "@/components/contact/ContactHero";
import { SystemStatusWidget } from "@/components/contact/SystemStatusWidget";
import { ContactFAQ } from "@/components/contact/ContactFAQ";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { MyTickets } from "@/components/contact/MyTickets";
import { VoiceRecorder } from "@/components/contact/VoiceRecorder";
import { ScreenRecorder } from "@/components/contact/ScreenRecorder";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const CATEGORIES = [
  { id: "support", label: "Support" },
  { id: "billing", label: "Billing" },
  { id: "bug", label: "Bug report" },
  { id: "feature", label: "Feature request" },
  { id: "partnership", label: "Partnership" },
  { id: "press", label: "Press" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  { id: "normal", label: "Normal", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  { id: "high", label: "High", color: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  { id: "urgent", label: "Urgent", color: "bg-red-500/15 text-red-600 border-red-500/30" },
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(3, "Subject too short").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  category: z.string(),
  priority: z.string(),
  honeypot: z.string().max(0, "Spam detected"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface FAQ {
  id: string;
  category: string;
  question: string;
  keywords: string[] | null;
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [screenBlob, setScreenBlob] = useState<Blob | null>(null);
  const [faqList, setFaqList] = useState<FAQ[]>([]);
  const [triageRunning, setTriageRunning] = useState(false);
  const [triageResult, setTriageResult] = useState<{ suggested_faq_id: string; category: string; sentiment: string; summary: string } | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", category: "support", priority: "normal", honeypot: "" },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        form.setValue("email", data.user.email ?? "");
        form.setValue("name", (data.user.user_metadata?.full_name as string) ?? "");
      }
    });
    supabase
      .from("support_faq")
      .select("id, category, question, keywords")
      .eq("is_active", true)
      .then(({ data }) => setFaqList((data as FAQ[]) ?? []));
  }, [form]);

  const messageValue = form.watch("message") ?? "";
  const subjectValue = form.watch("subject") ?? "";
  const category = form.watch("category");

  const runTriage = async () => {
    if (subjectValue.length < 3 || messageValue.length < 10) {
      toast({ title: "Write subject + at least 10 characters of message first" });
      return;
    }
    setTriageRunning(true);
    setTriageResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("contact-ai-triage", {
        body: { subject: subjectValue, message: messageValue, faq: faqList },
      });
      if (error) throw error;
      setTriageResult(data);
      if (data.category) form.setValue("category", data.category);
    } catch (err) {
      console.error(err);
      toast({ title: "AI triage unavailable", description: "Sending without AI analysis.", variant: "destructive" });
    } finally {
      setTriageRunning(false);
    }
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []).slice(0, 3);
    const valid = list.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < list.length) toast({ title: "Some files exceed 5 MB and were skipped", variant: "destructive" });
    setFiles(valid);
  };

  const uploadBlob = async (blob: Blob, ext: string, kind: string) => {
    if (!blob || blob.size === 0) return null;
    // Only authenticated users can upload to support-attachments now
    // (anonymous folder was a security risk and has been removed).
    if (!user?.id) return null;
    const filename = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("support-attachments").upload(filename, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) {
      console.error("upload error", error);
      return null;
    }
    return filename;
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Attachments require authentication. Anonymous tickets still work
      // for the textual form fields below; we just skip the file uploads.
      const uploadedAttachments: { name: string; path: string }[] = [];
      if (user?.id) {
        for (const f of files) {
          const path = `${user.id}/file-${Date.now()}-${f.name}`;
          const { error } = await supabase.storage.from("support-attachments").upload(path, f, { upsert: false });
          if (!error) uploadedAttachments.push({ name: f.name, path });
        }
      } else if (files.length > 0) {
        toast({
          title: "Sign in to attach files",
          description: "Anonymous tickets can't upload attachments. Please log in to include files.",
        });
      }

      const voicePath = voiceBlob && voiceBlob.size > 0 ? await uploadBlob(voiceBlob, "webm", "voice") : null;
      const screenPath = screenBlob && screenBlob.size > 0 ? await uploadBlob(screenBlob, "webm", "screen") : null;

      const { data: inserted, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user?.id ?? null,
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          category: data.category,
          priority: data.priority,
          attachments: uploadedAttachments,
          voice_url: voicePath,
          screen_recording_url: screenPath,
          ai_suggested_category: triageResult?.category ?? null,
          ai_suggested_faq_id: triageResult?.suggested_faq_id || null,
          sentiment: triageResult?.sentiment ?? null,
        })
        .select("ticket_number")
        .single();

      if (error) throw error;

      setSubmittedTicket(inserted.ticket_number);
      toast({
        title: "Message sent!",
        description: `Your reference: ${inserted.ticket_number}`,
      });
      form.reset({ name: data.name, email: data.email, subject: "", message: "", category: "support", priority: "normal", honeypot: "" });
      setFiles([]);
      setVoiceBlob(null);
      setScreenBlob(null);
      setTriageResult(null);
    } catch (e) {
      console.error("submit error", e);
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPriority = ["support", "bug"].includes(category);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 pt-20">
        <ContactHero responseTime="< 4h" todayCount={47} satisfaction={98} />
        <HeroRewardedAd sectionKey="page_contact" />


        <SystemStatusWidget />

        {user && <MyTickets userId={user.id} />}

        <ContactFAQ highlightId={triageResult?.suggested_faq_id || null} />

        <ContactChannels />

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" /> Send a message
            </CardTitle>
            <CardDescription>
              Pick a category, describe your issue, attach evidence — our AI helps route your message instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submittedTicket && (
              <div className="mb-5 flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Message received!</p>
                  <p className="text-xs text-muted-foreground">Reference: <span className="font-mono font-bold">{submittedTicket}</span> — track it in "My Tickets" above.</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <Input tabIndex={-1} autoComplete="off" {...form.register("honeypot")} />
                </div>

                {/* Categories */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => field.onChange(c.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                              field.value === c.id
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-background border-border hover:border-primary/50"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Priority */}
                {showPriority && (
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => field.onChange(p.id)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                                field.value === p.id ? p.color : "bg-background border-border hover:border-primary/50"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Your name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="email" placeholder="your@email.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="What is your message about?" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Message</span>
                        <span className={`text-xs font-normal ${messageValue.length > 1900 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {messageValue.length} / 2000
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your issue in detail…" className="min-h-[150px] resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AI triage button */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={runTriage}
                    disabled={triageRunning}
                    className="gap-1.5"
                  >
                    {triageRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    AI analyse & suggest
                  </Button>

                  <input
                    id="contact-files"
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={onFiles}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById("contact-files")?.click()}
                  >
                    <Paperclip className="h-3.5 w-3.5 mr-1.5" />
                    Attach ({files.length}/3)
                  </Button>

                  <VoiceRecorder onRecorded={setVoiceBlob} />
                  <ScreenRecorder onRecorded={setScreenBlob} />
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{f.name}</span>
                        <button type="button" onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {triageResult && (
                  <div className="p-3 rounded-xl border-2 border-primary/30 bg-primary/5">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-1.5 text-xs">
                        <p>
                          <span className="font-bold">AI summary:</span> {triageResult.summary}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[10px]">Category: {triageResult.category}</Badge>
                          <Badge variant="outline" className="text-[10px]">Sentiment: {triageResult.sentiment}</Badge>
                          {triageResult.suggested_faq_id && (
                            <Badge variant="default" className="text-[10px]">FAQ match found ↑ (highlighted above)</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p>You're sending as guest — log in to track your tickets in real time.</p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          We typically respond within 4 hours. Premium subscribers get priority within 1 hour.
        </p>
      </div>
    </div>
  );
};

export default Contact;
