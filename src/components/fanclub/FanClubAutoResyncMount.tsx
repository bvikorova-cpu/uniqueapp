import useFanClubAutoResync from "@/hooks/useFanClubAutoResync";

/** Headless mount for background fan-club Stripe reconciliation. */
export const FanClubAutoResyncMount = () => {
  useFanClubAutoResync();
  return null;
};

export default FanClubAutoResyncMount;
