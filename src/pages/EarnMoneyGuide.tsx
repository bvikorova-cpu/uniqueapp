import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BadgeEuro,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Crown,
  Gift,
  Gavel,
  GraduationCap,
  Leaf,
  Lightbulb,
  Megaphone,
  Mic2,
  Music,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Ticket,
  TrendingUp,
  UserPlus,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { sectionPosters } from "@/components/sectionPosters";

type EarnGuide = {
  id: string;
  title: string;
  kicker: string;
  hook: string;
  audience: string;
  route: string;
  cta: string;
  image: string;
  icon: typeof Star;
  income: string[];
  steps: string[];
  momentum: string[];
  note: string;
  secondaryRoute?: string;
  secondaryCta?: string;
};

const earnGuides: EarnGuide[] = [
  {
    id: "influ-king",
    title: "Influ King",
    kicker: "Turn attention into a creator business",
    hook: "Your audience can become more than a follower count. Build a creator profile, publish premium work, connect with brands and give your strongest supporters more ways to back you.",
    audience: "Creators, influencers, niche experts and community builders who already have something worth following.",
    route: "/influ-king",
    cta: "Open Influ King",
    image: sectionPosters.influKing,
    icon: Star,
    income: ["Fan subscriptions with creator-set membership levels", "Tips and paid gifts from supporters", "Paid photo or video messages", "Premium posts and brand opportunities"],
    steps: ["Create a credible creator profile with a clear niche.", "Publish consistently and give followers a reason to return.", "Activate the earning formats that fit your audience.", "Track performance and available payouts in your creator tools."],
    momentum: ["Lead with one recognizable topic or style.", "Explain clearly what supporters receive.", "Reward loyal fans with reliable, valuable content."],
    note: "Creator monetization is subject to payment completion, platform rules and the payout status shown in your account.",
  },
  {
    id: "skills-marketplace",
    title: "Skills Marketplace",
    kicker: "Sell what you already know how to do",
    hook: "A useful skill can become a paid offer. Package your service clearly, show what the buyer receives and turn practical experience into real customer orders.",
    audience: "Freelancers and service providers in repairs, cleaning, gardening, technology, teaching, creative work and more.",
    route: "/marketplace",
    cta: "Sell a service",
    image: sectionPosters.marketplace,
    icon: BriefcaseBusiness,
    income: ["Fixed-price service offers", "Custom work agreed with buyers", "Repeat orders from satisfied customers", "A public provider profile that builds trust"],
    steps: ["Choose one service with a specific result.", "Add an honest description, price, delivery time and examples.", "Respond to buyer questions and confirm the scope.", "Complete the order and build your reputation through genuine reviews."],
    momentum: ["Make the outcome obvious in the title.", "Start with a focused offer instead of promising everything.", "Deliver on time and keep all order details clear."],
    note: "Only offer services you can genuinely deliver. Order and payout status are based on completed platform transactions.",
  },
  {
    id: "megatalent",
    title: "Megatalent",
    kicker: "Put your talent in front of the crowd",
    hook: "One performance can introduce you to a new audience. Enter the current competition period, earn support and compete for the live quarterly prize pool—not a fixed promised amount.",
    audience: "Performers, artists and original creators ready to compete publicly with their own work.",
    route: "/megatalent",
    cta: "Enter Megatalent",
    image: sectionPosters.hero,
    icon: Crown,
    income: ["A chance to win the current quarterly prize pool", "Support through eligible fan activity", "Visibility that can grow your wider creator audience", "Competition and battle opportunities shown in the section"],
    steps: ["Check the active competition period and categories.", "Submit eligible original content under the current rules.", "Share your entry and build genuine audience support.", "Follow rankings, results and payout instructions inside Megatalent."],
    momentum: ["Make the opening seconds impossible to ignore.", "Enter early enough to build real momentum.", "Invite genuine supporters—never manipulate engagement."],
    note: "The prize pool is variable. Entry does not guarantee a prize, ranking or payout.",
  },
  {
    id: "unlock-videos",
    title: "Unlock Videos",
    kicker: "Make the second half worth unlocking",
    hook: "Hook viewers with a free preview, then earn when they choose to unlock the complete premium video. The stronger the payoff, the stronger the reason to continue watching.",
    audience: "Video creators with tutorials, entertainment, reveals, stories or exclusive footage that delivers a clear payoff.",
    route: "/unlock-videos",
    cta: "Publish an unlock video",
    image: sectionPosters.livestream,
    icon: Video,
    income: ["Creator earnings for completed premium unlocks", "Discovery through Unlock Videos and supported Wall surfaces", "A growing premium video library", "Earned value tracked separately from purchased unlock credits"],
    steps: ["Upload an original video that follows platform rules.", "Use the free first half to create genuine curiosity.", "Publish and share it to the supported Unique feeds.", "View unlock activity and earnings in your account."],
    momentum: ["Promise a specific payoff and deliver it after the preview.", "Use a title that says what viewers will gain.", "Build a series so one unlock can lead to the next."],
    note: "A viewer must choose to unlock the video. Purchased credits and creator-earned value have different purposes.",
  },
  {
    id: "courses",
    title: "Tutorial & Course Platform",
    kicker: "Teach once. Create value again and again.",
    hook: "Turn a repeatable skill into a structured learning product. A focused course can reach learners beyond one-to-one work and keep creating sales after publication.",
    audience: "Teachers, coaches, specialists, makers and professionals who can guide someone from a problem to a measurable result.",
    route: "/tutorial-platform",
    cta: "Create or sell a course",
    image: sectionPosters.education,
    icon: GraduationCap,
    income: ["Sales of published courses", "A reusable learning product", "A route from free expertise to paid depth", "Authority that can support your other Unique offers"],
    steps: ["Choose one learner and one concrete transformation.", "Break the outcome into clear, practical lessons.", "Set up the course, price and learning materials.", "Publish, improve from real feedback and keep content accurate."],
    momentum: ["Solve a narrow problem extremely well.", "Show the result learners can work toward.", "Use practical examples instead of filler."],
    note: "Course sales depend on real purchases. Keep claims accurate and only teach material you are qualified to present.",
  },
  {
    id: "referrals",
    title: "Referrals",
    kicker: "Share Unique with people who will genuinely use it",
    hook: "A strong recommendation is valuable when it reaches the right person. Use your personal referral tools, follow verified results and grow through authentic invitations.",
    audience: "Active members who can introduce relevant friends, creators or professionals to the platform.",
    route: "/referral",
    cta: "Open referrals",
    image: sectionPosters.hero,
    icon: UserPlus,
    income: ["Eligible referral rewards shown in the referral section", "Milestones and leaderboard progress", "A personal invitation link", "Withdrawal tools for completed referral earnings"],
    steps: ["Open your referral page and copy your personal link.", "Send it privately to people who would benefit from Unique.", "Let them register and complete the qualifying action.", "Track verified referrals and available rewards on the page."],
    momentum: ["Explain which Unique section fits each person.", "Share directly instead of posting spam.", "Use the current reward details shown in your account."],
    note: "Rewards apply only to eligible, verified referrals under the current program terms; self-referrals and abuse do not qualify.",
  },
  {
    id: "gifts",
    title: "Paid Gifts",
    kicker: "Let your community say more than “like”",
    hook: "When your work creates a real moment, supporters can respond with a paid gift. It is a direct signal that your presence, performance or help mattered.",
    audience: "Creators, hosts and community members who consistently give their audience something worth appreciating.",
    route: "/gifts/inbox",
    cta: "Open your gift inbox",
    image: sectionPosters.secretSanta,
    icon: Gift,
    income: ["Eligible paid gifts received from other users", "Support connected to creator and live experiences", "A visible history of received gifts", "Payout value based on completed eligible transactions"],
    steps: ["Create content or live experiences people value.", "Build genuine interaction with your audience.", "Receive gifts through supported Unique features.", "Review gift history and eligible earnings in your account."],
    momentum: ["Give first: entertain, teach or help.", "Thank supporters without pressuring anyone.", "Stay consistent so your community knows when to return."],
    note: "Gifts are voluntary. Never promise special treatment that violates platform rules in exchange for a gift.",
  },
  {
    id: "challenges",
    title: "Eco & Healthy Challenges",
    kicker: "Small daily actions can lead to a monthly win",
    hook: "Build proof of positive action, climb the challenge rankings and compete in a community where the active prize pool grows with eligible subscriptions.",
    audience: "People who can document consistent eco-friendly or healthy actions and want accountability with competition.",
    route: "/eco-challenge",
    cta: "Open Eco Challenge",
    secondaryRoute: "/healthy-challenge",
    secondaryCta: "Open Healthy Challenge",
    image: sectionPosters.fitness,
    icon: Leaf,
    income: ["A chance to become the monthly challenge champion", "The winner share displayed in the live prize-pool breakdown", "Public progress through eligible submissions", "A charity share selected through the challenge winner flow"],
    steps: ["Choose Eco Challenge or Healthy Challenge.", "Review the current rules, period and eligible subscription tier.", "Complete and document genuine daily actions.", "Build consistent progress and follow the final monthly result."],
    momentum: ["Consistency beats one impressive day.", "Make every submission easy to understand and verify.", "Choose the challenge that fits your real routine."],
    note: "Prize pools are variable. Participation or subscription does not guarantee winning; the displayed live breakdown controls the current amounts.",
  },
  {
    id: "property-marketplace",
    title: "Property Marketplace",
    kicker: "Put serious property opportunities in front of serious people",
    hook: "Present a property with clarity, strong visuals and complete facts so buyers or renters can decide whether to take the next step.",
    audience: "Owners and authorized property professionals with genuine property listings.",
    route: "/property-marketplace",
    cta: "List or explore property",
    image: sectionPosters.property,
    icon: Building2,
    income: ["Reach for genuine sale or rental opportunities", "Direct interest from people browsing property", "A structured listing that presents the offer professionally", "Visibility alongside other marketplace opportunities"],
    steps: ["Prepare accurate property details and current photos.", "Create the listing with the real price and conditions.", "Respond to enquiries and arrange the next step safely.", "Complete agreements and legal checks outside assumptions made by the listing."],
    momentum: ["Lead with the strongest factual advantage.", "Show the actual space clearly.", "Disclose important conditions early."],
    note: "Unique provides discovery and listing tools; a listing itself does not guarantee a sale, rental or income.",
  },
  {
    id: "bazaar",
    title: "Bazaar",
    kicker: "Give useful things a second buyer",
    hook: "That unused item can become someone else’s next great find. List it honestly, price it realistically and turn clutter into a genuine sale.",
    audience: "People selling real items such as electronics, fashion, home goods, sports gear, books, vehicles or hobby equipment.",
    route: "/bazaar",
    cta: "Sell in Bazaar",
    image: sectionPosters.bazaar,
    icon: Store,
    income: ["Direct sales of eligible physical items", "Offers from interested buyers", "Repeat selling through your own listings", "A route to monetize items you no longer use"],
    steps: ["Photograph the actual item from several angles.", "Describe its condition and faults honestly.", "Set a realistic price and publish the listing.", "Use platform messaging and agree a safe handover."],
    momentum: ["Bright, honest photos sell confidence.", "Answer the questions a careful buyer would ask.", "Never move to suspicious payment links."],
    note: "Only list real eligible items. Stay inside the platform flow and follow scam-protection guidance for every transaction.",
  },
  {
    id: "coupon-marketplace",
    title: "Coupon Marketplace",
    kicker: "Turn a valid unused deal into value",
    hook: "A coupon you will not use may still matter to someone else. Present the saving, restrictions and expiry clearly so buyers know exactly what they receive.",
    audience: "Members with genuine, transferable coupons that comply with the issuer’s terms.",
    route: "/coupon-marketplace",
    cta: "Open Coupon Marketplace",
    image: sectionPosters.coupons,
    icon: Ticket,
    income: ["Sales of eligible transferable coupons", "Discovery through brand and seasonal browsing", "A place to manage your coupon listings", "Value recovered from offers you cannot use"],
    steps: ["Confirm the coupon can legally be transferred.", "Add the real value, price, restrictions and expiry.", "Publish without exposing the redeemable code publicly.", "Complete the sale using the platform’s supported flow."],
    momentum: ["Make the buyer’s saving instantly clear.", "State every restriction before purchase.", "Remove expired or invalid offers promptly."],
    note: "Validity and transferability depend on the coupon issuer. Never list fabricated, used or non-transferable codes.",
  },
  {
    id: "stock-content",
    title: "Stock Content Library",
    kicker: "License your creativity beyond a single post",
    hook: "A strong photo, clip or creative asset can keep finding new uses. Build a searchable library of original content that buyers can discover for their projects.",
    audience: "Photographers, videographers, designers and creators who own the rights to useful original media.",
    route: "/stock-content-library",
    cta: "Open Stock Content Library",
    image: sectionPosters.photoRestoration,
    icon: PackageOpen,
    income: ["Eligible sales or licensing opportunities available in the library", "Repeat discovery of uploaded original assets", "A portfolio organized for buyer search", "Another revenue path for work already created"],
    steps: ["Select technically strong content you fully own.", "Add precise titles, descriptions and searchable details.", "Choose the available listing or licensing options.", "Keep releases, permissions and original files organized."],
    momentum: ["Create content with a clear practical use.", "Upload coherent collections, not random leftovers.", "Describe what is actually visible without keyword spam."],
    note: "Upload only content you own and have permission to license. Availability of paid options is shown inside the section.",
  },
  {
    id: "online-auctions",
    title: "Online Auctions",
    kicker: "Let real demand discover the price",
    hook: "For distinctive items, a competitive auction can reveal what interested buyers are prepared to pay. A trusted listing is where every strong bid begins.",
    audience: "Sellers of eligible collectibles, art, design pieces, fashion and electronics suited to competitive bidding.",
    route: "/auction",
    cta: "Create an auction",
    image: sectionPosters.marketplace,
    icon: Gavel,
    income: ["Seller proceeds from completed winning transactions", "Competitive bids on eligible items", "A seller balance based on completed sales", "Withdrawal tools available within the auction flow"],
    steps: ["Choose an item that benefits from competitive bidding.", "Add accurate condition details, photos and auction terms.", "Set the auction and respond to genuine questions.", "Complete delivery and follow the transaction status to payout."],
    momentum: ["Document authenticity and condition.", "Use clear photos of details and defects.", "Set terms you can fulfil after the winning bid."],
    note: "Bids and listings do not guarantee completion. Seller proceeds depend on a completed eligible transaction.",
  },
  {
    id: "antique-appraisal",
    title: "Antique Appraisal",
    kicker: "Understand the story before you choose to sell",
    hook: "Knowledge can improve the next decision. Use appraisal tools to research an object, document what makes it interesting and prepare a more credible path toward a sale.",
    audience: "Collectors and owners researching antiques or collectible objects before listing, insuring or selling them.",
    route: "/antique-appraisal",
    cta: "Appraise an item",
    image: sectionPosters.marketplace,
    icon: Sparkles,
    income: ["Better-informed preparation for a possible sale", "Organized item details for future listings", "Research support for single items or batches", "A clearer understanding of factors that may affect value"],
    steps: ["Upload clear images of the real object and its marks.", "Add everything known about origin, material and condition.", "Review the analysis as guidance—not a guaranteed sale price.", "Use professional verification where high value or authenticity matters."],
    momentum: ["Photograph signatures, damage and construction details.", "Keep provenance documents together.", "Do not present an AI estimate as a certified valuation."],
    note: "Appraisal tools support research and may cost AI credits. They do not themselves pay income or guarantee market value.",
  },
  {
    id: "live-concerts",
    title: "Live Concerts",
    kicker: "Turn your next performance into a ticketed room",
    hook: "Your stage can travel with your audience. Schedule a live concert, set ticket options and earn from both attendance and the moments that inspire paid gifts.",
    audience: "Musicians, singers and performers ready to host a reliable live online show.",
    route: "/live-concerts",
    cta: "Open Artist Studio",
    image: sectionPosters.livestream,
    icon: Music,
    income: ["80% of completed ticket revenue", "80% of eligible paid gifts received during concerts", "Custom ticket types and pricing", "A live earnings view for hosts"],
    steps: ["Create your artist profile in Artist Studio.", "Schedule the concert and configure ticket choices.", "Promote the date and prepare a stable live setup.", "Perform for ticket holders and track completed earnings."],
    momentum: ["Announce a specific experience, not just a stream.", "Rehearse audio, lighting and connection first.", "Give VIP or premium tickets a meaningful benefit."],
    note: "The artist share is calculated from completed eligible ticket and gift transactions; 20% is the platform share.",
  },
  {
    id: "stand-up-comedy",
    title: "Comedy Club — Stand-up",
    kicker: "Build a room around your best material",
    hook: "A sharp set deserves an audience. Create your comedian profile, schedule a live show and turn viewers into ticket holders and supporters.",
    audience: "Stand-up comedians and comedy performers with original material suitable for the platform.",
    route: "/comedy-club",
    cta: "Open Comedian Studio",
    image: sectionPosters.comedyClub,
    icon: Mic2,
    income: ["Ticket revenue from scheduled live shows", "Eligible tips from the audience", "A comedian profile for future performances", "Ratings and repeat audience growth"],
    steps: ["Create your comedian profile and stage identity.", "Schedule a show and set up its ticket options.", "Promote the performance and test the live setup.", "Go live, engage the audience and follow earnings in your tools."],
    momentum: ["Sell the premise of the show in one sentence.", "Use original material and a memorable title.", "End with a reason for viewers to follow the next show."],
    note: "Income depends on completed ticket purchases and eligible audience tips. Scheduling a show does not guarantee sales.",
  },
];

const EarnMoneyGuide = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  return (
    <>
      <FloatingHowItWorks
        title="How Earn Money works"
        steps={[
          { title: "Choose your path", desc: "Match a section to your skills, content, audience or items." },
          { title: "Open the guide", desc: "Review the real earning model, requirements and practical steps." },
          { title: "Build trust", desc: "Publish accurate offers and deliver genuine value consistently." },
          { title: "Track results", desc: "Follow completed sales, rewards and eligible payouts in your account." },
        ]}
      />

      <div className="emg-page min-h-screen bg-background">
        <header className="emg-hero relative min-h-[430px] overflow-hidden border-b border-border">
          <img
            src={sectionPosters.marketplace}
            alt="Creators and professionals building income on Unique"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/45" />
          <div className="relative mx-auto flex min-h-[430px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-5 gap-2 border border-primary/25 bg-primary/10 text-primary hover:bg-primary/10">
                <BadgeEuro className="h-4 w-4" /> Unique Income Playbook
              </Badge>
              <h1 className="text-4xl font-black leading-tight text-foreground sm:text-6xl">
                Earn money with what you know, create and do.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Explore every earning path on Unique. Pick the one that fits you, follow the exact steps and go directly to the right section when you are ready.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-foreground">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Real platform opportunities</span>
                <span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Multiple income paths</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Direct action steps</span>
              </div>
            </div>
          </div>
        </header>

        <nav aria-label="Earn Money sections" className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {earnGuides.map((guide) => (
              <Link
                key={guide.id}
                to={`/earn-money#${guide.id}`}
                className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-5 border-b border-border pb-10 md:grid-cols-3">
            {[
              { icon: Lightbulb, title: "Start with your advantage", text: "Choose the path closest to your real skill, audience, content or assets." },
              { icon: ShieldCheck, title: "Build earning trust", text: "Accurate listings, reliable delivery and genuine engagement are what bring people back." },
              { icon: TrendingUp, title: "Stack compatible paths", text: "A creator can combine courses, services, videos, gifts and live events over time." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-16">
            {earnGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <section id={guide.id} key={guide.id} className="emg-section scroll-mt-36 border-b border-border pb-16 last:border-b-0">
                  <div className={`grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] ${index % 2 ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" : ""}`}>
                    <div className={`relative aspect-[16/10] overflow-hidden rounded-lg border border-border ${index % 2 ? "lg:order-2" : ""}`}>
                      <img src={guide.image} alt={`${guide.title} earning opportunity`} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-3 text-foreground">
                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background/90 shadow-sm"><Icon className="h-5 w-5 text-primary" /></span>
                        <span className="font-bold">{guide.title}</span>
                      </div>
                    </div>

                    <div className={index % 2 ? "lg:order-1" : ""}>
                      <p className="text-sm font-bold uppercase text-primary">{guide.kicker}</p>
                      <h2 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">{guide.title}</h2>
                      <p className="mt-4 text-base leading-7 text-muted-foreground">{guide.hook}</p>
                      <p className="mt-4 border-l-2 border-accent pl-4 text-sm leading-6 text-foreground"><strong>Best for:</strong> {guide.audience}</p>

                      <div className="mt-7 grid gap-7 sm:grid-cols-2">
                        <div>
                          <h3 className="flex items-center gap-2 font-bold text-foreground"><BadgeEuro className="h-5 w-5 text-primary" /> How money can come in</h3>
                          <ul className="mt-3 space-y-2">
                            {guide.income.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h3 className="flex items-center gap-2 font-bold text-foreground"><ArrowRight className="h-5 w-5 text-accent" /> Start step by step</h3>
                          <ol className="mt-3 space-y-2">
                            {guide.steps.map((item, stepIndex) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-black text-accent">{stepIndex + 1}</span>{item}</li>)}
                          </ol>
                        </div>
                      </div>

                      <div className="mt-7 rounded-lg border border-border bg-muted/40 p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><Megaphone className="h-4 w-4 text-primary" /> What improves your chances</h3>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                          {guide.momentum.map((item) => <span key={item} className="text-sm text-muted-foreground">• {item}</span>)}
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Important:</strong> {guide.note}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button asChild variant="hero">
                          <Link to={guide.route}>{guide.cta}<ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                        {guide.secondaryRoute && guide.secondaryCta && (
                          <Button asChild variant="outline">
                            <Link to={guide.secondaryRoute}>{guide.secondaryCta}<ArrowRight className="h-4 w-4" /></Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
};

export default EarnMoneyGuide;