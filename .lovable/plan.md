

# Emotion Economy Network — Cinematic Hub 2.0 Redesign

## Overview
Full transformation of the Emotion Economy section from a basic tab-based layout into the Cinematic Hub 2.0 architecture with "Emotional Aurora" visual style, maximalist animations, hero video, and 4 new AI-powered features.

## Visual Direction
- **Theme**: Emotional Aurora — flowing aurora borealis gradients (pink → violet → cyan → emerald) representing different emotions, ethereal dark atmosphere
- **Colors**: Pink (#ec4899), Violet (#8b5cf6), Cyan (#06b6d4), Emerald (#10b981) on deep dark backgrounds
- **Animations**: Maximalist — floating emotion particles, pulsing glows, parallax layers, staggered entrance animations, haptic feedback

## Architecture Change
Convert from `Tabs` component to `activeView` state switcher pattern (matching all other hubs). Each feature becomes a tool card in the hub grid.

## Hero Section
- Cinematic MP4 hero video (generated via Remotion) — "Social Emotion Network" theme: connected people with visible emotion energy flows between them
- 4-stat glassmorphic overlay using `useLiveStats` hook (Active Traders, Emotions Mined Today, Market Volume, Online Now)
- 3-column engagement row (Daily Streak, Portfolio Value, Achievements)

## Existing Features (Redesigned)
All 6 existing sub-pages get the aurora glassmorphic treatment with back-to-hub navigation:
1. **Emotion Feed** — AI-analyzed social posts (1 credit/post)
2. **Emotion Wallet** — Portfolio with aurora-styled balance cards
3. **Emotion Market** — Trading marketplace with live listings
4. **Emotion Mining** — Content creation for commission
5. **Emotion Insurance** — Protection subscription plans
6. **Emotion Drops** — Mass emotion events

## New Features (4 additions)
All in English, fully functional, AI services paid via credits:

7. **Emotion Roulette** — Spin-the-wheel game: bet emotions (joy, love, motivation), wheel animation picks outcome, win 2x or lose. Uses Supabase for tracking bets/results. Entry fee: 1 credit per spin.

8. **Emotion Leaderboard** — Global rankings with 3 tabs: Top Traders (by volume), Top Miners (by commission earned), Richest Wallets (by total balance). Real-time data from Supabase tables. Free to view.

9. **AI Mood Therapist** — AI chat (OpenAI GPT-4o-mini) that analyzes your emotion wallet portfolio, suggests trades, gives emotional investment advice. Streaming responses. Cost: 3 credits per session.

10. **Emotion Futures** — Predict which emotions trend next week. Users place bets on emotion price direction (up/down). Resolution after 7 days. Uses Supabase for bet tracking. Entry: 2 credits per prediction.

## Technical Plan

### Files to Create
- `src/components/emotion-economy/EmotionEconomyHero.tsx` — Cinematic hero with video background + stats overlay
- `src/components/emotion-economy/EmotionEconomyEngagement.tsx` — 3-column streak/stats/achievements row
- `src/components/emotion-economy/EmotionEconomyToolCard.tsx` — Aurora-styled tool card component
- `src/components/emotion-economy/EmotionRoulette.tsx` — Wheel spin game
- `src/components/emotion-economy/EmotionLeaderboard.tsx` — Global rankings
- `src/components/emotion-economy/AIMoodTherapist.tsx` — AI chat with portfolio analysis
- `src/components/emotion-economy/EmotionFutures.tsx` — Prediction market

### Files to Modify
- `src/pages/EmotionEconomy.tsx` — Complete rewrite: tabs → activeView hub with tool grid, hero, engagement row
- `src/components/emotion-economy/EmotionFeed.tsx` — Add back button, aurora styling
- `src/components/emotion-economy/EmotionWallet.tsx` — Add back button, aurora styling
- `src/components/emotion-economy/EmotionMarket.tsx` — Add back button, aurora styling
- `src/components/emotion-economy/EmotionMining.tsx` — Add back button, aurora styling
- `src/components/emotion-economy/EmotionInsurance.tsx` — Add back button, aurora styling
- `src/components/emotion-economy/EmotionDrops.tsx` — Add back button, aurora styling

### Database Migrations
- `emotion_roulette_spins` table (user_id, bet_emotion, bet_amount, result, won, created_at)
- `emotion_futures_bets` table (user_id, emotion_type, direction, amount, resolution_date, resolved, outcome, created_at)

### Edge Functions
- `emotion-roulette-spin` — Process spin, calculate result, update wallet
- `ai-mood-therapist` — OpenAI GPT-4o-mini streaming chat with portfolio context

### Hero Video
- Generate via Remotion: abstract connected nodes with flowing aurora-colored emotion particles between them, ~15 seconds looping

## Enhancement Tips (for future)
1. **Emotion NFTs** — Mint rare emotion moments as collectible NFTs
2. **Emotion Gifting** — Send emotion packages to friends with animated delivery
3. **Emotion Challenges** — Weekly community challenges (e.g., "Mine 100 Joy")
4. **Dark Emotion Black Market** — Underground trading of negative emotions at premium prices
5. **Emotion Portfolio Advisor** — AI-generated weekly reports on your emotional investment performance
6. **Emotion Staking** — Lock emotions for time periods to earn yield

