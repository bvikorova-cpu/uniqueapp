import { useReferralCapture } from "@/hooks/useReferralCapture";

/** Invisible mount that captures ?ref=CODE and claims attribution post-login. */
export const ReferralCaptureMount = () => {
  useReferralCapture();
  return null;
};
