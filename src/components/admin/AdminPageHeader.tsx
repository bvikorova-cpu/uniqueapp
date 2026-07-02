import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft, LucideIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/admin-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Stat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: "cyan" | "purple" | "amber" | "emerald" | "pink";
}

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  stats?: Stat[];
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}

const accentMap: Record<string, string> = {
  cyan: "from-cyan-300 to-blue-400",
  purple: "from-purple-300 to-pink-400",
  amber: "from-amber-300 to-orange-400",
  emerald: "from-emerald-300 to-teal-400",
  pink: "from-pink-300 to-rose-400",
};

export const AdminPageHeader = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  stats = [],
  actions,
  breadcrumbs = [],
}: Props) => {
  const navigate = useNavigate();
  const crumbs = [{ label: "Command Center", to: "/admin" }, ...breadcrumbs];

  return (
    <>
      <FloatingHowItWorks title={"Admin Page Header - How it works"} steps={[{ title: 'Open', desc: 'Access the Admin Page Header section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Admin Page Header.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative w-full rounded-3xl overflow-hidden mb-6 border border-primary/30 shadow-2xl shadow-primary/10">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.4) contrast(1.05)" }}
        src={heroVideo.url}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-transparent to-cyan-500/15" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(168,85,247,0.06) 0px, rgba(168,85,247,0.06) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative z-10 px-5 sm:px-10 pt-5 pb-7 sm:pt-6 sm:pb-9">
        {/* Breadcrumbs + Back */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="h-7 px-2 text-white/90 hover:text-white hover:bg-white/10 -ml-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
            <span className="text-white/30">|</span>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-white/40" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-white font-medium drop-shadow">
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-white drop-shadow">{c.label}</span>
                )}
              </span>
            ))}
          </div>
          {badge && (
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary/40 to-cyan-500/40 border border-primary/60 text-white backdrop-blur-xl px-2.5 py-1 rounded-full shadow-lg text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {badge}
            </span>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"
        >
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] flex items-center gap-3">
              {Icon && (
                <Icon className="h-7 w-7 sm:h-10 sm:w-10 text-primary drop-shadow-[0_0_15px_rgba(168,85,247,0.6)] shrink-0" />
              )}
              <span className="bg-gradient-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </motion.div>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl bg-black/70 border-2 border-white/15 backdrop-blur-xl shadow-xl shadow-black/40"
              >
                {s.icon && (
                  <s.icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br ${
                      accentMap[s.accent || "cyan"]
                    } bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
                    strokeWidth={2.5}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-black text-white leading-tight truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    {s.value}
                  </p>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-white/80 truncate">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
