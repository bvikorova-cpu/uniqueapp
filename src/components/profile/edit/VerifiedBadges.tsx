import { BadgeCheck, Phone, IdCard, CreditCard, AtSign } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export interface VerifiedBadgesState {
  email: boolean;
  phone: boolean;
  id: boolean;
  payment: boolean;
}

interface Props {
  state: VerifiedBadgesState;
  onStartVerification: (kind: keyof VerifiedBadgesState) => void;
}

const ITEMS: { key: keyof VerifiedBadgesState; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "email", label: "Email", icon: AtSign, desc: "Verified via login" },
  { key: "phone", label: "Phone", icon: Phone, desc: "Add & verify your phone number" },
  { key: "id", label: "Identity", icon: IdCard, desc: "Submit a valid ID document" },
  { key: "payment", label: "Payment", icon: CreditCard, desc: "Add a card or Stripe Connect" },
];

export const VerifiedBadges = ({ state, onStartVerification }: Props) => {
  const verifiedCount = Object.values(state).filter(Boolean).length;

  return (
    <>
      <FloatingHowItWorks title={"Verified Badges - How it works"} steps={[{ title: 'Open', desc: 'Access the Verified Badges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Verified Badges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-sky-400" />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Verified Badges</p>
            <p className="text-base font-black bg-gradient-to-r from-sky-300 to-blue-400 bg-clip-text text-transparent">
              {verifiedCount}/{ITEMS.length} confirmed
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ITEMS.map(({ key, label, icon: Icon, desc }) => {
          const verified = state[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => !verified && onStartVerification(key)}
              disabled={verified}
              className={`relative text-left p-3 rounded-xl border transition-all ${
                verified
                  ? "bg-sky-500/10 border-sky-400/40"
                  : "bg-muted/20 border-border/40 hover:border-sky-400/40 hover:bg-sky-500/5 cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`h-4 w-4 ${verified ? "text-sky-400" : "text-muted-foreground"}`} />
                <p className="text-sm font-bold">{label}</p>
                {verified && <BadgeCheck className="h-4 w-4 text-sky-400 ml-auto" />}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {verified ? "Verified ✓" : desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
};
