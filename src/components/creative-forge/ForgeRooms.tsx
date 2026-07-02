import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Plus, X, Loader2, Sparkles, MessageSquare, Bot, Send, Copy, Lock, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreativeRooms, useRoomMessages, useCreativeAITools, ROOM_AI_COST } from "@/hooks/useCreativeAITools";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const CATEGORIES = ["song_lyrics", "screenplay", "theater_play", "novel_chapter", "poetry", "standup", "podcast_script", "ad_copy"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ForgeRooms = ({ open, onClose }: Props) => {
  const [view, setView] = useState<"list" | "create" | "room">("list");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { data: rooms } = useCreativeRooms();
  const qc = useQueryClient();

  // Create form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("song_lyrics");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const createRoom = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("creative_forge_rooms").insert({
        owner_id: user.id, name, description: desc, category: cat, is_public: isPublic,
      }).select().single();
      if (error) throw error;
      await supabase.from("creative_forge_room_members").insert({
        room_id: data.id, user_id: user.id, role: "owner",
      });
      qc.invalidateQueries({ queryKey: ["creative-rooms"] });
      toast.success("Room created!");
      setActiveRoomId(data.id);
      setView("room");
      setName(""); setDesc("");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setCreating(false); }
  };

  if (!open) return null;

  return (
    <>
      <FloatingHowItWorks title={"Forge Rooms - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Rooms section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Rooms.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-4xl max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-amber-700/40 bg-[hsl(30,15%,8%)]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(251,191,36,0.2)]">
            <CardHeader className="pb-3 border-b border-amber-700/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-amber-100" style={{ fontFamily: "Georgia, serif" }}>
                <Users className="h-5 w-5 text-amber-400" />
                Collaboration Rooms
                {view === "list" && (
                  <Button size="sm" variant="ghost" onClick={() => setView("create")} className="ml-2 text-amber-300 hover:text-amber-100 hover:bg-amber-900/20">
                    <Plus className="h-4 w-4 mr-1" /> New
                  </Button>
                )}
                {view !== "list" && (
                  <Button size="sm" variant="ghost" onClick={() => { setView("list"); setActiveRoomId(null); }} className="ml-2 text-amber-300 hover:text-amber-100 hover:bg-amber-900/20">
                    ← Back
                  </Button>
                )}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-amber-200 hover:bg-amber-900/20">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {view === "list" && (
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-2">
                    {(rooms || []).length === 0 ? (
                      <div className="text-center py-12 text-amber-200/60">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No rooms yet</p>
                        <Button onClick={() => setView("create")} className="mt-3 bg-amber-700 hover:bg-amber-600 text-white">
                          <Plus className="h-4 w-4 mr-1" /> Create your first room
                        </Button>
                      </div>
                    ) : rooms?.map((r: any) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-3 rounded-xl border border-amber-700/30 bg-black/30 hover:bg-black/50 cursor-pointer transition-all"
                        onClick={() => { setActiveRoomId(r.id); setView("room"); }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-amber-100 truncate">{r.name}</h4>
                              {r.is_public ? <Globe className="h-3 w-3 text-emerald-400" /> : <Lock className="h-3 w-3 text-amber-400" />}
                            </div>
                            <p className="text-[11px] text-amber-200/60 line-clamp-1">{r.description || "No description"}</p>
                          </div>
                          <Badge variant="outline" className="border-amber-600/40 text-amber-300 text-[10px]">{r.category.replace("_", " ")}</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {view === "create" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-amber-200/80">Room Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 'Album Lyrics Brainstorm'" className="bg-black/30 border-amber-700/40 text-amber-50" />
                  </div>
                  <div>
                    <Label className="text-xs text-amber-200/80">Description</Label>
                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="What are we working on?" className="bg-black/30 border-amber-700/40 text-amber-50" />
                  </div>
                  <div>
                    <Label className="text-xs text-amber-200/80">Category</Label>
                    <Select value={cat} onValueChange={setCat}>
                      <SelectTrigger className="bg-black/30 border-amber-700/40 text-amber-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label className="text-xs text-amber-200/80">Public room (anyone can browse & join)</Label>
                  </div>
                  <Button onClick={createRoom} disabled={creating || !name.trim()} className="w-full bg-amber-700 hover:bg-amber-600 text-white">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create Room
                  </Button>
                </div>
              )}

              {view === "room" && activeRoomId && <RoomView roomId={activeRoomId} />}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
};

const RoomView = ({ roomId }: { roomId: string }) => {
  const { data: messages } = useRoomMessages(roomId);
  const { askRoomAI } = useCreativeAITools();
  const [input, setInput] = useState("");

  const send = async () => {
    if (!input.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("creative_forge_room_messages").insert({
      room_id: roomId, user_id: user.id, message_type: "chat", content: input,
    });
    setInput("");
  };

  const copyInvite = async () => {
    const { data } = await supabase.from("creative_forge_rooms").select("invite_code").eq("id", roomId).single();
    if (data?.invite_code) {
      navigator.clipboard.writeText(data.invite_code);
      toast.success("Invite code copied!");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copyInvite} className="border-amber-700/40 text-amber-200 hover:bg-amber-900/20 hover:text-amber-100">
          <Copy className="h-3 w-3 mr-1" /> Invite Code
        </Button>
        <Button
          size="sm"
          onClick={() => askRoomAI.mutate({ roomId, action: "moderate" })}
          disabled={askRoomAI.isPending}
          className="bg-rose-700 hover:bg-rose-600 text-white"
        >
          {askRoomAI.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Bot className="h-3 w-3 mr-1" />}
          AI Moderate ({ROOM_AI_COST} cr)
        </Button>
        <Button
          size="sm"
          onClick={() => askRoomAI.mutate({ roomId, action: "suggest" })}
          disabled={askRoomAI.isPending}
          className="bg-amber-700 hover:bg-amber-600 text-white"
        >
          <Sparkles className="h-3 w-3 mr-1" /> AI Suggest ({ROOM_AI_COST} cr)
        </Button>
      </div>

      <ScrollArea className="h-[45vh] border border-amber-700/30 rounded-lg p-3 bg-black/30">
        <div className="space-y-2">
          {(messages || []).length === 0 ? (
            <div className="text-center py-8 text-amber-200/40 text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No messages yet. Start the conversation!
            </div>
          ) : messages?.map((m: any) => {
            const isAI = m.message_type?.startsWith("ai_");
            return (
              <div key={m.id} className={`p-2.5 rounded-lg ${isAI ? "bg-amber-900/20 border border-amber-600/30" : "bg-black/40"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {isAI ? <Bot className="h-3 w-3 text-amber-400" /> : <Users className="h-3 w-3 text-rose-400" />}
                  <span className="text-[10px] uppercase tracking-wider text-amber-200/60">
                    {isAI ? `AI ${m.message_type.replace("ai_", "")}` : "Member"}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap text-amber-50 leading-relaxed">{m.content}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), send())}
          placeholder="Add to brainstorm…"
          className="bg-black/30 border-amber-700/40 text-amber-50 placeholder:text-amber-200/40"
        />
        <Button onClick={send} disabled={!input.trim()} className="bg-amber-700 hover:bg-amber-600 text-white">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
