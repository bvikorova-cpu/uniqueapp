# Button audit

Scanned **3224** files, flagged **16** potentially inert `<Button>` usages.

Heuristic: a Button is flagged when its opening tag has no `onClick`, `asChild`, `type="submit"`, `form=`, spread props, or a shadcn trigger parent. False positives are expected — please review each entry.

## src/components/common/HowItWorksButton.tsx

- L64: `<Button type="button" variant="ghost" size="icon" className={`h-9 w-9 rounded-full border border-border/50 bg-background`

## src/components/dating/FriendCirclesPanel.tsx

- L75: `<Button size="sm" className="gap-1.5">`

## src/components/dating/MatchPollCard.tsx

- L81: `<Button size="sm" variant="outline" className="h-7 gap-1">`

## src/components/pet-translator/PetCrossPromo.tsx

- L36: `<Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">`

## src/components/rewards/RewardsGuilds.tsx

- L139: `<Button size="sm">`

## src/components/stock-content/LicenseSelectorDialog.tsx

- L115: `<Button className="w-full" size="sm">`

## src/components/stock-content/ResolutionSelectorDialog.tsx

- L75: `<Button className="w-full" size="sm">`

## src/pages/Cooking.tsx

- L1468: `<Button size="sm" variant="premium" className="pointer-events-none">`

## src/pages/CouponMarketplace.tsx

- L630: `<Button className="gap-2">`

## src/pages/Dating.tsx

- L1358: `<Button variant="outline" className="gap-2 text-destructive hover:text-destructive">`

## src/pages/Vacationer.tsx

- L171: `<Button>`
- L237: `<Button variant="ghost" size="sm" className="text-destructive">`

## src/pages/education/StudyGroups.tsx

- L89: `<Button variant="outline" size="sm">`
- L97: `<Button size="sm">`

## src/pages/fundraising/FundraisingHub.tsx

- L77: `<Button size="lg" className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-r`

## src/pages/jobs/Referrals.tsx

- L68: `<Button>`
