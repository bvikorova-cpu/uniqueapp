import { Sparkles, GraduationCap, ArrowUpRight } from "lucide-react";
import heroVideo from "@/assets/tutorial-hero-generated.mp4.asset.json";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function TutorialHero() {
  return (
    <>
      <FloatingHowItWorks
        title={"Tutorial & Course Platform - How it works"}
        intro={"Learn from AI-powered courses or publish your own. Sellers keep 100% of every course sale."}
        steps={[
          { title: 'Browse courses', desc: 'Open Browse Courses, filter by topic and open a course you like.' },
          { title: 'Request access', desc: 'Send an access request (3 credits). Payment for the course is arranged directly with the creator, outside the platform.' },
          { title: 'Learn', desc: 'Watch lessons, complete quizzes and track your progress in My Learning.' },
          { title: 'Get certified', desc: 'Finish all lessons, then issue your certificate for 3 credits and download it as PDF or share it as an image.' },
          { title: 'Create & publish', desc: 'Use Create Course to build modules, lessons, videos and quizzes. Publishing costs 15 credits.' },
          { title: 'Earn 100%', desc: 'You keep 100% of the price you charge for your courses - the platform takes no commission.' },
        ]}
      />


      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-10 overflow-hidden rounded-[2rem] border border-primary/15 bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/10"
      >
        {/* Ambient aurora */}
        <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        {/* Blueprint grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at 30% 20%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 30% 20%, black, transparent 75%)",
          }}
        />

        <div className="relative grid gap-6 p-5 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-8 md:p-8">
          {/* Copy column */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Learning Campus
            </div>

            <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">
              <span className="block text-foreground">Learn</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                without limits.
              </span>
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              A modern school built around AI: personal tutoring, instant quizzes,
              certificates and courses you can create yourself.
            </p>

            {/* Micro feature rail */}
            <div className="flex flex-wrap gap-2">
              {["AI Tutor", "Smart Quizzes", "Certificates", "Course Builder"].map((t) => (
                <span
                  key={t}
                  className="rounded-xl border border-border/60 bg-background/70 px-3 py-1.5 text-[11px] font-medium text-foreground/80 backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Media column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-primary/20 shadow-2xl shadow-primary/20 md:aspect-video"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "brightness(1.05) saturate(1.15)" }}
            >
              <source src={heroVideo.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-accent/20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-border/40 bg-background/70 px-3 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-foreground/90">Live classroom</span>
            </div>
            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-background/70 backdrop-blur-md">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-lg shadow-primary/30">
              Explore <ArrowUpRight className="h-3 w-3" />
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}
