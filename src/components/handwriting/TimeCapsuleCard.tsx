import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hourglass, Upload, Trash2, Wand2, Coins, ArrowRight } from "lucide-react";
import {
  useCapsuleEntries,
  useUploadCapsuleEntry,
  useDeleteCapsuleEntry,
  useCapsuleDiff,
} from "@/hooks/useHandwritingCapsule";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function TimeCapsuleCard() {
  const entries = useCapsuleEntries();
  const upload = useUploadCapsuleEntry();
  const del = useDeleteCapsuleEntry();
  const diff = useCapsuleDiff();
  const fileRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selA, setSelA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPendingFile(f);
  };

  const submit = () => {
    if (!pendingFile) return;
    upload.mutate(
      { file: pendingFile, label: label.trim() || undefined },
      {
        onSuccess: () => {
          setPendingFile(null);
          setLabel("");
          if (fileRef.current) fileRef.current.value = "";
        },
      },
    );
  };

  const toggleSelect = (id: string) => {
    if (selA === id) return setSelA(null);
    if (selB === id) return setSelB(null);
    if (!selA) return setSelA(id);
    if (!selB) return setSelB(id);
    setSelA(selB);
    setSelB(id);
  };

  const runDiff = () => {
    if (!selA || !selB) return;
    diff.mutate({ entryAId: selA, entryBId: selB });
  };

  const diffResult = (diff.data as any)?.diff;
  const milestones: string[] = (diff.data as any)?.milestones ?? [];

  return (
    <>
      <FloatingHowItWorks title={"Time Capsule Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Time Capsule Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Time Capsule Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-amber-50/80 to-orange-100/60 dark:from-amber-950/30 dark:to-orange-900/20 border-amber-300/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-amber-700" /> Handwriting Time-Capsule
          </CardTitle>
          <Badge variant="outline" className="text-xs gap-1">
            <Coins className="w-3 h-3" /> 6 cr / diff
          </Badge>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
          Drop a handwriting snapshot anytime. Compare any two to see how your mind, mood and personality have evolved.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload row */}
        <div className="space-y-2 rounded-lg bg-amber-100/40 dark:bg-amber-900/20 border border-amber-300/30 p-3">
          <Label className="text-xs">Add new snapshot</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="text-xs"
            />
            <Input
              placeholder="Optional label (e.g. 'After promotion')"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="text-xs"
            />
            <Button
              size="sm"
              onClick={submit}
              disabled={!pendingFile || upload.isPending}
              className="gap-2 shrink-0"
            >
              <Upload className="w-4 h-4" />
              {upload.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* Entry grid */}
        {entries.isLoading ? (
          <p className="text-xs text-amber-900/70">Loading capsule…</p>
        ) : entries.data && entries.data.length > 0 ? (
          <>
            <p className="text-[11px] text-amber-900/70 dark:text-amber-200/70">
              Tap two snapshots to compare them.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <AnimatePresence>
                {entries.data.map((e: any) => {
                  const selected = e.id === selA || e.id === selB;
                  const tag = e.id === selA ? "A" : e.id === selB ? "B" : null;
                  return (
                    <motion.div
                      key={e.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`relative rounded-md overflow-hidden border-2 cursor-pointer group ${
                        selected ? "border-primary shadow-lg" : "border-amber-300/30"
                      }`}
                      onClick={() => toggleSelect(e.id)}
                    >
                      <img
                        src={e.image_url}
                        alt={e.label ?? "capsule"}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      {tag && (
                        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {tag}
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                        <p className="text-[9px] text-white truncate">
                          {format(new Date(e.captured_at), "d MMM yy")}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete entry"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          del.mutate(e.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs text-amber-900/70">
                {selA && selB ? (
                  <span className="flex items-center gap-1">
                    A <ArrowRight className="w-3 h-3" /> B ready
                  </span>
                ) : (
                  "Select 2 snapshots"
                )}
              </div>
              <Button
                size="sm"
                onClick={runDiff}
                disabled={!selA || !selB || diff.isPending}
                className="gap-2 ml-auto"
              >
                <Wand2 className="w-4 h-4" />
                {diff.isPending ? "Analyzing…" : "Compare evolution"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-xs text-amber-900/70 border border-dashed border-amber-300/40 rounded-lg">
            Your capsule is empty. Upload your first snapshot above.
          </div>
        )}

        {/* Diff result */}
        {diffResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">Evolution Report</h4>
              <Badge
                variant={diffResult.growth_score >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                Growth {diffResult.growth_score > 0 ? "+" : ""}
                {diffResult.growth_score}
              </Badge>
            </div>
            <p className="text-xs text-foreground/80">{diffResult.diff_summary}</p>
            {diffResult.emotional_shift && (
              <p className="text-xs italic text-muted-foreground">
                Emotional shift: {diffResult.emotional_shift}
              </p>
            )}
            {milestones.length > 0 && (
              <ul className="text-[11px] text-foreground/70 list-disc list-inside space-y-0.5">
                {milestones.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
