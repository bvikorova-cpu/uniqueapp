import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, Calendar as CalendarIcon, Clock, Trash2,
  ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertCircle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CalendarEntry {
  id: string;
  title: string;
  content_type: string;
  platform: string;
  scheduled_date: string;
  status: string;
  notes: string | null;
}

interface Props {
  onBack: () => void;
}

const PLATFORMS = ["Instagram", "Twitter/X", "LinkedIn", "Facebook", "TikTok", "Blog", "Email", "YouTube"];
const CONTENT_TYPES = ["Post", "Story", "Reel", "Article", "Newsletter", "Video", "Thread", "Ad"];

const ContentCalendar = ({ onBack }: Props) => {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content_type: "Post",
    platform: "Instagram",
    notes: "",
  });

  useEffect(() => { loadEntries(); }, [currentMonth]);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const { data } = await (supabase as any)
      .from("content_calendar")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", start.toISOString())
      .lte("scheduled_date", end.toISOString())
      .order("scheduled_date");
    setEntries((data as any[]) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !selectedDate) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await (supabase as any).from("content_calendar").insert({
        user_id: user.id,
        title: form.title,
        content_type: form.content_type,
        platform: form.platform,
        scheduled_date: selectedDate.toISOString(),
        notes: form.notes || null,
        status: "planned",
      });
      if (error) throw error;
      toast.success("Content scheduled!");
      setForm({ title: "", content_type: "Post", platform: "Instagram", notes: "" });
      setShowForm(false);
      loadEntries();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("content_calendar").delete().eq("id", id);
    toast.success("Entry removed");
    loadEntries();
  };

  const handleToggleStatus = async (entry: CalendarEntry) => {
    const newStatus = entry.status === "published" ? "planned" : "published";
    await (supabase as any).from("content_calendar").update({ status: newStatus }).eq("id", entry.id);
    loadEntries();
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = startOfMonth(currentMonth).getDay();
  const selectedDayEntries = selectedDate ? entries.filter((e) => isSameDay(new Date(e.scheduled_date), selectedDate)) : [];

  return (
    <>
      <FloatingHowItWorks
        title="How Content Calendar works"
        steps={[
          { title: 'Plan posts', description: 'Drag & drop items across days.' },
          { title: 'Set platforms', description: 'Choose IG, TikTok, YouTube, etc.' },
          { title: 'Get AI suggestions', description: 'Fill gaps with generated ideas.' },
          { title: 'Publish or export', description: 'Push to schedulers or download CSV.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-black">Content Calendar</h2>
          <p className="text-muted-foreground">Plan and schedule your content across platforms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map((day) => {
                const dayEntries = entries.filter((e) => isSameDay(new Date(e.scheduled_date), day));
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`relative p-2 rounded-lg text-sm transition-all min-h-[50px] ${
                      isSelected ? "bg-primary text-primary-foreground" : isToday(day) ? "bg-accent" : "hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {dayEntries.length > 0 && (
                      <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                        {dayEntries.slice(0, 3).map((e, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${e.status === "published" ? "bg-green-500" : "bg-primary"}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedDate && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{format(selectedDate, "MMMM d, yyyy")}</h3>
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              {showForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Content title..." />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={form.content_type} onValueChange={(v) => setForm({ ...form, content_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." rows={2} />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {selectedDayEntries.length === 0 && !showForm ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No content scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                selectedDayEntries.map((entry) => (
                  <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{entry.title}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{entry.platform}</Badge>
                              <Badge variant="secondary" className="text-xs">{entry.content_type}</Badge>
                            </div>
                            {entry.notes && <p className="text-xs text-muted-foreground mt-2">{entry.notes}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleToggleStatus(entry)}>
                              {entry.status === "published" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </>
          )}

          {!selectedDate && (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a date to view or add content</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ContentCalendar;
