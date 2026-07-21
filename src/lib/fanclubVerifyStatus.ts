/**
 * Classifies fanclub-verify outcomes into human-readable notifications
 * with a short Billing Portal how-to.
 *
 * Used by:
 *  - FanClubJoinCard (post-checkout re-verify)
 *  - FanClubMembershipsCard (Profile)
 */

export type VerifyKind =
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "pending"
  | "missing"
  | "network"
  | "auth"
  | "unknown";

export interface VerifyNotice {
  kind: VerifyKind;
  title: string;
  reason: string;
  portalSteps: string[];
  tone: "success" | "warn" | "error" | "info";
  showPortal: boolean;
  showRetry: boolean;
}

const PORTAL_STEPS_PAST_DUE = [
  "Open Billing Portal → Payment methods.",
  "Add or update a valid card (Stripe will retry the failed invoice).",
  "Go to Invoices and pay any invoice marked Open.",
  "Come back and click Re-verify.",
];

const PORTAL_STEPS_CANCELED = [
  "In Billing Portal, current subscription shows Canceled.",
  "To rejoin, close the portal and click Subscribe on the tier you want.",
  "A brand new subscription will be created — the old one stays canceled in your history.",
];

const PORTAL_STEPS_MISSING = [
  "Open Billing Portal → Invoices to confirm the charge went through.",
  "If you see the charge but no active subscription, it may still be provisioning — wait 30s and Re-verify.",
  "If the charge is missing entirely, the checkout was not completed — start Subscribe again.",
];

const PORTAL_STEPS_PENDING = [
  "Stripe is still processing your payment (SCA / bank confirmation).",
  "Open Billing Portal → Invoices and confirm the invoice status.",
  "Complete any 3-D Secure prompt from your bank.",
  "Return and Re-verify.",
];

const PORTAL_STEPS_EXPIRED = [
  "The subscription attempt expired before payment completed.",
  "Click Subscribe again to start a fresh checkout.",
  "No charges were made for the expired attempt.",
];

/** Called with the per-club result Stripe returned. */
export function classifyVerifyResult(target: {
  active: boolean;
  status: string;
} | undefined | null): VerifyNotice {
  if (target?.active) {
    return {
      kind: "active",
      title: "Membership active",
      reason: "Stripe confirmed your subscription is active. Exclusive content unlocked.",
      portalSteps: [],
      tone: "success",
      showPortal: false,
      showRetry: false,
    };
  }

  if (!target) {
    return {
      kind: "missing",
      title: "No matching subscription found",
      reason:
        "Stripe has no fan-club subscription for your account yet. If you just paid, webhooks may still be arriving.",
      portalSteps: PORTAL_STEPS_MISSING,
      tone: "warn",
      showPortal: true,
      showRetry: true,
    };
  }

  switch (target.status) {
    case "past_due":
      return {
        kind: "past_due",
        title: "Payment failed — access paused",
        reason:
          "Your last invoice couldn't be charged (declined card, insufficient funds, or expired card). Access is paused until the invoice is paid.",
        portalSteps: PORTAL_STEPS_PAST_DUE,
        tone: "error",
        showPortal: true,
        showRetry: true,
      };
    case "canceled":
      return {
        kind: "canceled",
        title: "Subscription canceled",
        reason:
          "This subscription is canceled on Stripe's side. To regain access you need to start a new subscription.",
        portalSteps: PORTAL_STEPS_CANCELED,
        tone: "error",
        showPortal: true,
        showRetry: false,
      };
    case "expired":
      return {
        kind: "expired",
        title: "Checkout expired",
        reason:
          "The Stripe checkout session expired before payment completed. No charge was made.",
        portalSteps: PORTAL_STEPS_EXPIRED,
        tone: "warn",
        showPortal: false,
        showRetry: false,
      };
    case "pending":
    case "incomplete":
      return {
        kind: "pending",
        title: "Payment still processing",
        reason:
          "Stripe is waiting on the bank (SCA / 3-D Secure). Access unlocks the moment the payment settles.",
        portalSteps: PORTAL_STEPS_PENDING,
        tone: "warn",
        showPortal: true,
        showRetry: true,
      };
    default:
      return {
        kind: "unknown",
        title: "Membership not active",
        reason: `Stripe reports status "${target.status}". Access is not currently unlocked.`,
        portalSteps: PORTAL_STEPS_MISSING,
        tone: "warn",
        showPortal: true,
        showRetry: true,
      };
  }
}

/** Called when the verify call itself failed (network / auth / server). */
export function classifyVerifyError(err: unknown): VerifyNotice {
  const msg = (err as Error)?.message?.toLowerCase() ?? "";
  if (msg.includes("auth") || msg.includes("jwt") || msg.includes("401")) {
    return {
      kind: "auth",
      title: "You're signed out",
      reason: "Sign in again — your session expired while verifying with Stripe.",
      portalSteps: [],
      tone: "error",
      showPortal: false,
      showRetry: false,
    };
  }
  return {
    kind: "network",
    title: "Couldn't reach Stripe",
    reason: (err as Error)?.message || "Network error while contacting Stripe. Please try again.",
    portalSteps: [
      "Check your connection and try Re-verify again.",
      "If it keeps failing, open Billing Portal — a successful portal load confirms Stripe is reachable.",
    ],
    tone: "error",
    showPortal: true,
    showRetry: true,
  };
}
