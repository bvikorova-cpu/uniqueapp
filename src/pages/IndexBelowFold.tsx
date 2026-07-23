/**
 * Below-the-fold content for the Home page.
 *
 * Split into its own dynamically-imported chunk so the initial JS
 * payload for the landing route stays small (better mobile TTI/LCP).
 * The Index page mounts this only when the viewport nears the fold,
 * cutting ~800 KB from the shell chunk (spotlight images, section
 * videos registry, framer AnimatePresence spotlight, etc.).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Sparkles, Crown, Clock, Pin, Zap, ArrowRight, Layers, Coins,
} from "lucide-react";
import { SectionVideoPreview } from "@/components/SectionVideoPreview";
import { sectionVideos } from "@/components/sectionVideos";
import { HowItWorksTrust } from "@/components/trust/HowItWorksTrust";
import { InviteFriendsCallout } from "@/components/referral/InviteFriendsCallout";

import spotlightAvatars from "@/assets/spotlight-avatars.jpg";
import spotlightRacing from "@/assets/spotlight-racing.jpg";
import spotlightChef from "@/assets/spotlight-chef.jpg";
import spotlightBeauty from "@/assets/spotlight-beauty.webp";

import RewardedAdCard from "@/components/ads/RewardedAdCard";
import { AD_PLACEMENTS } from "@/components/ads/AdPlacements";

type Mod = any;

interface Props {
  ecosystemModules: Mod[];
  coreModules: Mod[];
  services: Mod[];
  favoriteModules: Mod[];
  recentModules: Mod[];
  handleNavigate: (path: string) => void;
  isFavorite: (path: string) => boolean;
  toggleFavorite: (path: string) => void;
  SectionHeader: React.ComponentType<any>;
  ModuleCard: React.ComponentType<any>;
}

export default function IndexBelowFold({
  ecosystemModules, coreModules, services,
  favoriteModules, recentModules,
  handleNavigate, isFavorite, toggleFavorite,
  SectionHeader, ModuleCard,
}: Props) {
  const spotlightServices = [
    { ...coreModules[4], spotlight: "🔥 Hot Now", image: spotlightBeauty },
    { ...ecosystemModules[0], spotlight: "Most Popular", image: spotlightAvatars },
    { ...ecosystemModules[4], spotlight: "Trending", image: spotlightRacing },
    { ...ecosystemModules[3], spotlight: "New", image: spotlightChef },
  ];
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSpotlightIdx(i => (i + 1) % spotlightServices.length), 5000);
    return () => clearInterval(t);
  }, [spotlightServices.length]);
  const currentSpotlight = spotlightServices[spotlightIdx];

  return (
    <>
      {/* ── Spotlight ────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={Star}
          title="Spotlight"
          badge="Featured"
          badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30"
        />
        <Card className="overflow-hidden border-border/30 shadow-xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={spotlightIdx}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="relative cursor-pointer"
              onClick={() => handleNavigate(currentSpotlight.path)}
            >
              <img
                src={currentSpotlight.image}
                alt={currentSpotlight.title}
                className="w-full h-[220px] sm:h-[300px] object-cover"
                loading="lazy"
                decoding="async"
                width={800}
                height={512}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${currentSpotlight.gradient} opacity-30 mix-blend-overlay`} />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Badge className="bg-white/20 text-white border-white/30 mb-3 backdrop-blur-sm">{currentSpotlight.spotlight}</Badge>
                    <h3 className="text-2xl sm:text-4xl font-black text-white mb-1 drop-shadow-lg">{currentSpotlight.title}</h3>
                    <p className="text-white/80 text-sm sm:text-base max-w-md">{currentSpotlight.description}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-5">
                  {spotlightServices.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSpotlightIdx(i); }}
                      aria-label={`Go to spotlight ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === spotlightIdx ? 'bg-white w-8' : 'bg-white/40 w-2'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
        <RewardedAdCard sectionKey="spotlight" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        <SectionVideoPreview src={sectionVideos.megatalent} label="Megatalent contest preview" caption="🎤 Megatalent — quarterly €10,000 prize" />
      </section>

      {favoriteModules.length > 0 && (
        <section>
          <SectionHeader icon={Pin} title="Your Favorites" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {favoriteModules.map((mod: any, i: number) => (
              <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {recentModules.length > 0 && (
        <section>
          <SectionHeader icon={Clock} title="Recently Visited" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {recentModules.map((mod: any, i: number) => (
              <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {/* ── Ecosystem ────────────────────────────────── */}
      <section>
        <SectionHeader icon={Crown} title="Ecosystem Modules" badge="Premium" badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {ecosystemModules.map((mod, i) => (
            <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
          ))}
        </div>
        <RewardedAdCard sectionKey="ecosystem" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        <SectionVideoPreview src={sectionVideos.dating} label="Dating section preview" caption="💜 Dating — meet your match" />
        <SectionVideoPreview src={sectionVideos.bazaar} label="Bazaar marketplace preview" caption="🛍️ Bazaar — buy, sell, discover" />
      </section>

      {/* ── Core ─────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Sparkles} title="Core Modules" badge="AI-Powered" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="mb-4 cursor-pointer relative overflow-hidden rounded-xl border border-pink-500/30 bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-purple-950/80 p-4 sm:p-6 shadow-xl shadow-pink-500/10"
          onClick={() => handleNavigate("/beauty-studio")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(244,63,94,0.15),_transparent_60%)]" />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-[10px] sm:text-xs animate-pulse">🔥 Featured</Badge>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/30">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-white">✨ Beauty Studio</h3>
              <p className="text-xs sm:text-sm text-pink-200/80 mt-0.5">AI makeup, skincare analysis, nail art & celebrity look matching</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["Makeup", "Skin AI", "Nail Art", "Celebrity Match", "Hair", "Gallery"].map(tag => (
                  <span key={tag} className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20">{tag}</span>
                ))}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-pink-400 shrink-0 hidden sm:block" />
          </div>
        </motion.div>
        <SectionVideoPreview src={sectionVideos.beauty} label="Beauty Studio preview" caption="💄 Beauty Studio — AI makeup & skincare" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {coreModules.map((mod, i) => (
            <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
          ))}
        </div>
        <RewardedAdCard sectionKey="core_modules" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        <SectionVideoPreview src={sectionVideos.aiTools} label="AI tools preview" caption="🧠 AI Tools — generate, create, automate" />
      </section>

      {/* ── All Services ─────────────────────────────── */}
      <section>
        <SectionHeader icon={Zap} title="All Services" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {services.map((mod, i) => (
            <ModuleCard key={i} mod={{ ...mod, description: "" }} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
          ))}
        </div>
        <RewardedAdCard sectionKey="all_services" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        <SectionVideoPreview src={sectionVideos.jobs} label="Jobs section preview" caption="💼 Jobs — find work, hire talent" />
        <SectionVideoPreview src={sectionVideos.education} label="Education preview" caption="🎓 Education — learn, grow, earn" />
        <SectionVideoPreview src={sectionVideos.kids} label="Kids Channel preview" caption="🎨 Kids Channel — safe & fun for ages 6–12" />
        <SectionVideoPreview src={sectionVideos.racing} label="GP Fantasy Racing preview" caption="🏎️ GP Fantasy Racing — 3D race & manage teams" />
        <SectionVideoPreview src={sectionVideos.livestream} label="Live Streaming preview" caption="📡 Live Streaming — go live, earn gifts" />
        <SectionVideoPreview src={sectionVideos.fashion} label="Fashion Studio preview" caption="👗 Fashion Studio — AI designs & runway" />
        <SectionVideoPreview src={sectionVideos.fitness} label="Fitness & Wellness preview" caption="💪 Fitness & Wellness — train smarter" />
        <SectionVideoPreview src={sectionVideos.property} label="Property Marketplace preview" caption="🏠 Property Marketplace — buy, sell, rent" />
        <SectionVideoPreview src={sectionVideos.holographicAvatars} label="Holographic Avatars preview" caption="👤 Holographic Avatars — 3D AI breeding & battles" />
        <SectionVideoPreview src={sectionVideos.timeCapsule} label="Time Capsule preview" caption="⏳ Time Capsule — send messages to the future" />
        <SectionVideoPreview src={sectionVideos.kitchenStars} label="KitchenStars preview" caption="👨‍🍳 KitchenStars — online cooking competitions" />
        <SectionVideoPreview src={sectionVideos.comedyClub} label="Comedy Club preview" caption="🎤 Comedy Club — stand-up & laughs" />
        <SectionVideoPreview src={sectionVideos.marketplace} label="Marketplace preview" caption="🛍️ Marketplace — shop everything in one place" />
        <SectionVideoPreview src={sectionVideos.secretSanta} label="Secret Santa preview" caption="🎁 Secret Santa — magical gift exchange" />
        <SectionVideoPreview src={sectionVideos.coupons} label="Coupons preview" caption="🎟️ Coupons — exclusive deals & discounts" />
        <SectionVideoPreview src={sectionVideos.lieDetector} label="Lie Detector preview" caption="🔍 Lie Detector — AI truth analysis" />
        <SectionVideoPreview src={sectionVideos.emotion} label="Emotion preview" caption="💗 Emotion AI — read feelings & mood" />
        <SectionVideoPreview src={sectionVideos.photoRestoration} label="Photo Restoration preview" caption="🖼️ Photo Restoration — bring memories back to life" />
        <SectionVideoPreview src={sectionVideos.virtualPet} label="Virtual Pet preview" caption="🐾 Virtual Pet — raise your magical companion" />
        <SectionVideoPreview src={sectionVideos.influKing} label="Influ King preview" caption="👑 Influ King — rise to the top of influencers" />
      </section>

      {/* ── About Unique ─────────────────────────────── */}
      <section>
        <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-card via-card to-card/90 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.06),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.05),transparent_50%)]" />
          <CardHeader className="relative text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {"Welcome to \"Unique\" – The Platform That Helps and Connects!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-5 text-center px-6 sm:px-10 pb-8">
            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
              {"At \"Unique,\" we believe in the power of community and that everyone deserves a digital space that inspires them, educates them, and connects them with the people they care about. Our platform is designed with dedication and the goal of bringing you a unique experience – from discovering new talents and pursuing education, to creative opportunities with artificial intelligence and brand building. We are here to help you achieve your dreams and goals."}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <span className="text-xs text-primary font-bold uppercase tracking-widest">{"Your satisfaction is our number one priority"}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
              {"We know that even the best technology occasionally encounters unforeseen obstacles. If you come across any error, or have a suggestion for improvement, please do not hesitate to contact us! Use our"}{" "}
              <Link to="/contact" className="text-primary hover:underline font-semibold">{"Contact Form"}</Link>.{" "}
              {"Every piece of feedback you give us is valuable, and we take it seriously."}
            </p>
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
              <p className="text-base font-semibold text-foreground/90">
                {"Because we believe that every user deserves what they paid for – and much more."}
              </p>
            </div>
            <p className="text-lg font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {"Thank you for being part of the community. Together, we are creating something exceptional!"}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── Why Unique? ──────────────────────────────── */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">
            {"Why"}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Unique</span>?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            {"Discover what makes our platform stand out from the rest"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="group border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10 bg-card">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{"All-in-One Platform"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{"Everything you need in one place - from social networking and entertainment to education, shopping, and AI-powered tools. No need to juggle multiple apps."}</p>
            </CardContent>
          </Card>
          <Card className="group border border-accent/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-accent/10 bg-card">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl group-hover:text-accent transition-colors">{"Premium Features"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{"Access cutting-edge AI technology, advanced tools, and exclusive features. Experience the future of social networking with intelligent assistance."}</p>
            </CardContent>
          </Card>
          <Card className="group border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-gold/10 bg-card">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl group-hover:text-gold transition-colors">{"Earn While You Social"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{"Turn your social activities into income. Create content, offer services, compete in contests, and get rewarded for your engagement and talent."}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <InviteFriendsCallout />
      <HowItWorksTrust />

      {/* ── Footer CTA ───────────────────────────────── */}
      <div className="text-center pb-8">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5 max-w-2xl mx-auto shadow-lg">
          <CardContent className="py-8 sm:py-10">
            <h3 className="text-xl sm:text-2xl font-black mb-2">Ready to get started?</h3>
            <p className="text-muted-foreground mb-4">Choose a service above and begin your journey!</p>
            <Button size="lg" onClick={() => handleNavigate('/wall')} className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg">
              <ArrowRight className="w-4 h-4" /> Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
