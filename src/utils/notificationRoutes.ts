// Centralized routing for notifications. Returns the path to navigate to.
// Always returns *something* so a click never feels broken.
export interface NotifLike {
  type?: string | null;
  action_url?: string | null;
  post_id?: string | null;
  comment_id?: string | null;
  related_id?: string | null;
  actor_id?: string | null;
}

export function getNotificationRoute(n: NotifLike): string {
  // 1) Explicit action_url always wins
  if (n.action_url && n.action_url.trim()) return n.action_url;

  const t = (n.type || "").toLowerCase();

  // 2) Type-based routing (specific verticals)
  const typeMap: Record<string, string> = {
    // Friends
    friend_request: "/friends?tab=requests",
    friend_accepted: n.actor_id ? `/profile/${n.actor_id}` : "/friends",

    // Friend quests
    friend_quest_invite: "/rewards?tab=friend-quests",
    friend_quest_accepted: "/rewards?tab=friend-quests",
    friend_quest_rejected: "/rewards?tab=friend-quests",

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
    post_like: "/wall",
    post_comment: "/wall",
    post_share: "/wall",

    // Course/education
    course_enrollment: "/education",
    course_completed: "/education/certificates",
    certificate_issued: "/education/certificates",
  };

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
