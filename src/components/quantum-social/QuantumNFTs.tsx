import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Gem, Plus, ShoppingCart, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumNFT {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  rarity: string;
  quantum_signature: string | null;
  minted_price: number;
  is_listed: boolean;
  listed_price: number | null;
  created_at: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400 border-gray-500/30",
  uncommon: "text-emerald-400 border-emerald-500/30",
  rare: "text-cyan-400 border-cyan-500/30",
  epic: "text-violet-400 border-violet-500/30",
  legendary: "text-amber-400 border-amber-500/30",
};

const RARITY_GRADIENTS: Record<string, string> = {
  common: "from-gray-500/10 to-gray-500/5",
  uncommon: "from-emerald-500/10 to-emerald-500/5",
  rare: "from-cyan-500/10 to-cyan-500/5",
  epic: "from-violet-500/10 to-violet-500/5",
  legendary: "from-amber-500/10 to-amber-500/5",
};

export function QuantumNFTs({ onBack }: { onBack: () => void }) {
  const [nfts, setNfts] = useState<QuantumNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [showMint, setShowMint] = useState(false);
  const [mintName, setMintName] = useState("");
  const [mintDesc, setMintDesc] = useState("");
  const [tab, setTab] = useState<"my" | "market">("market");
  const { toast } = useToast();
  const { credits, spendCredit } = useAICredits();

  useEffect(() => { fetchNFTs(); }, [tab]);

  const fetchNFTs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from("quantum_nfts").select("*").order("created_at", { ascending: false });
    if (tab === "my" && user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("is_listed", true);
    }
    const { data } = await query.limit(50);
    setNfts((data as QuantumNFT[]) || []);
    setLoading(false);
  };

  const mintNFT = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!mintName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }

    const hasCredits = await spendCredit("custom_generation", "Quantum NFT Mint");
    if (!hasCredits) { toast({ title: "Not enough credits", description: "Purchase credits to mint NFTs (2 credits)", variant: "destructive" }); return; }

    setMinting(true);
    try {
      // Generate quantum signature via AI
      const response = await supabase.functions.invoke("ai-mood-therapist", {
        body: {
          messages: [{ role: "user", content: `Generate a unique quantum signature hash and rarity assessment for a quantum NFT called "${mintName}" described as "${mintDesc}". Return ONLY a JSON object with fields: signature (a hex string), rarity (one of: common, uncommon, rare, epic, legendary based on creativity).` }],
          systemPrompt: "You are a quantum NFT minting engine. Respond ONLY with valid JSON.",
        },
      });

      let rarity = ["common", "uncommon", "rare", "epic", "legendary"][Math.floor(Math.random() * 5)];
      let signature = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

      if (response.data) {
        try {
          const text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          const jsonMatch = text.match(/\{[^}]+\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.rarity) rarity = parsed.rarity;
            if (parsed.signature) signature = parsed.signature;
          }
        } catch {}
      }

      const { error } = await supabase.from("quantum_nfts").insert({
        user_id: user.id,
        name: mintName,
        description: mintDesc || null,
        rarity,
        quantum_signature: signature,
        minted_price: 2,
      });

      if (error) throw error;

      // Record transaction
      await supabase.from("quantum_nft_transactions").insert({
        buyer_id: user.id,
        price: 2,
        transaction_type: "mint",
      });

      toast({ title: "NFT Minted! ✨", description: `"${mintName}" — ${rarity} rarity` });
      setMintName("");
      setMintDesc("");
      setShowMint(false);
      setTab("my");
      fetchNFTs();
    } catch (error) {
      toast({ title: "Minting Failed", variant: "destructive" });
    }
    setMinting(false);
  };

  const toggleListing = async (nft: QuantumNFT) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || nft.user_id !== user.id) return;

    if (nft.is_listed) {
      await supabase.from("quantum_nfts").update({ is_listed: false, listed_price: null }).eq("id", nft.id);
    } else {
      await supabase.from("quantum_nfts").update({ is_listed: true, listed_price: 5 }).eq("id", nft.id);
    }
    fetchNFTs();
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum NFTs'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum NFTs panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Gem className="h-5 w-5 text-amber-400" /> Quantum NFTs</h2>
            <p className="text-xs text-muted-foreground">Mint rare quantum moments as collectible NFTs</p>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-500/30 text-amber-400">2 credits/mint</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === "market" ? "default" : "outline"} size="sm" onClick={() => setTab("market")}><ShoppingCart className="h-4 w-4 mr-1" /> Market</Button>
        <Button variant={tab === "my" ? "default" : "outline"} size="sm" onClick={() => setTab("my")}>My NFTs</Button>
        <Button variant="outline" size="sm" onClick={() => setShowMint(!showMint)} className="ml-auto"><Plus className="h-4 w-4 mr-1" /> Mint</Button>
      </div>

      {/* Mint Form */}
      {showMint && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /> Mint New Quantum NFT</h3>
          <Input placeholder="NFT Name (e.g. Quantum Singularity #42)" value={mintName} onChange={e => setMintName(e.target.value)} className="border-amber-500/20" />
          <Textarea placeholder="Description of this quantum moment..." value={mintDesc} onChange={e => setMintDesc(e.target.value)} className="border-amber-500/20" rows={2} />
          <Button onClick={mintNFT} disabled={minting} className="w-full bg-amber-600 hover:bg-amber-700">
            {minting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> AI Minting...</> : "Mint NFT (2 credits)"}
          </Button>
        </motion.div>
      )}

      {/* NFT Grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading quantum NFTs...</div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Gem className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{tab === "my" ? "You haven't minted any NFTs yet" : "No NFTs listed on the market"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {nfts.map((nft, i) => (
            <motion.div key={nft.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
              className={`rounded-xl border bg-gradient-to-br p-4 space-y-2 ${RARITY_COLORS[nft.rarity] || RARITY_COLORS.common} ${RARITY_GRADIENTS[nft.rarity] || RARITY_GRADIENTS.common}`}
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-[10px] capitalize ${RARITY_COLORS[nft.rarity]}`}>{nft.rarity}</Badge>
                {nft.is_listed && <Badge className="bg-emerald-600 text-[10px]">Listed</Badge>}
              </div>
              <h4 className="font-bold text-sm truncate">{nft.name}</h4>
              {nft.description && <p className="text-[10px] text-muted-foreground line-clamp-2">{nft.description}</p>}
              <p className="text-[10px] font-mono text-muted-foreground">Σ {nft.quantum_signature?.slice(0, 12)}...</p>
              {tab === "my" && (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => toggleListing(nft)}>
                  {nft.is_listed ? "Unlist" : "List for Sale"}
                </Button>
              )}
              {tab === "market" && nft.listed_price && (
                <p className="text-sm font-bold text-amber-400">{nft.listed_price} credits</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
