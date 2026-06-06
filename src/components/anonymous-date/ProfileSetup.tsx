import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Sparkles, Loader2, Heart, Shield, Users, MessageCircle, Eye, Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { anonymousDatingProfileSchema } from "@/lib/anonymousDatingSchema";

import heroVideo from "@/assets/anonymous-date-hero.mp4.asset.json";

const INTERESTS = [
  "Travel", "Movies", "Music", "Sports", "Reading", "Cooking",
  "Art", "Gaming", "Fitness", "Photography", "Dancing", "Nature"
];

const PERSONALITY_TRAITS = [
  "Funny", "Adventurous", "Calm", "Energetic", "Creative", "Logical",
  "Romantic", "Ambitious", "Easy-going", "Thoughtful", "Spontaneous", "Loyal"
];

const GENDERS = ["Male", "Female", "Non-binary", "Other"];
const PREFERRED_GENDERS = ["Male", "Female", "Any"];
const RELATIONSHIP_GOALS = [
  { value: "friendship", label: "Friendship" },
  { value: "casual", label: "Casual" },
  { value: "serious", label: "Serious" },
  { value: "marriage", label: "Marriage" },
];
const LANGUAGES = ["English", "Slovak", "Czech", "German", "Spanish", "French", "Italian", "Polish", "Hungarian", "Russian", "Ukrainian", "Other"];

const HOW_IT_WORKS = [
  { step: "1", title: "Create Profile", desc: "Set up your anonymous identity", icon: "🎭", color: "from-pink-500 to-rose-500" },
  { step: "2", title: "Find Match", desc: "AI pairs you by compatibility", icon: "🔍", color: "from-primary to-accent" },
  { step: "3", title: "Chat 7 Days", desc: "Connect through personality", icon: "💬", color: "from-amber-500 to-orange-500" },
  { step: "4", title: "Reveal", desc: "Discover each other", icon: "👀", color: "from-emerald-500 to-teal-500" },
];

const STATS = [
  { icon: Users, label: "Active Users", value: "—" },
  { icon: Heart, label: "Matches Made", value: "—" },
  { icon: MessageCircle, label: "Messages Sent", value: "—" },
  { icon: Eye, label: "Reveals", value: "—" },
];

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [anonymousName, setAnonymousName] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [preferredGender, setPreferredGender] = useState("");
  const [relationshipGoal, setRelationshipGoal] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousName || !ageRange || selectedInterests.length < 3) {
      toast({ title: "Missing Information", description: "Please fill in all required fields and select at least 3 interests", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("anonymous_dating_profiles")
        .upsert({
          user_id: user.id,
          anonymous_name: anonymousName,
          age_range: ageRange,
          interests: selectedInterests,
          personality_traits: selectedTraits,
          looking_for: lookingFor,
          location: location || null,
          gender: gender || null,
          preferred_gender: preferredGender || null,
          relationship_goal: relationshipGoal || null,
          languages: selectedLanguages.length ? selectedLanguages : null,
          is_active: true,
        });

      if (error) throw error;
      toast({ title: "Profile Created!", description: "You can now start finding matches" });
      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({ title: "Error", description: "Failed to create profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Cinematic Hero with video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-primary/30 shadow-[0_0_60px_hsl(var(--primary)/0.25)]"
      >
        {/* Video background */}
        <video
          src={heroVideo.url}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-110 saturate-125"
        />
        {/* Romantic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.28),transparent_65%)]" />

        {/* Floating hearts */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400/70 blur-[1px] pointer-events-none"
            style={{
              left: `${8 + i * 12}%`,
              top: `${20 + (i % 3) * 22}%`,
              fontSize: `${14 + (i % 3) * 6}px`,
            }}
            animate={{ y: [0, -40, 0], opacity: [0.3, 0.9, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          >
            ♥
          </motion.div>
        ))}

        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md border border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)] text-sm font-semibold text-foreground mb-4"
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span>Anonymous Dating Platform</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 text-white"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 0 36px hsl(var(--primary) / 0.55)" }}
          >
            Find Love <span className="text-white" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.95), 0 0 28px hsl(var(--primary) / 0.65)" }}>Anonymously</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-foreground/85 text-sm sm:text-lg max-w-2xl mx-auto"
          >
            Connect based on personality, not appearance. Chat for 7 days before the big reveal.
          </motion.p>
        </div>
      </motion.div>

      {/* Inner section under video */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center"
      >

        {/* Heart Connection Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mb-6 flex justify-center"
        >
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.3" />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * 0.06 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                transform="rotate(-90 60 60)"
              />
              <motion.circle
                cx="60" cy="60" r="40"
                fill="none"
                stroke="hsl(var(--primary) / 0.15)"
                strokeWidth="2"
                strokeDasharray="6 4"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "60px 60px" }}
              />
              <motion.circle
                cx="60" cy="60" r="30"
                fill="none"
                stroke="hsl(var(--accent) / 0.1)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                initial={{ rotate: 360 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "60px 60px" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-3xl sm:text-4xl"
              >
                💕
              </motion.span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">7-DAY MAGIC</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="relative p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-foreground">{stat.value}</div>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            How Anonymous Date Works
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="relative text-center p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-all"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`bg-gradient-to-r ${s.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                    STEP {s.step}
                  </span>
                </div>
                <span className="text-3xl block mb-2 mt-1">{s.icon}</span>
                <h4 className="font-bold text-sm">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Content: Form + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
            <div className="h-1.5 bg-gradient-to-r from-pink-500 via-primary to-accent" />
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Create Your Anonymous Profile
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">Your real identity stays completely hidden until you choose to reveal it</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Anonymous Name *</Label>
                  <Input
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    placeholder="MysteryPerson123"
                    required
                    className="mt-1.5 bg-muted/10 border-border/50 focus:border-primary/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">This is the name your matches will see</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Age Range *</Label>
                    <Input
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      placeholder="25-30"
                      required
                      className="mt-1.5 bg-muted/10 border-border/50 focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">📍 Location (City)</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Bratislava, Prague, Vienna..."
                      className="mt-1.5 bg-muted/10 border-border/50 focus:border-primary/50"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Helps find matches near you</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Your Gender</Label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      {GENDERS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`text-xs px-2 py-2 rounded-lg border transition-all ${
                            gender === g
                              ? "bg-primary/15 border-primary/40 text-primary font-semibold"
                              : "border-border/50 text-muted-foreground hover:border-primary/20"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Looking for</Label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                      {PREFERRED_GENDERS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setPreferredGender(g)}
                          className={`text-xs px-2 py-2 rounded-lg border transition-all ${
                            preferredGender === g
                              ? "bg-pink-500/15 border-pink-500/40 text-pink-400 font-semibold"
                              : "border-border/50 text-muted-foreground hover:border-pink-500/20"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">💞 Relationship Goal</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                    {RELATIONSHIP_GOALS.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setRelationshipGoal(goal.value)}
                        className={`text-xs px-3 py-2.5 rounded-xl border transition-all active:scale-[0.97] ${
                          relationshipGoal === goal.value
                            ? "bg-gradient-to-br from-primary/15 to-pink-500/15 border-primary/40 text-foreground font-semibold"
                            : "border-border/50 text-muted-foreground hover:border-primary/25"
                        }`}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    🗣️ Languages
                    <Badge variant="secondary" className="text-[10px]">{selectedLanguages.length} selected</Badge>
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1.5">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`text-xs px-2.5 py-2 rounded-lg border transition-all ${
                          selectedLanguages.includes(lang)
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-medium"
                            : "border-border/50 text-muted-foreground hover:border-emerald-500/20"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">What you're looking for (description)</Label>
                  <Textarea
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    placeholder="Describe the kind of connection you'd love to find..."
                    rows={3}
                    className="mt-1.5 bg-muted/10 border-border/50 focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    Select Interests *
                    <Badge variant="secondary" className="text-[10px]">{selectedInterests.length} selected</Badge>
                  </Label>
                  <p className="text-[10px] text-muted-foreground mb-2">Choose at least 3 interests for better matching</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-3 py-2.5 rounded-xl border transition-all active:scale-[0.97] ${
                          selectedInterests.includes(interest)
                            ? "bg-primary/10 border-primary/30 text-primary font-medium shadow-sm shadow-primary/10"
                            : "border-border/50 text-muted-foreground hover:border-primary/20 hover:bg-muted/20"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    Personality Traits
                    <Badge variant="secondary" className="text-[10px]">{selectedTraits.length}/5</Badge>
                  </Label>
                  <p className="text-[10px] text-muted-foreground mb-2">Choose up to 5 traits that describe you</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {PERSONALITY_TRAITS.map((trait) => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => toggleTrait(trait)}
                        disabled={selectedTraits.length >= 5 && !selectedTraits.includes(trait)}
                        className={`text-xs px-3 py-2.5 rounded-xl border transition-all active:scale-[0.97] ${
                          selectedTraits.includes(trait)
                            ? "bg-accent/10 border-accent/30 text-accent font-medium shadow-sm shadow-accent/10"
                            : "border-border/50 text-muted-foreground hover:border-accent/20 hover:bg-muted/20 disabled:opacity-30"
                        }`}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Create Profile & Start Matching</>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-4"
        >
          {/* Safety Card */}
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Your Safety
            </h3>
            <div className="space-y-2">
              {[
                { icon: "🎭", label: "100% Anonymous until reveal" },
                { icon: "🔒", label: "Encrypted messaging" },
                { icon: "🛡️", label: "Verified subscribers only" },
                { icon: "⏰", label: "7-day discovery period" },
                { icon: "🚫", label: "Block & report system" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Testimonials */}
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Love Stories
            </h3>
            <div className="space-y-3">
              {[
                { name: "Anonymous M.", text: "We chatted for 7 days and fell in love with each other's personality!", rating: 5 },
                { name: "Anonymous K.", text: "The reveal moment was incredibly exciting. Best dating experience!", rating: 5 },
              ].map((t, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">"{t.text}"</p>
                  <p className="text-[10px] font-medium mt-1 text-foreground/70">— {t.name}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Credit Costs */}
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Credit Costs
            </h3>
            <div className="space-y-1.5">
              {[
                { label: "New Match", cost: "5 cr", emoji: "🔍" },
                { label: "Text Message", cost: "1 cr", emoji: "💬" },
                { label: "Voice Message", cost: "3 cr", emoji: "🎤" },
                { label: "Profile Hint", cost: "5 cr", emoji: "💡" },
                { label: "Virtual Gift", cost: "10 cr", emoji: "🎁" },
                { label: "Early Reveal", cost: "15 cr", emoji: "👀" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.emoji}</span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{item.cost}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
