import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import shadowVideo from "@/assets/shadow-arena-hero.mp4.asset.json";
import shadowPoster from "@/assets/shadow-arena-poster.jpg";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  height?: string;
}

/**
 * Cinematic gothic horror page header with looping video, fog,
 * vignette + film grain — used on every Shadow Arena subpage for
 * a consistent atmospheric identity.
 */
export function GothicPageHeader({
  icon: Icon,
  title,
  subtitle,
  children,
  height = "h-[280px] md:h-[340px]",
}: Props) {
  return (
    <>
      <FloatingHowItWorks title={"Gothic Page Header - How it works"} steps={[{ title: 'Open', desc: 'Access the Gothic Page Header section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gothic Page Header.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      className={`relative overflow-hidden rounded-3xl border border-red-900/30 mb-8 shadow-[0_0_50px_-15px_rgba(127,29,29,0.5)] ${height}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={shadowPoster}
      >
        <source src={shadowVideo.url} type="video/mp4" />
      </video>

      {/* Atmospheric overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-[hsl(0,30%,5%)]/70 to-black/95" />
      <div className="absolute inset-0 shadow-vignette" />
      <div className="absolute inset-0 shadow-grain opacity-40" />

      {/* Drifting fog particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-red-900/15 blur-3xl pointer-events-none"
          style={{
            left: `${(i * 17) % 100}%`,
            top: `${20 + ((i * 19) % 60)}%`,
            width: 100 + (i % 3) * 50,
            height: 100 + (i % 3) * 50,
          }}
          animate={{ x: [-25, 25, -25], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 9 + i, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-3"
        >
          <Icon className="h-7 w-7 md:h-9 md:w-9 text-red-400 drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
          <h1 className="text-3xl md:text-5xl font-black font-gothic-display shadow-blood-text shadow-flicker tracking-tight">
            {title}
          </h1>
        </motion.div>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm md:text-base text-red-100/75 max-w-xl font-gothic-body italic mb-4"
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
    </>
  );
}
