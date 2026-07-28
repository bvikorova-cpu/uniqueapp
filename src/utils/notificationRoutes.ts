// Centralized routing for notifications. Returns the path to navigate to.
// Always returns *something* so a click never feels broken.
export interface NotifLike {
  type?: string | null;
  action_url?: string | null;
  post_id?: string | null;
  comment_id?: string | null;
  related_id?: string | null;
  actor_id?: string | null;
  metadata?: Record<string, any> | null;
}

export function getNotificationRoute(n: NotifLike): string {
  // 1) Explicit action_url always wins
  if (n.action_url && n.action_url.trim()) return n.action_url;

  const t = (n.type || "").toLowerCase();

  // Brain Duel: when the notification carries a match, jump straight into the duel
  const duelMatchId = n.metadata?.match_id || n.metadata?.matchId;
  const duelChallengeId = n.metadata?.challenge_id || n.metadata?.challengeId;
  if (t.startsWith("brain_duel_challenge")) {
    if (duelMatchId) return `/brain-duel?match_id=${duelMatchId}`;
    if (duelChallengeId) return `/brain-duel?challenge_id=${duelChallengeId}`;
  }

  // 2) Type-based routing (specific verticals)
  const typeMap: Record<string, string> = {
    // Friends
    friend_request: "/friends?tab=requests",
    friend_accepted: n.actor_id ? `/profile/${n.actor_id}` : "/friends",

    // Friend quests
    friend_quest_invite: "/rewards?tab=friend-quests",
    friend_quest_accepted: "/rewards?tab=friend-quests",
    friend_quest_rejected: "/rewards?tab=friend-quests",

    // Brain Duel
    brain_duel_challenge: "/brain-duel#friend-challenges",
    brain_duel_challenge_accepted: "/brain-duel#friend-challenges",
    brain_duel_challenge_declined: "/brain-duel#friend-challenges",
    brain_duel_challenge_cancelled: "/brain-duel#friend-challenges",
    brain_duel_challenge_expired: "/brain-duel#friend-challenges",


    // Secret Santa
    secret_santa_gift: "/secret-santa?tab=received",
    secret_santa_received: "/secret-santa?tab=received",
    secret_santa_thanks: "/secret-santa?tab=sent",
    secret_santa_match: "/secret-santa",
    secret_santa: "/secret-santa",

    // Jobs / employer
    job_match: "/jobs",
    job_application: "/employer-dashboard",
    job_offer: "/jobs",
    verification_request: "/admin/verifications",

    // Payouts / withdrawals
    masterchef_payout: "/admin/masterchef-payouts",
    masterchef_withdrawal: "/admin/withdrawals",
    musician_withdrawal: "/admin/withdrawals",
    instructor_withdrawal: "/admin/withdrawals",
    campaign_withdrawal: "/admin/campaign-withdrawals",
    influencer_withdrawal: "/admin/influencer-payouts",

    // Rewards / XP
    weekly_xp_winner: "/rewards",
    weekly_xp_leaderboard: "/rewards",
    xp_milestone: "/rewards",
    xp_gift_received: "/rewards?tab=gift-xp",
    xp_gift_sent: "/rewards?tab=gift-xp",
    achievement: "/education/achievements",

    // Skills Marketplace
    skill_marketplace_response: n.related_id ? `/skills-marketplace/${n.related_id}` : "/skills-marketplace/mine",
    skill_order_new: "/skills-marketplace/orders",
    skill_order_paid: "/skills-marketplace/orders",
    skill_order_completed: "/skills-marketplace/orders",
    skill_order_cancelled: "/skills-marketplace/orders",

    // Messaging
    message: "/wall/messages",
    new_message: "/wall/messages",
    direct_message: "/wall/messages",

    // Brand collaborations
    brand_collab_invite: "/brand-dashboard",
    brand_collab_accepted: "/brand-dashboard",
    brand_collab_payout: "/brand-dashboard",

    // Fundraising
    fundraising_donation: "/fundraising",
    campaign_donation: "/fundraising",

    // Groups / Pages / Events
    group_invite: "/wall/groups",
    group_post: "/wall/groups",
    page_follow: "/wall/pages",
    page_post: "/wall/pages",
    event_invite: "/wall/events",
    event_reminder: "/wall/events",

    // Stories / posts / wall
    story_view: "/wall",
    story_reaction: "/wall",
    story_reply: "/wall/messages",
    post_like: "/wall",
    post_comment: "/wall",
    post_share: n.post_id ? `/post/${n.post_id}` : "/wall",
    video_like: n.post_id ? `/post/${n.post_id}` : "/wall",
    megatalent_comment: "/megatalent",

    // Credits / billing
    gift_credits: "/ai-credits",
    monthly_credits: "/ai-credits",
    xp_bet_lost: "/rewards",
    admin_withdrawal: "/admin/withdrawals",
    job_listing_activated: "/employer-dashboard",
    job_listing_renewed: "/employer-dashboard",
    job_listing_payment_failed: "/employer-dashboard",


    // Course/education
    course_enrollment: "/education",
    course_completed: "/education/certificates",
    certificate_issued: "/education/certificates",

    // User-to-user interactions
    comment: n.post_id ? `/post/${n.post_id}` : "/wall",
    comment_reply: n.post_id ? `/post/${n.post_id}` : "/wall",
    comment_reaction: n.post_id ? `/post/${n.post_id}` : "/wall",
    mention: n.post_id ? `/post/${n.post_id}` : "/wall",
    group_message: "/wall/groups",
    dating_match: "/dating",
    dating_message: "/dating",
    dating_like: "/dating",
    dating_super_like: "/dating",
    forum_comment: "/megaforum",
    forum_like: "/megaforum",
    bazaar_message: "/bazaar",
    bazaar_order: "/bazaar",
    creator_message: "/influ-king",
    creator_gift: "/influencer/earnings",

    // InfluKing / creator economy
    tip_received: "/influencer/earnings",
    new_subscriber: "/influencer/earnings",
    creator_purchase: "/influencer/earnings",
    fan_club_post: "/influ-king",
    brand_deal_application: "/influ-king",
    brand_deal_status: "/influ-king",
    challenge_reviewed: "/influ-king",
    live_stream_started: "/influ-king",

    coffee_match: "/coffee",
    coffee_message: "/coffee" };



  if (typeMap[t]) return typeMap[t];

  // 3) Generic fallbacks driven by available IDs
  if (n.post_id) return `/post/${n.post_id}`;
  if (n.comment_id && n.post_id) return `/post/${n.post_id}#comment-${n.comment_id}`;
  if (t === "follow" && n.actor_id) return `/profile/${n.actor_id}`;
  if (t === "like" || t === "comment" || t === "reaction" || t === "repost") {
    return n.post_id ? `/post/${n.post_id}` : "/wall";
  }
  if (n.actor_id && (t === "mention" || t === "tag")) return `/profile/${n.actor_id}`;

  // 4) Final fallback: notifications center
  return "/notifications";
}
