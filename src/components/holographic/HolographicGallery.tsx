import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Share2, Sparkles, Loader2, Trash2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; onCreate?: () => void; }

interface AvatarRow {
  id: string;
  name: string;
  style: string;
  traits: string[] | null;
  image_url: string | null;
  created_at: string;
}

const styleGradients: Record<string, string> = {
  cyber: "from-cyan-500/20 via-violet-500/10 to-pink-500/20",
  crystal: "from-blue-500/20 via-purple-500/10 to-indigo-500/20",
  shadow: "from-gray-800/40 via-purple-900/20 to-gray-700/30",
  cosmic: "from-indigo-500/20 via-blue-600/10 to-violet-500/20",
  nature: "from-emerald-500/20 via-green-600/10 to-teal-500/20",
  mystic: "from-amber-500/20 via-orange-500/10 to-red-500/20",
};

export const HolographicGallery = ({ onBack, onCreate }: Props) => {
  const [avatars, setAvatars] = useState<AvatarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSignedIn(false); setAvatars([]); return; }
      setSignedIn(true);
      const { data, error } = await supabase
        .from("holographic_avatars")
        .select("id, name, style, traits, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAvatars((data ?? []) as AvatarRow[]);
    } catch {
      toast.error("Could not load your avatars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("holographic_avatars").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    setAvatars(prev => prev.filter(a => a.id !== id));
    toast.success("Avatar deleted");
  };

  return (
    <>
      <FloatingHowItWorks
        title='My Avatars'
        steps={[
          { title: 'Create an avatar', desc: 'Use the Avatar Creator to generate a holographic avatar (10 credits).' },
          { title: 'It is saved here', desc: 'Every avatar you generate is stored in this list automatically.' },
          { title: 'Manage', desc: 'Download the image, share a link, or delete avatars you no longer want.' },
          { title: 'Use them', desc: 'Take your avatars into the Battle Arena and Breeding tools.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">My Avatars</h2>
          <p className="text-sm text-muted-foreground">Every holographic avatar you have created</p>
        </div>
        <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !signedIn ? (
        <Card><CardContent className="p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Sign in to see the avatars you have created.</p>
        </CardContent></Card>
      ) : avatars.length === 0 ? (
        <Card><CardContent className="p-8 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-primary/40 mx-auto" />
          <p className="font-bold">No avatars yet</p>
          <p className="text-sm text-muted-foreground">Create your first holographic avatar — it will appear here.</p>
          {onCreate && <Button onClick={onCreate}>Open Avatar Creator</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {avatars.map((avatar, i) => (
              <motion.div key={avatar.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                <Card className="overflow-hidden group hover:border-primary/40 transition-all">
                  <div className={`h-44 bg-gradient-to-br ${styleGradients[avatar.style?.toLowerCase()] ?? "from-primary/20 to-accent/20"} flex items-center justify-center`}>
                    {avatar.image_url ? (
                      <img src={avatar.image_url} alt={`Holographic avatar ${avatar.name}`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Sparkles className="w-14 h-14 text-primary/30" />
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-sm truncate">{avatar.name}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(avatar.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">{avatar.style}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(avatar.traits ?? []).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                    <div className="flex items-center gap-2">
                      {avatar.image_url && (
                        <Button asChild size="sm" variant="outline" className="h-8 px-2">
                          <a href={avatar.image_url} download={`${avatar.name}.png`} aria-label="Download">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8 px-2" aria-label="Share" onClick={async () => {
                        const url = `${window.location.origin}/holographic-avatars`;
                        try {
                          if (navigator.share) await navigator.share({ title: avatar.name, text: `My holographic avatar ${avatar.name}`, url });
                          else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
                        } catch { /* cancelled */ }
                      }}><Share2 className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2 ml-auto text-destructive hover:text-destructive" aria-label="Delete" onClick={() => remove(avatar.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
    </>
  );
};
