/** Shared share-payload builder for MegaTalent submissions. */
const SITE = "https://www.uniqueapp.fun";

export function megatalentPostUrl(submissionId: string) {
  const origin = typeof window !== "undefined" && window.location.origin.includes("uniqueapp")
    ? window.location.origin
    : SITE;
  return `${origin}/megatalent/post/${submissionId}`;
}

export function buildMegatalentShare(submission: { id: string; title?: string }) {
  return {
    title: submission.title ? `${submission.title} — MegaTalent` : "MegaTalent | Unique",
    text: "Hlasuj za môj príspevok v Mega Talent 🏆 na Unique",
    url: megatalentPostUrl(submission.id),
  };
}
