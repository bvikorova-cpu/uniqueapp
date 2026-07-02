import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_ONBOARDING = [
  { title: "Assign a checklist", desc: "Pick or customise a template of tasks for the first day/week/month." },
  { title: "Track progress", desc: "New hire ticks items off; HR sees completion in real time." },
  { title: "Store documents", desc: "Contract, tax forms and ID uploads are stored securely in one place." },
];

interface Task { id: string; title: string; description?: string; due_days?: number; }

export default function Onboarding() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: t } = await (supabase as any).from("onboarding_templates").select("*").eq("employer_id", user.id);
    setTemplates(t || []);
    const { data: r } = await (supabase as any).from("onboarding_runs").select("*, onboarding_templates(name, tasks)").or(`employer_id.eq.${user.id},hire_id.eq.${user.id}`);
    setRuns(r || []);
  };
  useEffect(() => { load(); }, []);

  const addTask = () => {
    if (!newTask) return;
    setTasks([...tasks, { id: crypto.randomUUID(), title: newTask }]);
    setNewTask("");
  };

  const saveTemplate = async () => {
    if (!name || tasks.length === 0) return toast.error("Name + at least one task");
    const { error } = await (supabase as any).from("onboarding_templates").insert({
      employer_id: userId, name, tasks,
    });
    if (error) return toast.error(error.message);
    toast.success("Template saved"); setName(""); setTasks([]); load();
  };

  const toggleTask = async (run: any, taskId: string) => {
    const state = { ...(run.task_state || {}) };
    state[taskId] = !state[taskId];
    await (supabase as any).from("onboarding_runs").update({ task_state: state }).eq("id", run.id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Onboarding" intro="New-hire onboarding checklist and paperwork." steps={HOW_STEPS_ONBOARDING} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-indigo-500/15 via-primary/10 to-blue-500/5 border border-indigo-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-xl"><ClipboardList className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Onboarding Workflows</h1>
          <p className="text-xs text-muted-foreground">First-week checklists for new hires.</p>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 space-y-2">
        <p className="font-bold text-sm">New template</p>
        <Input placeholder="Template name (e.g. Engineering — Week 1)" value={name} onChange={e => setName(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="Add task" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} />
          <Button onClick={addTask}><Plus className="h-4 w-4" /></Button>
        </div>
        {tasks.length > 0 && (
          <div className="space-y-1">
            {tasks.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                <span className="flex-1">{i + 1}. {t.title}</span>
                <Button size="sm" variant="ghost" onClick={() => setTasks(tasks.filter(x => x.id !== t.id))}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
          </div>
        )}
        <Button className="w-full" onClick={saveTemplate}>Save template</Button>
      </CardContent></Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card><CardContent className="p-4">
          <p className="font-bold text-sm mb-2">My templates ({templates.length})</p>
          {templates.map(t => (
            <div key={t.id} className="text-xs py-1 border-b last:border-0">
              <p className="font-bold">{t.name}</p>
              <p className="text-muted-foreground">{(t.tasks || []).length} tasks</p>
            </div>
          ))}
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p className="font-bold text-sm mb-2">Active runs ({runs.length})</p>
          {runs.map(r => {
            const tplTasks: Task[] = r.onboarding_templates?.tasks || [];
            const completed = tplTasks.filter(t => r.task_state?.[t.id]).length;
            return (
              <div key={r.id} className="py-2 border-b last:border-0 space-y-1">
                <p className="text-xs font-bold">{r.onboarding_templates?.name} — {completed}/{tplTasks.length}</p>
                {tplTasks.map(t => (
                  <label key={t.id} className="flex items-center gap-2 text-xs">
                    <Checkbox checked={!!r.task_state?.[t.id]} onCheckedChange={() => toggleTask(r, t.id)} />
                    <span className={r.task_state?.[t.id] ? "line-through opacity-50" : ""}>{t.title}</span>
                  </label>
                ))}
              </div>
            );
          })}
        </CardContent></Card>
      </div>
    </div>
  );
}
