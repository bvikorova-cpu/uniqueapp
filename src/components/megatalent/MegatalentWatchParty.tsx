import { useEffect, useRef, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Radio,
  Send,
  Users,
  Tv,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stream {
  id: string;
  host_user_id: string;
  category: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  started_at: string | null;
  viewer_count: number;
}

interface PartyMessage {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Props {
  category: string;
}

const goLiveSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title can be at most 100 characters"),
  description: z
    .string()
    .max(500, "Description can be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

type GoLiveValues = z.infer<typeof goLiveSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const MegatalentWatchParty = ({ category }: Props) => {
  const { toast } = useToast();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<GoLiveValues>({
    resolver: zodResolver(goLiveSchema),
    defaultValues: { title: "", description: "" },
  });

  const loadStreams = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("megatalent_live_streams")
      .select("id,host_user_id,category,title,description,status,scheduled_at,started_at,ended_at,viewer_count,created_at,updated_at")
      .eq("category", category)
      .in("status", ["scheduled", "live"])
      .order("started_at", { ascending: false, nullsFirst: false })
      .limit(10);
    setStreams((data ?? []) as Stream[]);
    setLoading(false);
  }, [category]);

  useEffect(() => {
    loadStreams();
    const ch = supabase
      .channel(`mt-streams-${category}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "megatalent_live_streams", filter: `category=eq.${category}` },
        () => loadStreams(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [category, loadStreams]);

  useEffect(() => {
    if (!activeStream) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("megatalent_watch_party_messages")
        .select("*")
        .eq("stream_id", activeStream.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled) setMessages((data ?? []) as PartyMessage[]);
    })();
    const ch = supabase
      .channel(`mt-party-${activeStream.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "megatalent_watch_party_messages", filter: `stream_id=eq.${activeStream.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as PartyMessage]),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [activeStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setThumbnailPreview(null);
      setThumbnailFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setThumbnailError("Image can be at most 5 MB");
      setThumbnailPreview(null);
      setThumbnailFile(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setThumbnailError("Supported formats: JPG, PNG, WebP");
      setThumbnailPreview(null);
      setThumbnailFile(null);
      return;
    }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `stream-thumbnails/${u.user.id}/${Date.now()}.${ext}`;
    const { error: upError } = await supabase.storage
      .from("megatalent-thumbnails")
      .upload(path, file, { upsert: true });
    if (upError) {
      toast({ title: "Upload error", description: upError.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage
      .from("megatalent-thumbnails")
      .getPublicUrl(path);
    return urlData.publicUrl;
  };

  const createStream = async (values: GoLiveValues) => {
    setIsStarting(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast({ title: "Sign in to create a stream", variant: "destructive" });
      setIsStarting(false);
      return;
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      thumbnailUrl = await uploadThumbnail(thumbnailFile);
      if (thumbnailUrl === null) {
        setIsStarting(false);
        return;
      }
    }

    const { data, error } = await (supabase as any)
      .from("megatalent_live_streams")
      .insert({
        host_user_id: u.user.id,
        category,
        title: values.title.trim(),
        description: values.description?.trim() || null,
        status: "live",
        started_at: new Date().toISOString(),
        ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsStarting(false);
      return;
    }

    form.reset();
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setThumbnailError(null);
    setCreating(false);
    setActiveStream(data as Stream);
    setIsStarting(false);
    toast({ title: "🎥 Stream is live!" });
  };

  const send = async () => {
    if (!input.trim() || !activeStream) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast({ title: "Sign in to chat", variant: "destructive" });
      return;
    }
    const text = input.trim();
    setInput("");
    const { error } = await (supabase as any).from("megatalent_watch_party_messages").insert({
      stream_id: activeStream.id,
      user_id: u.user.id,
      content: text,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const endStream = async () => {
    if (!activeStream) return;
    await (supabase as any)
      .from("megatalent_live_streams")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", activeStream.id);
    setActiveStream(null);
    toast({ title: "Stream ended" });
  };

  const clearThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setThumbnailError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) return null;

  return (
    <Card className="bg-gradient-to-br from-rose-500/10 via-primary/5 to-purple-500/10 border-rose-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Tv className="h-5 w-5 text-rose-500" />
            Live & Watch Party
          </span>
          {!activeStream && !creating && (
            <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
              <Radio className="h-3.5 w-3.5 mr-1" /> Go Live
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {creating && !activeStream && (
          <div className="p-4 rounded-xl bg-card/60 border border-border/50 space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-rose-500" />
              Start a new stream
            </h4>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(createStream)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Stream title…"
                          maxLength={100}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Popis</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short stream description…"
                          maxLength={500}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-[10px] text-muted-foreground text-right">
                        {field.value?.length || 0}/500
                      </p>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Thumbnail</FormLabel>
                  {thumbnailPreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border/50 aspect-video max-h-40">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearThumbnail}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-primary/40 transition cursor-pointer py-6 aspect-video max-h-40">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Click to choose an image (JPG, PNG, WebP, max 5 MB)
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {thumbnailError && (
                    <p className="text-sm font-medium text-destructive">{thumbnailError}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isStarting}
                    className="flex-1"
                  >
                    {isStarting ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Radio className="h-3.5 w-3.5 mr-1" />
                    )}
                    {isStarting ? "Starting…" : "Start"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isStarting}
                    onClick={() => {
                      setCreating(false);
                      form.reset();
                      clearThumbnail();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {activeStream ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Badge className="bg-red-600 text-white shrink-0">
                  <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
                </Badge>
                <span className="font-semibold text-sm truncate">{activeStream.title}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActiveStream(null)}>
                ← Back
              </Button>
            </div>

            {activeStream.thumbnail_url ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <img
                  src={activeStream.thumbnail_url}
                  alt={activeStream.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white/70 px-4">
                  <Tv className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Watch party in progress</p>
                </div>
              </div>
            )}

            <div className="border border-border/50 rounded-lg bg-card/40">
              <div className="h-48 overflow-y-auto p-2 space-y-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Be the first to write in the chat 💬
                  </p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="text-xs p-1.5 rounded bg-muted/30">
                      <span className="text-muted-foreground mr-2">
                        {m.user_id.slice(0, 6)}
                      </span>
                      {m.content}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-1 p-2 border-t border-border/50">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Write a message…"
                  className="h-8 text-xs"
                  maxLength={500}
                />
                <Button size="sm" onClick={send} className="h-8 px-2">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button size="sm" variant="destructive" className="w-full" onClick={endStream}>
              End stream
            </Button>
          </div>
        ) : streams.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No active streams. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {streams.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStream(s)}
                className="w-full text-left rounded-lg bg-card/50 hover:bg-card border border-border/50 hover:border-rose-500/50 transition-all overflow-hidden"
              >
                {s.thumbnail_url && (
                  <div className="h-24 w-full">
                    <img
                      src={s.thumbnail_url}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {s.status === "live" && (
                      <Badge className="bg-red-600 text-white text-[10px] shrink-0">
                        <Radio className="h-2.5 w-2.5 mr-1 animate-pulse" /> LIVE
                      </Badge>
                    )}
                    <span className="font-medium text-sm truncate">{s.title}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                    <Users className="h-3 w-3" /> {s.viewer_count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentWatchParty;
